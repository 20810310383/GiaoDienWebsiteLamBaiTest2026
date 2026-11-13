import React, { useEffect, useMemo, useRef, useState } from "react";
import { Drawer, Skeleton } from "antd";
import { BookOpen, Check, ChevronLeft, ChevronRight, Clock, FileText, Lightbulb, ListChecks, RefreshCw } from "lucide-react";
import styles from "./LessonPreviewDrawer.module.css";

function prepareMedia(html = "") {
  if (!/<(?:img|iframe|video)\b/i.test(html)) return html;
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("img").forEach(image => {
    image.setAttribute("loading", "lazy");
    image.setAttribute("decoding", "async");
  });
  document.querySelectorAll("iframe").forEach(frame => frame.setAttribute("loading", "lazy"));
  document.querySelectorAll("video").forEach(video => video.setAttribute("preload", "metadata"));
  return document.body.innerHTML;
}

export default function LessonPreviewDrawer({ open, onClose, lesson, questions = [], loading, error, onRetry, canViewAnswers = false }) {
  const [tab, setTab] = useState("content");
  const [questionIndex, setQuestionIndex] = useState(0);
  const readerRef = useRef(null);
  const lessonHtml = useMemo(() => prepareMedia(lesson?.noi_dung_bai_hoc), [lesson?.noi_dung_bai_hoc]);
  useEffect(() => {
    if (readerRef.current) readerRef.current.scrollTop = 0;
  }, [tab, lesson?._id, open]);
  useEffect(() => {
    if (open) { setTab("content"); setQuestionIndex(0); }
  }, [open, lesson?._id]);

  const currentIndex = Math.min(questionIndex, Math.max(0, questions.length - 1));
  const question = questions[currentIndex];
  return (
    <Drawer open={open} onClose={onClose} width="min(980px, 100vw)" className={styles.drawer}
      destroyOnClose
      title={<div className={styles.title}><span><BookOpen size={20} /></span><div>Chi tiết bài giảng<small>Đọc tài liệu và xem câu hỏi ôn tập</small></div></div>}
      footer={<div className={styles.footer}><span><FileText size={15} />{questions.length} câu hỏi ôn tập</span><button onClick={onClose}>Đóng</button></div>}>
      {loading ? (
        <div className={styles.loading}><Skeleton active title paragraph={{ rows: 3 }} /><Skeleton active paragraph={{ rows: 7 }} /></div>
      ) : error ? (
        <div className={styles.empty} role="alert"><RefreshCw size={34} /><h3>Chưa thể tải bài giảng</h3><p>Vui lòng thử tải lại nội dung.</p><button onClick={onRetry}>Thử lại</button></div>
      ) : (
        <>
          <div className={styles.tabs} role="tablist" aria-label="Nội dung bài giảng">
            <button id="lesson-content-tab" role="tab" aria-selected={tab === "content"} aria-controls="lesson-content-panel" onClick={() => setTab("content")}><BookOpen size={17} />Nội dung bài học</button>
            <button id="lesson-questions-tab" role="tab" aria-selected={tab === "questions"} aria-controls="lesson-questions-panel" onClick={() => setTab("questions")}><ListChecks size={17} />Câu hỏi ôn tập<span>{questions.length}</span></button>
          </div>
          <div className={styles.reader} ref={readerRef}>
          <header className={styles.hero}>
            <span className={styles.eyebrow}>KHÔNG GIAN HỌC TẬP</span>
            <h2>{lesson?.ten_bai_giang}</h2>
            {lesson?.gioiThieu && <p>{lesson.gioiThieu}</p>}
            <div className={styles.meta}><span><Clock size={15} />{lesson?.thoi_gian_lam_bai || 15} phút luyện tập</span><span><ListChecks size={15} />{questions.length} câu hỏi</span></div>
          </header>
          {tab === "content" ? (
            <section id="lesson-content-panel" role="tabpanel" aria-labelledby="lesson-content-tab" className={styles.panel}>
              {lesson?.noi_dung_bai_hoc ? <article className={styles.prose} dangerouslySetInnerHTML={{ __html: lessonHtml }} /> : <div className={styles.empty}><FileText size={36} /><h3>Chưa có nội dung bài học</h3><p>Tài liệu sẽ hiển thị tại đây khi được cập nhật.</p></div>}
              {questions.length > 0 && <button className={styles.nextSection} onClick={() => setTab("questions")}>Xem câu hỏi ôn tập<ChevronRight size={17} /></button>}
            </section>
          ) : (
            <section id="lesson-questions-panel" role="tabpanel" aria-labelledby="lesson-questions-tab" className={styles.panel}>
              {!question ? <div className={styles.empty}><ListChecks size={36} /><h3>Chưa có câu hỏi ôn tập</h3></div> : (
                <>
                  <div className={styles.questionIntro}><div><h3>Câu hỏi ôn tập</h3><p>{canViewAnswers ? "Xem nội dung, đáp án đúng và giải thích của từng câu." : "Đọc câu hỏi và tự suy nghĩ trước khi làm bài."}</p></div><strong>{currentIndex + 1}/{questions.length}</strong></div>
                  <nav className={styles.questionNav} aria-label="Chọn câu hỏi">
                    {questions.map((item, index) => <button key={item._id || index} aria-label={`Xem câu hỏi ${index + 1}`} aria-current={index === currentIndex ? "step" : undefined} onClick={() => setQuestionIndex(index)}>{index + 1}</button>)}
                  </nav>
                  <article className={styles.questionCard} key={question._id || currentIndex}>
                    <div className={styles.questionLabel}><span>CÂU {String(currentIndex + 1).padStart(2, "0")}</span><span>Trắc nghiệm</span></div>
                    <div className={styles.questionText} dangerouslySetInnerHTML={{ __html: question.noiDungCauHoi }} />
                    <div className={styles.answers}>
                      {(question.cacDapAn || []).map((answer, index) => {
                        const correct = canViewAnswers && answer.laDapAnDung === true;
                        return <div key={answer._id || index} className={`${styles.answer} ${correct ? styles.correct : ""}`}>
                          <span className={styles.letter}>{String.fromCharCode(65 + index)}</span>
                          <div className={styles.answerText} dangerouslySetInnerHTML={{ __html: answer.noiDungDapAn }} />
                          {correct && <span className={styles.correctLabel}><Check size={15} />Đúng</span>}
                        </div>;
                      })}
                    </div>
                    {canViewAnswers && question.giaiThich && <aside className={styles.explanation}><h4><Lightbulb size={17} />Giải thích đáp án</h4><div className={styles.prose} dangerouslySetInnerHTML={{ __html: question.giaiThich }} /></aside>}
                  </article>
                  <div className={styles.pager}><button disabled={currentIndex === 0} onClick={() => setQuestionIndex(currentIndex - 1)}><ChevronLeft size={16} />Câu trước</button><span>{currentIndex + 1} / {questions.length}</span><button disabled={currentIndex === questions.length - 1} onClick={() => setQuestionIndex(currentIndex + 1)}>Câu tiếp<ChevronRight size={16} /></button></div>
                </>
              )}
            </section>
          )}
          </div>
        </>
      )}
    </Drawer>
  );
}
