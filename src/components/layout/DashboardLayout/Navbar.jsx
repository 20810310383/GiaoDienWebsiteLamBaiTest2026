import React, { useState, useEffect, useRef } from "react";
import { useLocation, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { getInitials } from "../../../utils/scrollUtils";
import { getPublicUrl } from "../../../utils/formatURL";

/* ── Icons ── */
const IconMenu = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconMenuClose = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconSearch = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconBell = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const IconSun = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

/* ── Breadcrumb map ── */
const ROUTE_LABELS = {
  "/": "Trang chủ",
  "/lop-hoc": "Lớp học",
  "/lich-su": "Lịch sử làm bài",
  "/lop-hoc/bai-giang/:classId/:className": "Bài giảng",
  "/403": "Quyền truy cập",
  "/tai-khoan-cua-toi": "Tài khoản của tôi",
};

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const location = useLocation();
  const [searchActive, setSearchActive] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [notifDot, setNotifDot] = useState(true);
  const searchRef = useRef(null);
  const { isLoggedIn, user, handleLogout } = useAuth();

  const pageTitle = ROUTE_LABELS[location.pathname] || "Trang";

  // Scroll detection for glass effect enhancement
  useEffect(() => {
    const el = document.querySelector("main") || window;
    const handler = () => setScrolled((el.scrollTop || window.scrollY) > 10);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchActive) searchRef.current?.focus();
  }, [searchActive]);

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

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

      {/* Center search */}
      <div
        className={`${styles.searchBar} ${searchActive ? styles.searchActive : ""}`}
      >
        <span className={styles.searchIcon}>
          <IconSearch />
        </span>
        <input
          ref={searchRef}
          type="text"
          className={styles.searchInput}
          placeholder="Tìm kiếm môn học, bài thi..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onFocus={() => setSearchActive(true)}
          onBlur={() => {
            setSearchActive(false);
          }}
        />
        {searchVal && (
          <button
            className={styles.searchClear}
            onClick={() => setSearchVal("")}
          >
            ×
          </button>
        )}
        <kbd className={styles.searchKbd}>⌘K</kbd>
      </div>

      {/* Right actions */}
      <div className={styles.right}>
        <span className={styles.dateChip}>{today}</span>

        <button
          className={styles.iconBtn}
          onClick={() => setNotifDot(false)}
          aria-label="Thông báo"
        >
          <IconBell />
          {notifDot && <span className={styles.notifBadge} />}
        </button>

        {/* <button className={styles.iconBtn} aria-label="Giao diện">
          <IconSun />
        </button> */}

        <div className={styles.userChip}>
          <div className={styles.chipAvatar}>
            {user?.anh_dai_dien ? (
              <img
                src={getPublicUrl(user.anh_dai_dien)}
                alt="avatar"
                className={styles.avatarImg}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : (
              <span className={user?.anh_dai_dien ? styles.hiddenInitial : ""}>
                {getInitials(user?.ho_ten)}
              </span>
            )}
          </div>

          <div className={styles.chipInfo}>
            <span className={styles.chipName}>
              {user?.ho_ten || "Người dùng"}
            </span>
            <span className={styles.chipRole}>
              {user?.vai_tro === "admin"
                ? "Quản trị viên"
                : user?.vai_tro === "giaovien"
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
