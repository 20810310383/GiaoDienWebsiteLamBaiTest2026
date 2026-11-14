import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResumeExamModal from './ResumeExamModal';
import { useAuth } from '../../contexts/AuthContext';
import baiGiangThuongMaiAPI from '../../services/baiGiangThuongMaiAPI';

export default function UnfinishedExamReminder() {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [now, setNow] = useState(Date.now());
  const userId = user?._id || user?.id;
  const inExam = location.pathname.startsWith('/hoc-sinh/lam-bai/');

  useEffect(() => {
    if (!userId || !token || inExam) { setDraft(null); return; }
    let active = true;
    let scanId = 0;
    const scan = async () => {
      const currentScan = ++scanId;
      setDraft(null);
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
      for (const candidate of drafts) {
        try {
          const response = await baiGiangThuongMaiAPI.getBaiThi(candidate.lessonId, token);
          if (!active || currentScan !== scanId) return;
          if (!response.success) continue;
          if (response.data.soLanThi !== candidate.attempt) {
            const key = `${prefix}${candidate.lessonId}`;
            const current = JSON.parse(localStorage.getItem(key));
            if (current?.attempt === candidate.attempt && current?.deadline === candidate.deadline) localStorage.removeItem(key);
            continue;
          }
          setDraft(candidate);
          setNow(Date.now());
          return;
        } catch { /* Keep the draft when the server cannot be reached. */ }
      }
      if (active && currentScan === scanId) { setDraft(null); setNow(Date.now()); }
    };
    scan();
    window.addEventListener('storage', scan);
    window.addEventListener('exam-draft-changed', scan);
    window.addEventListener('focus', scan);
    document.addEventListener('visibilitychange', scan);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      active = false;
      window.removeEventListener('storage', scan);
      window.removeEventListener('exam-draft-changed', scan);
      window.removeEventListener('focus', scan);
      document.removeEventListener('visibilitychange', scan);
      clearInterval(interval);
    };
  }, [userId, token, inExam, location.key]);

  const remaining = draft ? Math.max(0, Math.ceil((draft.deadline - now) / 1000)) : 0;
  const openExam = (submitImmediately) => navigate(`/hoc-sinh/lam-bai/${draft.lessonId}`, { state: { submitSavedExam: submitImmediately } });
  return <ResumeExamModal open={!!draft && !inExam} seconds={remaining}
    answered={Object.keys(draft?.answers || {}).length}
    onContinue={() => openExam(false)} onSubmit={() => openExam(true)} />;
}
