import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetchTongQuat } from '../../services/apiTongQuat';
import CallPanel from './CallPanel';

const Context = createContext(null);
export const useCall = () => useContext(Context);
const active = call => call && ['ringing', 'accepted'].includes(call.status);
export function CallProvider({ children }) {
  const { token, user } = useAuth();
  const userId = String(user?._id || user?.id || '');
  const [call, setCall] = useState(null);
  const callRef = useRef(null);
  const [owner, setOwner] = useState(null);
  const ownerRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const eventVersion = useRef(0);
  const endedIds = useRef(new Set());
  const channel = useRef(null);
  const storageKey = `call-tab:${userId}`;
  const api = useCallback((path, method = 'GET', body) => apiFetchTongQuat(`/api/calls${path}`, { method, body, headers: { Authorization: `Bearer ${token}` } }), [token]);
  const setOwnership = useCallback(id => {
    ownerRef.current = id; setOwner(id);
    try { if (id) sessionStorage.setItem(storageKey, id); else sessionStorage.removeItem(storageKey); } catch { /* Storage may be unavailable. */ }
  }, [storageKey]);
  const claimOwnership = useCallback(id => {
    setOwnership(id);
    channel.current?.postMessage({ callId: id });
  }, [setOwnership]);
  useEffect(() => { eventVersion.current++; callRef.current = null; setCall(null); setOwner(null); ownerRef.current = null; endedIds.current.clear(); }, [userId]);
  useEffect(() => {
    if (!userId || typeof BroadcastChannel === 'undefined') return;
    const next = new BroadcastChannel(`call-owner:${userId}`);
    channel.current = next;
    next.onmessage = event => {
      if (event.data?.callId && event.data.callId === ownerRef.current) setOwnership(null);
    };
    return () => { next.close(); if (channel.current === next) channel.current = null; };
  }, [userId, setOwnership]);
  const apply = useCallback(next => {
    if (!next?._id) return;
    const id = String(next._id), current = callRef.current;
    if (endedIds.current.has(id) && active(next)) return;
    if (current && String(current._id) !== id && active(current)) return;
    if (current && String(current._id) === id && current.status === 'accepted' && next.status === 'ringing') return;
    if (!active(next)) {
      endedIds.current.add(id);
      if (!current || String(current._id) !== id) return;
      if (String(ownerRef.current) === id) setOwnership(null);
    }
    eventVersion.current++;
    callRef.current = next; setCall(next);
  }, [setOwnership]);
  const sync = useCallback(async () => {
    if (!token || !userId) return;
    const version = eventVersion.current;
    try {
      const current = callRef.current;
      const result = await api(active(current) ? `/current?callId=${encodeURIComponent(current._id)}` : '/current');
      if (version !== eventVersion.current) return;
      if (result.call) {
        apply(result.call);
        try { if (sessionStorage.getItem(storageKey) === String(result.call._id)) { ownerRef.current = String(result.call._id); setOwner(String(result.call._id)); } } catch { /* Ignore unavailable storage. */ }
      } else if (active(callRef.current)) {
        const ended = { ...callRef.current, status: 'ended' }; apply(ended);
      }
    } catch { /* Reconnect or the next user action retries. */ }
  }, [api, apply, storageKey, token, userId]);
  useEffect(() => {
    if (!token || !userId) return;
    const update = event => apply(event.detail);
    const reconnect = () => sync();
    window.addEventListener('call:update', update); window.addEventListener('call:reconnected', reconnect);
    sync();
    return () => { window.removeEventListener('call:update', update); window.removeEventListener('call:reconnected', reconnect); };
  }, [token, userId, apply, sync]);
  useEffect(() => {
    if (!call || call.status !== 'ringing') return;
    const delay = Math.max(0, new Date(call.expiresAt).getTime() - Date.now()) + 500;
    const timer = setTimeout(sync, delay);
    return () => clearTimeout(timer);
  }, [call?._id, call?.status, call?.expiresAt, sync]);
  useEffect(() => {
    if (!call || call.status !== 'accepted' || owner !== String(call._id)) return;
    let stopped = false;
    const heartbeat = async () => {
      try { await api(`/${call._id}/heartbeat`, 'POST', {}); }
      catch (err) {
        if (!stopped && /403|409|không có quyền|đã kết thúc/i.test(err.message || '')) { setError('Cuộc gọi đã kết thúc hoặc bạn không còn quyền tham gia.'); apply({ ...call, status: 'ended' }); }
      }
    };
    heartbeat(); const timer = setInterval(heartbeat, 20000);
    return () => { stopped = true; clearInterval(timer); };
  }, [call?._id, call?.status, owner, api, apply]);
  useEffect(() => {
    if (!token) return;
    const onPageHide = () => {
      const current = callRef.current;
      if (active(current) && ownerRef.current === String(current._id)) {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/calls/${current._id}/end`, { method: 'POST', keepalive: true, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
      }
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [token]);
  const handleStartError = useCallback((err, mode) => {
    if (err.code === 'CALLEE_BUSY' && !active(callRef.current)) {
      const peer = err.data?.peer;
      const result = { _id: `busy-${Date.now()}-${Math.random().toString(36).slice(2)}`, status: 'busy', mode, callerId: userId, calleeId: peer?._id, callee: peer };
      eventVersion.current++;
      setError(''); callRef.current = result; setCall(result);
      return;
    }
    message.error(err.message || 'Không thể bắt đầu cuộc gọi');
    sync();
  }, [userId, sync]);
  const startConversationCall = useCallback(async (conversationId, mode) => {
    if (busyRef.current || active(callRef.current)) { message.warning('Bạn đang có một cuộc gọi.'); return; }
    busyRef.current = true; setBusy(true); setError('');
    try {
      const result = await api('/', 'POST', { conversationId, mode });
      if (!endedIds.current.has(String(result.call._id))) { claimOwnership(String(result.call._id)); apply(result.call); }
      else sync();
    } catch (err) { handleStartError(err, mode); }
    finally { busyRef.current = false; setBusy(false); }
  }, [api, apply, claimOwnership, sync, handleStartError]);
  const startCall = useCallback(async (classId, recipientId, mode) => {
    if (busyRef.current || active(callRef.current)) { message.warning('Bạn đang có một cuộc gọi.'); return; }
    busyRef.current = true; setBusy(true);
    try {
      const result = await apiFetchTongQuat('/api/chat/conversations', { method: 'POST', body: { classId, recipientId }, headers: { Authorization: `Bearer ${token}` } });
      const response = await api('/', 'POST', { conversationId: result.conversationId, mode });
      if (!endedIds.current.has(String(response.call._id))) { claimOwnership(String(response.call._id)); apply(response.call); }
      else sync();
    } catch (err) { handleStartError(err, mode); }
    finally { busyRef.current = false; setBusy(false); }
  }, [token, api, apply, claimOwnership, sync, handleStartError]);
  const accept = useCallback(async () => {
    const current = callRef.current; if (!current || busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(''); claimOwnership(String(current._id));
    try { const result = await api(`/${current._id}/accept`, 'POST', {}); apply(result.call); }
    catch (err) { setOwnership(null); setError(err.message || 'Không thể nhận cuộc gọi'); sync(); }
    finally { busyRef.current = false; setBusy(false); }
  }, [api, apply, claimOwnership, setOwnership, sync]);
  const end = useCallback(async () => {
    const current = callRef.current; if (!current || busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try { const result = await api(`/${current._id}/end`, 'POST', {}); apply(result.call); }
    catch (err) { setError(err.message || 'Không thể kết thúc cuộc gọi'); sync(); }
    finally { busyRef.current = false; setBusy(false); }
  }, [api, apply, sync]);
  const dismiss = () => { if (!active(callRef.current)) { callRef.current = null; setCall(null); setError(''); } };
  return <Context.Provider value={{ startCall, startConversationCall }}>
    {children}
    {call && <CallPanel call={call} userId={userId} token={token} owner={owner === String(call._id)} busy={busy} error={error} setError={setError} accept={accept} end={end} dismiss={dismiss} claim={() => claimOwnership(String(call._id))} />}
  </Context.Provider>;
}
