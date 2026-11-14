import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Award, BookOpen, CalendarDays, GraduationCap, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetchTongQuat } from '../../services/apiTongQuat';
import styles from './Home.module.css';

const number = value => Number(value || 0).toFixed(1);
const fillDays = (daily, days) => {
  const values = new Map((daily || []).map(item => [item._id, item]));
  return Array.from({ length: days }, (_, index) => {
    const date = dayjs().subtract(days - 1 - index, 'day');
    const item = values.get(date.format('YYYY-MM-DD'));
    return { date: date.format('DD/MM'), fullDate: date.format('DD/MM/YYYY'), attempts: item?.attempts || 0, average: item ? Number(item.average.toFixed(1)) : null };
  });
};

function Metric({ icon: Icon, label, value, detail, tone }) {
  return <div className={styles.metric}><span className={`${styles.metricIcon} ${styles[tone]}`}><Icon size={19} /></span><div><span className={styles.metricLabel}>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function ChartCard({ title, subtitle, children, empty }) {
  return <section className={styles.chartCard}><div className={styles.cardHeading}><div><h2>{title}</h2><p>{subtitle}</p></div></div>{empty ? <div className={styles.emptyChart}><Activity size={24} /><span>Chưa có dữ liệu trong khoảng thời gian này</span></div> : <div className={styles.chart}>{children}</div>}</section>;
}

function Home() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isManagement = ['admin', 'giaovien'].includes(user?.role);
  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true); setError(false); setData(null);
    apiFetchTongQuat(`/api/lich-su-thi/dashboard?days=${days}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (active) { if (!res.success) throw new Error('Không tải được thống kê'); setData(res.data); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, days, revision]);
  const personalDaily = useMemo(() => fillDays(data?.personal?.daily, days), [data, days]);
  const classDaily = useMemo(() => fillDays(data?.management?.daily, days), [data, days]);
  const personal = data?.personal?.summary;
  const management = data?.management?.summary;
  const label = user?.ho_ten?.trim() || 'bạn';
  const commonAxis = { axisLine: false, tickLine: false, tick: { fill: '#8a9bae', fontSize: 11 } };
  const tooltip = { border: '1px solid #e7eef6', borderRadius: 12, boxShadow: '0 8px 24px #17365318', fontSize: 12 };
  return <div className={styles.dashboard}>
    <header className={styles.heading}><div><div className={styles.eyebrow}><span /> KHÔNG GIAN HỌC TẬP</div><h1>Xin chào, {label} <span>👋</span></h1><p>Theo dõi kết quả và tiến độ học tập của bạn.</p></div><div className={styles.headingActions}><div className={styles.period}><CalendarDays size={16} /><select aria-label="Khoảng thời gian thống kê" value={days} onChange={event => setDays(Number(event.target.value))}><option value={7}>7 ngày gần nhất</option><option value={30}>30 ngày gần nhất</option><option value={90}>90 ngày gần nhất</option></select></div><button className={styles.refresh} onClick={() => setRevision(value => value + 1)} aria-label="Làm mới thống kê"><RefreshCw size={17} /></button></div></header>
    {loading ? <div className={styles.state}>Đang tải thống kê...</div> : error ? <div className={styles.state}>Không thể tải thống kê. <button onClick={() => setRevision(value => value + 1)}>Thử lại</button></div> : data && <>
      <div className={styles.sectionHead}><div><span>CỦA BẠN</span><h2>Hành trình học tập</h2><p>Kết quả từ các bài thi đã nộp trong {days} ngày gần nhất.</p></div><button onClick={() => navigate('/hoc-sinh/bo-suu-tap')}>Bộ sưu tập <ArrowRight size={16} /></button></div>
      <div className={styles.metrics}><Metric icon={BookOpen} label="Bài thi đã nộp" value={personal.attempts} detail="Lượt làm bài" tone="blue" /><Metric icon={TrendingUp} label="Điểm trung bình" value={number(personal.average)} detail="Trên thang điểm 10" tone="violet" /><Metric icon={Award} label="Điểm cao nhất" value={number(personal.best)} detail="Trên thang điểm 10" tone="green" /></div>
      <div className={styles.chartGrid}>
        <ChartCard title="Hoạt động học tập" subtitle="Số lượt làm bài theo ngày" empty={!personal.attempts}><ResponsiveContainer width="100%" height="100%"><AreaChart data={personalDaily} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}><defs><linearGradient id="personalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b86dc" stopOpacity={0.25} /><stop offset="100%" stopColor="#3b86dc" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf2f7" vertical={false} /><XAxis dataKey="date" {...commonAxis} minTickGap={28} /><YAxis {...commonAxis} allowDecimals={false} /><Tooltip contentStyle={tooltip} labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate} /><Area type="monotone" dataKey="attempts" name="Lượt thi" stroke="#2679c7" strokeWidth={2.5} fill="url(#personalFill)" /></AreaChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Điểm số theo ngày" subtitle="Điểm trung bình của những ngày có làm bài" empty={!personal.attempts}><ResponsiveContainer width="100%" height="100%"><BarChart data={personalDaily} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}><CartesianGrid stroke="#edf2f7" vertical={false} /><XAxis dataKey="date" {...commonAxis} minTickGap={28} /><YAxis {...commonAxis} domain={[0, 10]} /><Tooltip contentStyle={tooltip} labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate} /><Bar dataKey="average" name="Điểm trung bình" fill="#18a889" radius={[5, 5, 0, 0]} maxBarSize={30} /></BarChart></ResponsiveContainer></ChartCard>
      </div>
      {isManagement && data.management && <><div className={styles.sectionHead}><div><span>QUẢN LÝ LỚP HỌC</span><h2>Hoạt động của học viên</h2><p>{user.role === 'admin' ? 'Tổng quan học viên trên toàn hệ thống.' : 'Tổng quan học viên trong các lớp bạn phụ trách.'} Số liệu trong {days} ngày gần nhất.</p></div><button onClick={() => navigate('/admin/lich-su-thi')}>Xem lịch sử <ArrowRight size={16} /></button></div><div className={styles.metrics}><Metric icon={Activity} label="Lượt thi học viên" value={management.attempts} detail="Bài thi đã nộp" tone="blue" /><Metric icon={Users} label="Học viên đã thi" value={management.students} detail="Học viên khác nhau" tone="violet" /><Metric icon={GraduationCap} label="Điểm trung bình" value={number(management.average)} detail="Trên thang điểm 10" tone="green" /></div><div className={styles.chartGrid}>
        <ChartCard title="Lượt thi theo ngày" subtitle="Hoạt động của học viên trong lớp" empty={!management.attempts}><ResponsiveContainer width="100%" height="100%"><AreaChart data={classDaily} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}><defs><linearGradient id="classFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#735bdb" stopOpacity={0.22} /><stop offset="100%" stopColor="#735bdb" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf2f7" vertical={false} /><XAxis dataKey="date" {...commonAxis} minTickGap={28} /><YAxis {...commonAxis} allowDecimals={false} /><Tooltip contentStyle={tooltip} labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate} /><Area type="monotone" dataKey="attempts" name="Lượt thi" stroke="#735bdb" strokeWidth={2.5} fill="url(#classFill)" /></AreaChart></ResponsiveContainer></ChartCard>
        <section className={styles.chartCard}><div className={styles.cardHeading}><div><h2>Hoạt động theo lớp</h2><p>6 lớp có nhiều lượt thi nhất</p></div></div>{data.management.classes.length ? <div className={styles.classList}>{data.management.classes.map((item, index) => <div className={styles.classRow} key={item._id}><span className={styles.classRank}>{String(index + 1).padStart(2, '0')}</span><div><strong title={item.name}>{item.name}</strong><span>{item.students} học viên · Điểm TB {number(item.average)}</span></div><b>{item.attempts} lượt</b></div>)}</div> : <div className={styles.emptyChart}><Users size={24} /><span>Chưa có lớp nào có lượt thi</span></div>}</section>
      </div></>}
    </>}
  </div>;
}

export default Home;
