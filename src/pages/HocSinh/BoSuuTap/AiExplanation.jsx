import { useState } from "react";
import { Sparkles, RotateCw } from "lucide-react";
import api from "../../../services/baiGiangThuongMaiAPI";
import styles from "./AiExplanation.module.css";

// Render the common formatting used by Gemini as React text, never as HTML.
function formatInline(text) {
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).map((part, index) =>
    /^(\*\*|__)[\s\S]+\1$/.test(part)
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : part
  );
}

function ExplanationText({ text }) {
  const blocks = [];
  let list = [];
  let listType = null;
  const flushList = () => {
    if (!list.length) return;
    const Tag = listType === "ordered" ? "ol" : "ul";
    blocks.push(<Tag key={`list-${blocks.length}`}>{list.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</Tag>);
    list = [];
    listType = null;
  };

  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    const bullet = trimmed.match(/^[-*+]\s+(.+)$/);
    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      const type = bullet ? "unordered" : "ordered";
      if (listType && listType !== type) flushList();
      listType = type;
      list.push((bullet || numbered)[1]);
      return;
    }
    flushList();
    if (!trimmed) return;
    const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
    const content = heading ? heading[1] : trimmed;
    const isHeading = Boolean(heading || /^(\*\*[^*]+\*\*|__[^_]+__)$/.test(content));
    blocks.push(isHeading
      ? <p className={styles.textHeading} key={`text-${blocks.length}`}>{formatInline(content)}</p>
      : <p key={`text-${blocks.length}`}>{formatInline(content)}</p>);
  });
  flushList();
  return <div className={styles.text}>{blocks}</div>;
}

export default function AiExplanation({ resultId, index, token }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const explain = async () => {
    setOpen(true);
    if (explanation || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.giaiThichAI(resultId, index, token);
      setExplanation(result.data.explanation);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể kết nối trợ giảng AI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.assistant}>
      <div className={styles.heading}>
        <span className={styles.icon}><Sparkles size={19} /></span>
        <div><strong>Trợ giảng AI</strong><p>Hiểu rõ hơn cách giải câu hỏi này</p></div>
      </div>
      {!open ? (
        <button type="button" className={styles.button} onClick={explain}>
          <Sparkles size={16} /> Giải thích câu hỏi
        </button>
      ) : (
        <div className={styles.content} aria-live="polite">
          {loading && <p className={styles.muted}>Trợ giảng đang suy nghĩ...</p>}
          {error && <><p className={styles.error}>{error}</p><button type="button" className={styles.retry} onClick={explain}><RotateCw size={14} /> Thử lại</button></>}
          {explanation && <><ExplanationText text={explanation} /><p className={styles.disclaimer}>AI có thể mắc lỗi, hãy đối chiếu lại với bài giảng.</p></>}
        </div>
      )}
      {!open && <p className={styles.privacy}>Nội dung câu hỏi và các đáp án sẽ được gửi tới Gemini để giải thích.</p>}
    </section>
  );
}
