import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResumeExamModal from './ResumeExamModal';
import { useAuth } from '../../contexts/AuthContext';

export default function UnfinishedExamReminder() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [now, setNow] = useState(Date.now());
  const userId = user?._id || user?.id;
  const inExam = location.pathname.startsWith('/hoc-sinh/lam-bai/');

  useEffect(() => {
    if (!userId || inExam) { setDraft(null); return; }
    const scan = () => {
      const prefix = `exam:${userId}:`;
      const drafts = [];
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (!key?.startsWith(prefix)) continue;
        try {
          const saved = JSON.parse(localStorage.getItem(key));
          if (Number.isFinite(saved?.deadline) && saved.attempt > 0 && saved.answers && typeof saved.answers === 'object') {
            drafts.push({ ...saved, lessonId: key.slice(prefix.length) });
          }
        } catch { /* Ignore unrelated or invalid browser data. */ }
      }
      drafts.sort((a, b) => a.deadline - b.deadline);
      setDraft(drafts[0] || null);
      setNow(Date.now());
    };
    scan();
    window.addEventListener('storage', scan);
    window.addEventListener('focus', scan);
    document.addEventListener('visibilitychange', scan);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener('storage', scan);
      window.removeEventListener('focus', scan);
      document.removeEventListener('visibilitychange', scan);
      clearInterval(interval);
    };
  }, [userId, inExam, location.key]);

  const remaining = draft ? Math.max(0, Math.ceil((draft.deadline - now) / 1000)) : 0;
  const openExam = (submitImmediately) => navigate(`/hoc-sinh/lam-bai/${draft.lessonId}`, { state: { submitSavedExam: submitImmediately } });
  return <ResumeExamModal open={!!draft && !inExam} seconds={remaining}
    answered={Object.keys(draft?.answers || {}).length}
    onContinue={() => openExam(false)} onSubmit={() => openExam(true)} />;
}
