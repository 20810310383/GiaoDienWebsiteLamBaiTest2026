import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetchTongQuat } from '../../services/apiTongQuat';
import ChatWidget from './ChatWidget';
import { useSounds } from '../Sound/SoundContext';

const ChatContext = createContext(null);
export const useChat = () => useContext(ChatContext);
const createClientId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues) return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};
const mergeMessages = (oldItems, newItems) => {
  const keyFor = item => `${item.type === 'call' ? 'call' : 'message'}:${item._id}`;
  const map = new Map(oldItems.map(item => [keyFor(item), item]));
  for (const item of newItems) {
    const key = keyFor(item);
    const previous = map.get(key);
    map.set(key, { ...previous, ...item, deliveredAt: item.deliveredAt || previous?.deliveredAt || null, seenAt: item.seenAt || previous?.seenAt || null });
  }
  return [...map.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt) || String(a._id).localeCompare(String(b._id)) || Number(a.type === 'call') - Number(b.type === 'call'));
};
const atOrBefore = (item, cursor) => {
  const difference = new Date(item.createdAt) - new Date(cursor.createdAt);
  return difference < 0 || (difference === 0 && String(item._id) <= String(cursor._id));
};
export function ChatProvider({ children }) {
  const { token, user } = useAuth();
  const { play: playSound } = useSounds();
  const userId = String(user?._id || user?.id || '');
  const currentUser = useRef(userId);
  currentUser.current = userId;
  const [selected, setSelected] = useState(null);
  const selectedRef = useRef(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [inboxError, setInboxError] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [olderLoading, setOlderLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const selectionVersion = useRef(0);
  const inboxVersion = useRef(0);
  const refreshTimer = useRef(null);
  const readsInFlight = useRef(new Set());
  const sendKey = useRef(null);
  const notifiedMessages = useRef(new Set());
  const api = useCallback((path, method = 'GET', body) => apiFetchTongQuat(`/api/chat${path}`, { method, body, headers: { Authorization: `Bearer ${token}` } }), [token]);
  const refreshInbox = useCallback(async () => {
    if (!token) return;
    const version = ++inboxVersion.current;
    try { const res = await api('/conversations'); if (version === inboxVersion.current) { setConversations(res.items); setInboxError(false); } }
    catch { if (version === inboxVersion.current) setInboxError(true); }
  }, [api, token]);
  const scheduleInboxRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => { refreshTimer.current = null; refreshInbox(); }, 120);
  }, [refreshInbox]);
  useEffect(() => () => clearTimeout(refreshTimer.current), []);
  const receipt = useCallback(async (conversationId, ids, seen) => {
    if (!ids.length) return;
    try {
      for (let i = 0; i < ids.length; i += 100) await api(`/conversations/${conversationId}/receipt`, 'POST', { messageIds: ids.slice(i, i + 100), seen });
      if (seen) scheduleInboxRefresh();
    } catch { /* Retried on focus, reconnect, or next message. */ }
  }, [api, scheduleInboxRefresh]);
  const readThrough = useCallback(async (conversationId, through) => {
    if (!conversationId || !through?._id || document.visibilityState !== 'visible' || !document.hasFocus()) return;
    const key = `${conversationId}:${through.type === 'call' ? 'call' : 'message'}:${through._id}`;
    if (readsInFlight.current.has(key)) return;
    readsInFlight.current.add(key);
    try {
      const result = await api(`/conversations/${conversationId}/read`, 'POST', { through: through._id, throughType: through.type === 'call' ? 'call' : 'message' });
      if (currentUser.current !== userId) return;
      if (String(selectedRef.current?.conversationId) === String(conversationId)) {
        setMessages(current => current.map(item => String(item.recipientId) === userId && atOrBefore(item, result.through)
          ? { ...item, deliveredAt: item.deliveredAt || result.seenAt, seenAt: item.seenAt || result.seenAt } : item));
      }
      ++inboxVersion.current;
      setConversations(current => current.map(item => String(item.conversationId) === String(conversationId) && item.lastMessage && atOrBefore(item.lastMessage, result.through)
        ? { ...item, unread: result.unread } : item));
      scheduleInboxRefresh();
    } catch { if (currentUser.current === userId) scheduleInboxRefresh(); /* Retry on focus, reconnect, or the next message. */ }
    finally { readsInFlight.current.delete(key); }
  }, [api, scheduleInboxRefresh, userId]);
  const load = useCallback(async (conversation, before, version) => {
    const id = conversation.conversationId;
    const res = await api(`/conversations/${id}/messages${before ? `?before=${encodeURIComponent(before._id)}&beforeType=${before.type === 'call' ? 'call' : 'message'}` : ''}`);
    if (selectionVersion.current !== version) return;
    setError('');
    setMessages(current => mergeMessages(current, res.items));
    setHasMore(res.hasMore);
    const incoming = res.items.filter(item => String(item.recipientId) === userId && !item.deliveredAt);
    if (document.visibilityState === 'visible' && document.hasFocus()) readThrough(id, res.items[res.items.length - 1]);
    else receipt(id, incoming.map(item => item._id), false);
  }, [api, receipt, readThrough, userId]);
  const openConversation = useCallback(async conversation => {
    const version = ++selectionVersion.current;
    selectedRef.current = conversation; setSelected(conversation); setInboxOpen(false); setMessages([]); setHasMore(false); setError(''); setLoading(true); setSending(false); sendKey.current = null;
    try { await load(conversation, null, version); }
    catch { if (selectionVersion.current === version) setError('Không thể tải cuộc trò chuyện. Hãy thử lại.'); }
    finally { if (selectionVersion.current === version) setLoading(false); }
  }, [load]);
  const openChat = useCallback(async (classId, recipientId) => {
    const version = ++selectionVersion.current;
    selectedRef.current = null; setSelected(null); setInboxOpen(false); setMessages([]); setLoading(false); setSending(false); setError('');
    try { const conversation = await api('/conversations', 'POST', { classId, recipientId }); if (selectionVersion.current === version) await openConversation(conversation); }
    catch (err) { if (selectionVersion.current === version) { setError(err.message || 'Không thể mở cuộc trò chuyện'); setInboxOpen(true); } }
  }, [api, openConversation]);
  const close = useCallback(() => { selectionVersion.current++; selectedRef.current = null; setSelected(null); setMessages([]); setError(''); setSending(false); }, []);
  const loadOlder = useCallback(async () => {
    const conversation = selectedRef.current;
    if (!conversation || !messages.length || olderLoading) return;
    const version = selectionVersion.current; setOlderLoading(true);
    try { await load(conversation, messages[0], version); } catch { if (version === selectionVersion.current) setError('Không thể tải tin nhắn cũ.'); }
    finally { setOlderLoading(false); }
  }, [messages, olderLoading, load]);
  const send = useCallback(async text => {
    const conversation = selectedRef.current;
    if (!conversation || !text.trim() || sending) return false;
    const version = selectionVersion.current;
    if (!sendKey.current || sendKey.current.text !== text.trim() || sendKey.current.conversationId !== conversation.conversationId) sendKey.current = { text: text.trim(), conversationId: conversation.conversationId, id: createClientId() };
    const clientId = sendKey.current.id;
    setSending(true); setError('');
    try {
      const res = await api(`/conversations/${conversation.conversationId}/messages`, 'POST', { text: text.trim(), clientId });
      if (version === selectionVersion.current) { setMessages(current => mergeMessages(current, [res.message])); sendKey.current = null; }
      scheduleInboxRefresh(); return version === selectionVersion.current;
    } catch (err) { if (version === selectionVersion.current) setError(err.message || 'Gửi tin nhắn thất bại. Hãy thử lại.'); return false; }
    finally { if (version === selectionVersion.current) setSending(false); }
  }, [api, sending, scheduleInboxRefresh]);
  useEffect(() => {
    if (!token || !userId) return;
    let active = true;
    const socket = io(import.meta.env.VITE_BACKEND_URL, { auth: { token }, withCredentials: true });
    socket.on('connect', async () => {
      setConnected(true);
      window.dispatchEvent(new Event('call:reconnected'));
      try {
        let cursor = null;
        do { const result = await api('/deliver-pending', 'POST', { cursor }); cursor = result.nextCursor; } while (cursor && active);
      } catch { /* Retry on reconnect. */ }
      if (active) refreshInbox();
      const current = selectedRef.current;
      if (current && active) load(current, null, selectionVersion.current).catch(() => {});
    });
    socket.on('disconnect', () => setConnected(false));
    const updateCallHistory = conversationId => {
      scheduleInboxRefresh();
      const current = selectedRef.current;
      if (current && String(current.conversationId) === String(conversationId)) load(current, null, selectionVersion.current).catch(() => {});
    };
    socket.on('call:update', call => {
      window.dispatchEvent(new CustomEvent('call:update', { detail: call }));
      if (['ended', 'missed', 'declined'].includes(call.status)) updateCallHistory(call.conversationId);
    });
    socket.on('chat:call-history', payload => updateCallHistory(payload.conversationId));
    socket.on('chat:message', payload => {
      if (!active) return;
      const id = String(payload.conversationId), item = payload.message;
      const isSelected = String(selectedRef.current?.conversationId) === id;
      if (isSelected) setMessages(current => mergeMessages(current, [item]));
      if (String(item.recipientId) === userId) {
        const messageId = String(item._id);
        if (!notifiedMessages.current.has(messageId)) {
          notifiedMessages.current.add(messageId);
          if (notifiedMessages.current.size > 500) notifiedMessages.current.delete(notifiedMessages.current.values().next().value);
          playSound('message');
        }
        if (isSelected && document.visibilityState === 'visible' && document.hasFocus()) readThrough(id, item);
        else receipt(id, [item._id], false);
      }
      scheduleInboxRefresh();
    });
    socket.on('chat:receipt', payload => {
      if (String(selectedRef.current?.conversationId) === String(payload.conversationId)) setMessages(current => current.map(item => {
        const update = payload.messages.find(record => String(record._id) === String(item._id));
        return update ? { ...item, deliveredAt: update.deliveredAt || item.deliveredAt, seenAt: update.seenAt || item.seenAt } : item;
      }));
    });
    socket.on('chat:read', payload => {
      const id = String(payload.conversationId);
      if (String(selectedRef.current?.conversationId) === id) setMessages(current => current.map(item =>
        String(item.recipientId) === String(payload.readerId) && atOrBefore(item, payload.through)
          ? { ...item, deliveredAt: item.deliveredAt || payload.seenAt, seenAt: item.seenAt || payload.seenAt } : item));
      if (String(payload.readerId) === userId) scheduleInboxRefresh();
    });
    return () => { active = false; socket.disconnect(); setConnected(false); };
  }, [token, userId, api, refreshInbox, scheduleInboxRefresh, receipt, readThrough, load, playSound]);
  useEffect(() => {
    const onFocus = () => {
      const current = selectedRef.current;
      if (!current || document.visibilityState !== 'visible' || !document.hasFocus()) return;
      if (messages.some(item => String(item.recipientId) === userId && !item.seenAt)) readThrough(current.conversationId, messages[messages.length - 1]);
    };
    window.addEventListener('focus', onFocus); document.addEventListener('visibilitychange', onFocus);
    onFocus();
    return () => { window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onFocus); };
  }, [messages, readThrough, userId]);
  useEffect(() => { close(); setConversations([]); setInboxOpen(false); notifiedMessages.current.clear(); inboxVersion.current++; }, [userId, close]);
  const unread = conversations.reduce((sum, item) => sum + item.unread, 0);
  return <ChatContext.Provider value={{ openChat }}>{children}<ChatWidget {...{ selected, messages, conversations, inboxOpen, inboxError, setInboxOpen, loading, olderLoading, hasMore, sending, error, connected, userId, unread, openConversation, close, loadOlder, send, refreshInbox }} /></ChatContext.Provider>;
}
