import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button, Empty, Popover, Spin, message } from 'antd';
import { Bell, Check, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRealtime } from '../../../hook/useRealtime';
import { apiFetchTongQuat } from '../../../services/apiTongQuat';
import { approveStudent } from '../../../services/apiLopHoc';
import styles from './ApprovalBell.module.css';

export default function ApprovalBell() {
  const { token, user } = useAuth();
  const allowed = ['admin', 'giaovien'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState({});
  const pending = useRef(new Set());
  const generation = useRef(0);
  const load = useCallback(async () => {
    if (!allowed || !token) return;
    const version = ++generation.current;
    setLoading(true);
    try {
      const result = await apiFetchTongQuat('/api/lop-hoc/pending-requests', { headers: { Authorization: `Bearer ${token}` } });
      if (version === generation.current) { setItems(result.items); setError(false); }
    } catch { if (version === generation.current) setError(true); }
    finally { if (version === generation.current) setLoading(false); }
  }, [allowed, token]);
  useEffect(() => {
    setItems([]);
    load();
    return () => { generation.current++; };
  }, [load]);
  useRealtime(allowed ? token : null, { 'class:approval-notification': load, connect: load });
  const decide = async (item, status) => {
    const key = `${item.classId}:${item.studentId}`;
    if (pending.current.has(key)) return;
    pending.current.add(key);
    setBusy(previous => ({ ...previous, [key]: true }));
    try {
      await approveStudent({ classId: item.classId, studentId: item.studentId, status }, token);
      setItems(previous => previous.filter(entry => entry.classId !== item.classId || entry.studentId !== item.studentId));
      message.success(status === 'da_tham_gia' ? 'Đã duyệt học viên vào lớp' : 'Đã từ chối yêu cầu');
      await load();
    } catch { message.error('Không thể xử lý yêu cầu. Vui lòng thử lại.'); }
    finally { pending.current.delete(key); setBusy(previous => ({ ...previous, [key]: false })); }
  };
  const content = <section className={styles.panel}>
    <header><div><h3>Yêu cầu vào lớp</h3><p>Chỉ các lớp do bạn quản lý</p></div><Button type="text" aria-label="Tải lại thông báo" onClick={load} disabled={loading}><RefreshCw size={16} /></Button></header>
    {error ? <div className={styles.empty}><p>Chưa thể tải thông báo</p><Button onClick={load}>Thử lại</Button></div> : loading && !items.length ? <div className={styles.empty}><Spin /></div> : !items.length ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={allowed ? 'Không có yêu cầu chờ duyệt' : 'Chưa có thông báo'} /> :
      <div className={styles.list}>{items.map(item => {
        const key = `${item.classId}:${item.studentId}`;
        return <article key={key}><div className={styles.avatar}>{item.studentName?.[0] || 'H'}</div><div className={styles.details}><strong>{item.studentName}</strong><span>{item.studentCode} · Xin tham gia lớp</span><p>{item.className}</p><div className={styles.actions}><Button size="small" type="primary" disabled={busy[key]} onClick={() => decide(item, 'da_tham_gia')}><Check size={14} />Phê duyệt</Button><Button size="small" disabled={busy[key]} onClick={() => decide(item, 'bi_tu_choi')}><X size={14} />Từ chối</Button></div></div></article>;
      })}</div>}
  </section>;
  return <Popover content={content} trigger="click" placement="bottomRight" onOpenChange={open => { if (open) load(); }}>
    <button className={styles.bell} aria-label={`Thông báo: ${items.length} yêu cầu vào lớp`}><Badge count={items.length} size="small" overflowCount={99}><Bell size={20} /></Badge></button>
  </Popover>;
}
