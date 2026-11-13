import { Modal } from 'antd';
import { BookOpen, Clock, Play, Send, ShieldCheck } from 'lucide-react';
import styles from './ResumeExamModal.module.css';

export default function ResumeExamModal({ open, seconds, answered, total, submitting = false, onContinue, onSubmit }) {
  const expired = seconds <= 0;
  return <Modal open={open} centered width={480} closable={false} maskClosable={false} keyboard={false} footer={null} className={styles.modal}>
    <div className={styles.icon}><BookOpen size={26} /></div>
    <span className={styles.eyebrow}>BÀI LÀM ĐÃ ĐƯỢC LƯU</span>
    <h2>{expired ? 'Thời gian làm bài đã hết' : 'Tiếp tục bài làm của bạn?'}</h2>
    <p className={styles.description}>{expired ? 'Bạn có thể nộp bài ngay với những đáp án đã chọn.' : 'Đáp án của bạn vẫn còn nguyên. Hãy làm tiếp hoặc nộp bài khi đã sẵn sàng.'}</p>
    <div className={styles.summary}>
      <div><span>Đã trả lời</span><strong>{answered}<small>{total ? ` / ${total} câu` : ' câu'}</small></strong></div>
      <div><span><Clock size={13} />Thời gian còn lại</span><strong className={expired ? styles.expired : styles.time}>{Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0')}:{(Math.max(0, seconds) % 60).toString().padStart(2, '0')}</strong></div>
    </div>
    <div className={styles.actions}>
      {!expired && <button className={styles.secondary} disabled={submitting} onClick={onContinue}><Play size={16} />Làm tiếp</button>}
      <button className={styles.primary} disabled={submitting} onClick={onSubmit}><Send size={16} />{submitting ? 'Đang nộp…' : 'Nộp bài ngay'}</button>
    </div>
    <p className={styles.note}><ShieldCheck size={14} />Thời gian vẫn được tính khi bạn rời trang.</p>
  </Modal>;
}
