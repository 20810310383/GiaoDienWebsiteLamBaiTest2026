import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { getInitials } from "../../../utils/scrollUtils";
import { getPublicUrl } from "../../../utils/formatURL";

/* ── Icons ── */
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconMenuClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const IconSparkle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    <path d="M19 17l1 3 3-1-1-3-3 1z" opacity="0.6" />
    <path d="M5 19l.5 1.5L7 21l-.5-1.5L5 19z" opacity="0.4" />
  </svg>
);

/* ── Breadcrumb map ── */
const ROUTE_LABELS = {
  "/": "Trang chủ",
  "/hoc-sinh/bo-suu-tap": "Bộ sưu tập",
  "/hoc-sinh/lam-bai": "Làm bài thi",
  "/tai-khoan-cua-toi": "Tài khoản của tôi",
  "/lop-hoc": "Lớp học",
  "/403": "Quyền truy cập",
  "/admin/lich-su-thi": "Lịch sử thi của lớp tôi",
  "/admin/quan-ly-tai-khoan": "Quản lý tài khoản hệ thống",
};

/* ── Marquee messages ── */
const MARQUEE_MESSAGES = [
  "Chào mừng bạn đến với EduPlatform!",
  "Học tập mỗi ngày để tiến bộ hơn!",
  "Đừng quên ôn tập trước khi thi nhé!",
  "Chúc bạn một ngày học tập hiệu quả!",
  "Thành công là kết quả của sự kiên trì!",
];

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [notifDot, setNotifDot] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const pageTitle = ROUTE_LABELS[location.pathname] || "Trang";

  // Scroll detection
  useEffect(() => {
    const el = document.querySelector("main") || window;
    const handler = () => setScrolled((el.scrollTop || window.scrollY) > 10);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Rotate marquee messages
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentMessage(prev => (prev + 1) % MARQUEE_MESSAGES.length);
        setFadeIn(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const { user } = useAuth();

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      {/* Left */}
      <div className={styles.left}>
        <button
          className={`${styles.iconBtn} ${styles.menuBtn} ${sidebarOpen ? styles.menuOpen : ""}`}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <IconMenuClose /> : <IconMenu />}
        </button>

        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbRoot}>EduPlatform</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{pageTitle}</span>
        </div>
      </div>

      {/* Center - Marquee Ticker */}
      <div className={styles.tickerWrap}>
        <div className={styles.tickerBadge}>
          <IconSparkle />
        </div>
        <div className={styles.tickerTrack}>
          <span 
            className={styles.tickerText}
            style={{ opacity: fadeIn ? 1 : 0 }}
          >
            {MARQUEE_MESSAGES[currentMessage]}
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className={styles.right}>
        <div className={styles.dateChip}>
          <span className={styles.dateIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <span>{today}</span>
        </div>

        <button
          className={styles.iconBtn}
          onClick={() => setNotifDot(false)}
          aria-label="Thông báo"
        >
          <IconBell />
          {notifDot && <span className={styles.notifBadge} />}
        </button>

        <div className={styles.userChip}>
          <div className={styles.chipAvatar}>
            {user?.anh_dai_dien ? (
              <img
                src={getPublicUrl(user.anh_dai_dien)}
                alt="avatar"
                className={styles.avatarImg}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <span>{getInitials(user?.ho_ten)}</span>
            )}
          </div>

          <div className={styles.chipInfo}>
            <span className={styles.chipName}>
              {user?.ho_ten || "Người dùng"}
            </span>
            <span className={styles.chipRole}>
              {user?.role === "admin"
                ? "Quản trị viên"
                : user?.role === "giaovien"
                  ? "Giáo viên"
                  : "Học sinh"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
