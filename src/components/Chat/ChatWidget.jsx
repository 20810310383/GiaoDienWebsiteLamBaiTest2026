import { useEffect, useRef, useState } from 'react';
import { Avatar, Badge } from 'antd';
import { ArrowLeft, Check, CheckCheck, ChevronDown, LoaderCircle, MessageCircle, Send, X } from 'lucide-react';
import { getPublicUrl } from '../../utils/formatURL';
import styles from './ChatWidget.module.css';

const avatar = (person, size = 42) => <Avatar size={size} className={styles.avatar} src={person?.anh_dai_dien ? getPublicUrl(person.anh_dai_dien) : undefined}>{person?.ho_ten?.trim()?.charAt(0)?.toUpperCase() || '?'}</Avatar>;
const formatTime = date => new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const dateLabel = date => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function ChatWidget({ selected, messages, conversations, inboxOpen, inboxError, setInboxOpen, loading, olderLoading, hasMore, sending, error, connected, userId, unread, openConversation, close, loadOlder, send, refreshInbox }) {
  const [draft, setDraft] = useState('');
  const bottom = useRef(null);
  const scroller = useRef(null);
  const previous = useRef({ conversation: null, last: null, height: 0 });
  useEffect(() => { setDraft(''); previous.current = { conversation: selected?.conversationId, last: null, height: 0 }; }, [selected?.conversationId]);
  useEffect(() => {
    if (!selected || !messages.length || !scroller.current) return;
    const last = String(messages[messages.length - 1]._id);
    if (previous.current.last !== last || previous.current.conversation !== selected.conversationId) bottom.current?.scrollIntoView({ block: 'nearest' });
    else if (previous.current.height) scroller.current.scrollTop += scroller.current.scrollHeight - previous.current.height;
    previous.current = { conversation: selected.conversationId, last, height: 0 };
  }, [messages, selected]);
  const submit = async event => {
    event.preventDefault();
    const text = draft;
    if (await send(text)) setDraft(current => current === text ? '' : current);
  };
  return <div className={styles.host}>
    {selected ? <section className={styles.panel} aria-label={`Trò chuyện với ${selected.peer?.ho_ten || 'học viên'}`}>
      <header className={styles.header}>
        <button type="button" className={styles.headerButton} title="Danh sách tin nhắn" aria-label="Danh sách tin nhắn" onClick={() => { close(); setInboxOpen(true); refreshInbox(); }}><ArrowLeft size={18} /></button>
        {avatar(selected.peer, 40)}
        <div className={styles.headerInfo}><strong>{selected.peer?.ho_ten || 'Học viên'}</strong><span>{selected.className || 'Lớp học'} · {connected ? 'Đã kết nối' : 'Đang kết nối lại'}</span></div>
        <button type="button" className={styles.headerButton} aria-label="Đóng cuộc trò chuyện" title="Đóng" onClick={close}><X size={19} /></button>
      </header>
      <div className={styles.messages} ref={scroller} aria-live="polite">
        {loading ? <div className={styles.center}><LoaderCircle className={styles.spin} size={19} /> Đang tải tin nhắn...</div> : <>
          {hasMore && <button type="button" className={styles.loadOlder} disabled={olderLoading} onClick={() => { if (scroller.current) previous.current.height = scroller.current.scrollHeight; loadOlder(); }}>{olderLoading ? 'Đang tải...' : 'Xem tin nhắn trước'}</button>}
          {!messages.length && <div className={styles.empty}><div className={styles.emptyIcon}><MessageCircle size={24} /></div><strong>Bắt đầu cuộc trò chuyện</strong><span>Gửi lời chào tới {selected.peer?.ho_ten || 'bạn học'} nhé!</span></div>}
          {messages.map((item, index) => {
            const mine = String(item.senderId) === userId;
            const showDate = index === 0 || dateLabel(messages[index - 1].createdAt) !== dateLabel(item.createdAt);
            return <div key={item._id}>{showDate && <div className={styles.dateDivider}><span>{dateLabel(item.createdAt)}</span></div>}<div className={`${styles.messageRow} ${mine ? styles.mine : styles.theirs}`}>
              {!mine && avatar(selected.peer, 26)}
              <div className={styles.messageContent}><div className={styles.bubble}>{item.text}</div><div className={styles.messageMeta}><time>{formatTime(item.createdAt)}</time>{mine && <span className={item.seenAt ? styles.seen : ''}>{item.seenAt ? <><CheckCheck size={13} /> Đã xem</> : item.deliveredAt ? <><CheckCheck size={13} /> Đã nhận</> : <><Check size={13} /> Đã gửi</>}</span>}</div></div>
            </div></div>;
          })}<div ref={bottom} />
        </>}
      </div>
      {error && <div className={styles.error} role="alert">{error}</div>}
      <form className={styles.composer} onSubmit={submit}><textarea aria-label="Nội dung tin nhắn" placeholder="Nhập tin nhắn..." value={draft} maxLength={2000} rows={1} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!sending && draft.trim()) submit(event); } }} /><button type="submit" aria-label="Gửi tin nhắn" title="Gửi tin nhắn" disabled={!draft.trim() || sending}>{sending ? <LoaderCircle className={styles.spin} size={18} /> : <Send size={18} />}</button></form>
      <div className={styles.composerHint}>Enter để gửi · Shift + Enter xuống dòng</div>
    </section> : inboxOpen ? <section className={`${styles.panel} ${styles.inbox}`} aria-label="Tin nhắn">
      <header className={styles.inboxHeader}><div><span>TRÒ CHUYỆN</span><h2>Tin nhắn</h2></div><button type="button" className={styles.headerButton} aria-label="Thu gọn tin nhắn" onClick={() => setInboxOpen(false)}><ChevronDown size={20} /></button></header>
      {error && <div className={styles.error} role="alert">{error}</div>}
      {inboxError && <div className={styles.error} role="alert">Không thể cập nhật danh sách tin nhắn. <button type="button" onClick={refreshInbox}>Thử lại</button></div>}
      <div className={styles.inboxList}>{conversations.length ? conversations.map(item => <button type="button" className={styles.conversation} key={item.conversationId} onClick={() => openConversation(item)}>{avatar(item.peer, 46)}<div className={styles.conversationInfo}><div><strong>{item.peer?.ho_ten || 'Học viên'}</strong><time>{item.lastMessage?.createdAt && formatTime(item.lastMessage.createdAt)}</time></div><small>{item.className}</small><p>{item.lastMessage?.text}</p></div>{item.unread > 0 && <span className={styles.unread}>{item.unread > 99 ? '99+' : item.unread}</span>}</button>) : <div className={styles.empty}><div className={styles.emptyIcon}><MessageCircle size={24} /></div><strong>Chưa có cuộc trò chuyện</strong><span>Chọn học viên trong lớp để bắt đầu nhắn tin.</span></div>}</div>
    </section> : <Badge count={unread} overflowCount={99} offset={[-3, 3]}><button type="button" className={styles.launcher} aria-label={`Tin nhắn${unread ? `, ${unread} tin chưa xem` : ''}`} onClick={() => { setInboxOpen(true); refreshInbox(); }}><MessageCircle size={23} /><span>Tin nhắn</span></button></Badge>}
  </div>;
}
