import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, unstable_useBlocker as useBlocker } from "react-router-dom";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Send, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Trophy,
  BookOpen,
  ArrowLeft
} from "lucide-react";
import { message, Modal } from "antd";
import styles from "./LamBai.module.css";
import baiGiangThuongMaiAPI from "../../../services/baiGiangThuongMaiAPI";
import { useAuth } from "../../../contexts/AuthContext";
import { useRealtime } from "../../../hook/useRealtime";
import ResumeExamModal from '../../../components/ProtectedRoute/ResumeExamModal';

const LamBai = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const submitOnRestore = useRef(location.state?.submitSavedExam === true);
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [baiThi, setBaiThi] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResume, setShowResume] = useState(false);
  useEffect(() => {
    if (!loading && baiThi && showResume && submitOnRestore.current) {
      submitOnRestore.current = false;
      submitRef.current?.(true);
    }
  }, [loading, baiThi, showResume]);
  const resumePending = useRef(false);
  const wasHidden = useRef(false);
  const [result, setResult] = useState(null);
  const examInProgress = !!baiThi && !result;
  const blocker = useBlocker(examInProgress);
  useEffect(() => {
    if (!examInProgress) return;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [examInProgress]);
  const [showNoiDung, setShowNoiDung] = useState(false);
  const timerRef = useRef(null);
  const deadlineRef = useRef(0);
  const answersRef = useRef({});
  const submitRef = useRef(null);
  const submittingRef = useRef(false);
  const autoSentRef = useRef(false);
  const clockOffset = useRef(0);
  const storageKey = 'exam:' + (user?._id || user?.id) + ':' + id;
  const saveDraft = () => {
    if (!baiThi || result) return;
    localStorage.setItem(storageKey, JSON.stringify({ attempt: baiThi.soLanThi, deadline: deadlineRef.current,
      answers: answersRef.current, currentQuestion }));
  };
  useEffect(() => { saveDraft(); }, [currentQuestion, baiThi, result]);
  useEffect(() => {
    if (!baiThi || result) return;
    const visibilityChanged = () => {
      if (document.hidden) {
        wasHidden.current = true;
        resumePending.current = true;
        saveDraft();
      } else if (wasHidden.current) {
        wasHidden.current = false;
        setShowConfirm(false);
        setShowResume(true);
      }
    };
    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('pagehide', saveDraft);
    return () => {
      document.removeEventListener('visibilitychange', visibilityChanged);
      window.removeEventListener('pagehide', saveDraft);
    };
  }, [baiThi, result, currentQuestion]);
  useRealtime(token, { connect: (socket) => {
    const sent = Date.now();
    socket.timeout(5000).emit('clock:sync', (error, response) => {
      if (!error && Number.isFinite(response?.now)) clockOffset.current = response.now - (sent + Date.now()) / 2;
    });
  } });


  // Load bài thi
  useEffect(() => {
    fetchBaiThi();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, token]);

  // Recompute from an absolute deadline; background-tab throttling cannot add time.
  useEffect(() => {
    if (!baiThi || result) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now() - clockOffset.current) / 1000));
      setTimeLeft(remaining);
      if (!remaining && !autoSentRef.current && !resumePending.current && !document.hidden) {
        autoSentRef.current = true;
        submitRef.current?.(true);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 250);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener('focus', tick);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [baiThi, result]);

  const fetchBaiThi = async () => {
    try {
      setLoading(true);
      const res = await baiGiangThuongMaiAPI.getBaiThi(id, token);
      if (res.success) {
        const duration = res.data.baiGiang.thoi_gian_lam_bai * 60000;
        let saved;
        try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch { /* Invalid saved draft. */ }
        const sameAttempt = saved?.attempt === res.data.soLanThi && Number.isFinite(saved?.deadline);
        if (!sameAttempt) submitOnRestore.current = false;
        deadlineRef.current = sameAttempt ? saved.deadline : Date.now() + clockOffset.current + duration;
        answersRef.current = sameAttempt ? saved.answers || {} : {};
        setCurrentQuestion(sameAttempt ? Math.max(0, Math.min(res.data.cauHoi.length - 1, Number(saved.currentQuestion) || 0)) : 0);
        resumePending.current = sameAttempt;
        setShowResume(sameAttempt);
        setAnswers(answersRef.current);
        autoSentRef.current = false;
        localStorage.setItem(storageKey, JSON.stringify({ attempt: res.data.soLanThi, deadline: deadlineRef.current, answers: answersRef.current }));
        setBaiThi(res.data);
        setTimeLeft(Math.max(0, Math.ceil((deadlineRef.current - Date.now() - clockOffset.current) / 1000)));
      }
    } catch (error) {
      console.error("Lỗi load bài thi:", error);
      message.error("Không thể tải bài thi");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // Chọn đáp án
  const selectAnswer = (label) => {
    if (resumePending.current || submittingRef.current || Date.now() + clockOffset.current >= deadlineRef.current) return;
    const next = { ...answersRef.current, [currentQuestion]: label };
    answersRef.current = next;
    setAnswers(next);
    localStorage.setItem(storageKey, JSON.stringify({ attempt: baiThi.soLanThi, deadline: deadlineRef.current, answers: next, currentQuestion }));
  };

  // Chuyển câu hỏi
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < baiThi.cauHoi.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit
  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      setShowConfirm(true);
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      setIsSubmitting(true);

      // Tính thời gian đã làm
      const thoiGianLam = Math.min(baiThi.baiGiang.thoi_gian_lam_bai * 60, Math.max(0, baiThi.baiGiang.thoi_gian_lam_bai * 60 - Math.ceil((deadlineRef.current - Date.now() - clockOffset.current) / 1000)));

      // Chuẩn bị đáp án
      const dapAnDaChon = baiThi.cauHoi.map((_, idx) => answersRef.current[idx] || null);

      const res = await baiGiangThuongMaiAPI.nopBaiThi({
        id_bai_giang: id,
        dapAnDaChon,
        thoi_gian_lam_bai: thoiGianLam
      }, token);

      if (res.success) {
        localStorage.removeItem(storageKey);
        resumePending.current = false;
        setShowResume(false);
        setResult(res.data);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (error) {
      console.error("Lỗi nộp bài:", error);
      message.error("Không thể nộp bài thi");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  submitRef.current = handleSubmit;

  // Format thời gian
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get điểm màu
  const getDiemColor = (diem) => {
    if (diem >= 8) return "#15803d";
    if (diem >= 6) return "#b45309";
    if (diem >= 4) return "#ea580c";
    return "#dc2626";
  };

  const getDiemLabel = (diem) => {
    if (diem >= 8) return "Xuất sắc!";
    if (diem >= 6) return "Khá tốt!";
    if (diem >= 4) return "Cần cố gắng";
    return "Chưa đạt";
  };

  const getScoreClass = (diem) => {
    if (diem >= 8) return styles.excellent;
    if (diem >= 6) return styles.good;
    if (diem >= 4) return styles.average;
    return styles.poor;
  };

  // Loading
  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <p>Đang tải bài thi...</p>
      </div>
    );
  }

  // Kết quả
  if (result) {
    const diemPhanTram = (result.soCauDung / result.tongSoCau * 100).toFixed(0);
    const scoreClass = getScoreClass(result.diem);
    
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultCard}>
          {/* Background decoration */}
          <div className={styles.resultBg}>
            <div className={styles.resultBgCircle1} />
            <div className={styles.resultBgCircle2} />
          </div>

          <div className={styles.resultContent}>
            {/* Icon */}
            <div className={`${styles.resultIconWrap} ${scoreClass}`}>
              {result.diem >= 6 ? (
                <Trophy size={32} />
              ) : (
                <BookOpen size={32} />
              )}
            </div>

            {/* Title */}
            <h1 className={styles.resultTitle}>Kết quả bài thi</h1>
            <p className={styles.resultSubtitle}>{baiThi.baiGiang.ten_bai_giang}</p>

            {/* Score Circle */}
            <div className={`${styles.scoreWrap} ${scoreClass}`}>
              <div className={styles.scoreRing}>
                <svg viewBox="0 0 100 100" className={styles.scoreSvg}>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${diemPhanTram * 2.83} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    className={styles.scoreProgress}
                  />
                </svg>
                <div className={styles.scoreInner}>
                  <span className={styles.scoreValue}>{result.diem}</span>
                  <span className={styles.scoreMax}>/10</span>
                </div>
              </div>
              <span className={styles.scoreLabel}>{getDiemLabel(result.diem)}</span>
            </div>

            {/* Stats Grid */}
            <div className={styles.resultStats}>
              <div className={`${styles.statItem} ${scoreClass}`}>
                <span className={styles.statIcon}>
                  <CheckCircle size={18} />
                </span>
                <span className={styles.statValue}>{result.soCauDung}</span>
                <span className={styles.statLabel}>Câu đúng</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statIcon} style={{ color: "#ef4444" }}>
                  <XCircle size={18} />
                </span>
                <span className={styles.statValue}>{result.tongSoCau - result.soCauDung}</span>
                <span className={styles.statLabel}>Câu sai</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statIcon} style={{ color: "#8b5cf6" }}>
                  <Trophy size={18} />
                </span>
                <span className={styles.statValue}>{diemPhanTram}%</span>
                <span className={styles.statLabel}>Tỷ lệ</span>
              </div>
            </div>

            {/* Info badge */}
            <div className={styles.resultBadge}>
              <span>Lần thi thứ</span>
              <strong>#{result.lanThi}</strong>
            </div>

            {/* Actions */}
            <div className={styles.resultActions}>
              <button 
                className={`${styles.resultBtn} ${styles.resultBtnPrimary}`}
                onClick={() => navigate(`/hoc-sinh/bo-suu-tap`)}
              >
                <BookOpen size={18} />
                Xem đáp án
              </button>
              <button 
                className={`${styles.resultBtn} ${styles.resultBtnSecondary}`}
                onClick={() => navigate(`/hoc-sinh/bo-suu-tap`)}
              >
                <ArrowLeft size={18} />
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chưa có kết quả - Đang làm bài
  const currentQ = baiThi.cauHoi[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = baiThi.tongSoCau - answeredCount;

  return (
    <div className={styles.examPage}>
      
      {/* Nội dung bài học */}
      {baiThi.baiGiang.noi_dung_bai_hoc && (
        <div className={styles.noiDungBaiHoc}>
          <button
            type="button"
            aria-expanded={showNoiDung}
            className={styles.noiDungHeader}
            onClick={() => setShowNoiDung(!showNoiDung)}
            style={{ cursor: "pointer" }}
          >
            <BookOpen size={18} />
            <span>Nội dung bài học</span>
            <span style={{ marginLeft: "auto" }}>
              {showNoiDung ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>
          {showNoiDung && (
            <div 
              className={styles.noiDungContent}
              dangerouslySetInnerHTML={{ __html: baiThi.baiGiang.noi_dung_bai_hoc }}
            />
          )}
        </div>
      )}
      {/* Header */}
      <div className={styles.examHeader}>
        <button className={styles.backBtn} aria-label="Quay lại" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        
        <div className={styles.examInfo}>
          <h2>{baiThi.baiGiang.ten_bai_giang}</h2>
          <span className={styles.examMeta}>
            {baiThi.baiGiang.ten_lop} • Lần #{baiThi.soLanThi}
          </span>
        </div>

        <div 
          className={`${styles.timer} ${timeLeft < 60 ? styles.timerWarning : ""}`}
          role="timer" aria-label="Thời gian còn lại"
        >
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <button className={styles.headerSubmit} onClick={() => handleSubmit(false)} disabled={isSubmitting}>
          <Send size={17} />{isSubmitting ? "Đang nộp…" : "Nộp bài"}
        </button>
      </div>

      {/* Progress */}
      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span>Câu {currentQuestion + 1} / {baiThi.tongSoCau}</span>
          <span className={styles.progressStats}>
            <CheckCircle size={14} className={styles.answeredIcon} />
            {answeredCount} đã trả lời
            {unansweredCount > 0 && (
              <> • <AlertCircle size={14} className={styles.unansweredIcon} />
              {unansweredCount} chưa trả lời</>
            )}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${(answeredCount / baiThi.tongSoCau) * 100}%` }}
          />
        </div>
      </div>


      {/* Question Navigator */}
      <div className={styles.questionNav}>
        <div className={styles.navigatorHeading}><ListChecksIcon />Bảng câu hỏi<span>{answeredCount}/{baiThi.tongSoCau}</span></div>
        <div className={styles.questionGrid}>
        {baiThi.cauHoi.map((q, idx) => (
          <button
            key={idx}
            className={`${styles.navDot} ${
              idx === currentQuestion ? styles.navDotActive : ""
            } ${answers[idx] ? styles.navDotAnswered : ""}`}
            onClick={() => goToQuestion(idx)}
            aria-label={`Câu ${idx + 1}, ${answers[idx] ? 'đã trả lời' : 'chưa trả lời'}`}
            aria-current={idx === currentQuestion ? 'step' : undefined}
          >
            {idx + 1}
          </button>
        ))}
        </div>
        <div className={styles.legend}><span><i />Chưa trả lời</span><span><i className={styles.legendDone} />Đã trả lời</span></div>
        <button className={styles.sideSubmit} onClick={() => handleSubmit(false)} disabled={isSubmitting}><Send size={16} />Nộp bài</button>
        <p className={styles.submitHint}>Bạn có thể nộp bài bất cứ lúc nào. Kiểm tra các câu chưa trả lời trước khi nộp.</p>
      </div>

      {/* Main Content */}
      <div className={styles.examContent}>
        {/* Question Card */}
        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <span className={styles.questionBadge}>Câu {currentQuestion + 1}</span>
            <span className={styles.questionStatus}>{answers[currentQuestion] ? 'Đã chọn đáp án' : 'Chọn một đáp án đúng'}</span>
          </div>
          
          <div className={styles.questionText}>
            <div dangerouslySetInnerHTML={{ __html: currentQ.noiDungCauHoi }} />
          </div>

          <div className={styles.answersList}>
            {currentQ.cacDapAn.map((answer, idx) => (
              <button
                key={idx}
                className={`${styles.answerOption} ${
                  answers[currentQuestion] === answer.label ? styles.answerSelected : ""
                }`}
                onClick={() => selectAnswer(answer.label)}
                aria-pressed={answers[currentQuestion] === answer.label}
                disabled={isSubmitting || timeLeft === 0}
              >
                <span className={`${styles.answerLabel} ${
                  answers[currentQuestion] === answer.label ? styles.answerLabelSelected : ""
                }`}>
                  {answer.label}
                </span>
                <span className={styles.answerText}>{answer.noiDung}</span>
                {answers[currentQuestion] === answer.label && (
                  <CheckCircle size={20} className={styles.checkIcon} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          <button 
            className={styles.navBtn}
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={20} />
            Câu trước
          </button>

          <div className={styles.navDots}>
            {currentQuestion + 1} / {baiThi.tongSoCau}
          </div>

          {currentQuestion < baiThi.tongSoCau - 1 ? (
            <button className={styles.navBtn} onClick={nextQuestion}>
              Câu sau
              <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              className={`${styles.navBtn} ${styles.submitBtn}`}
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              <Send size={18} />
              Nộp bài
            </button>
          )}
        </div>
      </div>

      <ResumeExamModal open={showResume} seconds={timeLeft} answered={answeredCount} total={baiThi.tongSoCau}
        submitting={isSubmitting}
        onContinue={() => {
          if (deadlineRef.current <= Date.now() + clockOffset.current) { setTimeLeft(0); return; }
          resumePending.current = false; setShowResume(false);
        }}
        onSubmit={() => handleSubmit(true)} />
    <Modal open={!showResume && blocker.state === 'blocked'} centered title="Bạn đang làm bài"
        onCancel={() => blocker.reset?.()} footer={null}>
        <p className={styles.leaveWarning}>Bạn chưa nộp bài nên không thể chuyển sang trang khác. Hãy tiếp tục làm bài hoặc nộp bài trước khi rời trang.</p>
        <div className={styles.confirmActions}>
          <button className={styles.confirmCancel} onClick={() => blocker.reset?.()}>Tiếp tục làm bài</button>
          <button className={styles.confirmSubmit} disabled={isSubmitting} onClick={() => { blocker.reset?.(); handleSubmit(false); }}>Nộp bài</button>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal open={showConfirm} onCancel={() => { if (!isSubmitting) setShowConfirm(false); }} footer={null} centered width={440} closable={!isSubmitting} maskClosable={!isSubmitting}>
          <div className={styles.submitConfirmation}>
            <div className={styles.confirmIcon}>
              <AlertCircle size={40} />
            </div>
            <h3>Xác nhận nộp bài?</h3>
            <p>
              Bạn đã trả lời <strong>{answeredCount}</strong>/{baiThi.tongSoCau} câu.
              {unansweredCount > 0 && (
                <> Còn <strong>{unansweredCount}</strong> câu chưa trả lời.</>
              )}
            </p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.confirmCancel}
                disabled={isSubmitting}
                onClick={() => setShowConfirm(false)}
              >
                Tiếp tục làm bài
              </button>
              <button 
                className={styles.confirmSubmit}
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang nộp..." : "Nộp bài"}
              </button>
            </div>
          </div>
      </Modal>
    </div>
  );
};

export default LamBai;

function ListChecksIcon() {
  return <CheckCircle size={17} />;
}
