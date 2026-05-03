import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { message } from "antd";
import styles from "./LamBai.module.css";
import baiGiangThuongMaiAPI from "../../../services/baiGiangThuongMaiAPI";
import { useAuth } from "../../../contexts/AuthContext";

const LamBai = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [baiThi, setBaiThi] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const [showNoiDung, setShowNoiDung] = useState(true);
  const timerRef = useRef(null);


  // Load bài thi
  useEffect(() => {
    fetchBaiThi();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Timer
  useEffect(() => {
    if (baiThi && !result && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [baiThi, result]);

  const fetchBaiThi = async () => {
    try {
      setLoading(true);
      const res = await baiGiangThuongMaiAPI.getBaiThi(id, token);
      if (res.success) {
        setBaiThi(res.data);
        setTimeLeft(res.data.baiGiang.thoi_gian_lam_bai * 60);
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
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: label
    }));
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

    try {
      setIsSubmitting(true);

      // Tính thời gian đã làm
      const thoiGianLam = baiThi.baiGiang.thoi_gian_lam_bai * 60 - timeLeft;

      // Chuẩn bị đáp án
      const dapAnDaChon = baiThi.cauHoi.map((_, idx) => answers[idx] || null);

      const res = await baiGiangThuongMaiAPI.nopBaiThi({
        id_bai_giang: id,
        dapAnDaChon,
        thoi_gian_lam_bai: thoiGianLam
      }, token);

      if (res.success) {
        setResult(res.data);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (error) {
      console.error("Lỗi nộp bài:", error);
      message.error("Không thể nộp bài thi");
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

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
          <div 
            className={styles.noiDungHeader}
            onClick={() => setShowNoiDung(!showNoiDung)}
            style={{ cursor: "pointer" }}
          >
            <BookOpen size={18} />
            <span>Nội dung bài học</span>
            <span style={{ marginLeft: "auto" }}>
              {showNoiDung ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
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
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
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
        >
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>
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
        {baiThi.cauHoi.map((q, idx) => (
          <button
            key={idx}
            className={`${styles.navDot} ${
              idx === currentQuestion ? styles.navDotActive : ""
            } ${answers[idx] ? styles.navDotAnswered : ""}`}
            onClick={() => goToQuestion(idx)}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className={styles.examContent}>
        {/* Question Card */}
        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <span className={styles.questionBadge}>Câu {currentQuestion + 1}</span>
          </div>
          
          <div className={styles.questionText}>
            <p dangerouslySetInnerHTML={{ __html: currentQ.noiDungCauHoi }} />
          </div>

          <div className={styles.answersList}>
            {currentQ.cacDapAn.map((answer, idx) => (
              <button
                key={idx}
                className={`${styles.answerOption} ${
                  answers[currentQuestion] === answer.label ? styles.answerSelected : ""
                }`}
                onClick={() => selectAnswer(answer.label)}
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

      {/* Confirm Modal */}
      {showConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
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
                onClick={() => setShowConfirm(false)}
              >
                Hủy
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
        </div>
      )}
    </div>
  );
};

export default LamBai;
