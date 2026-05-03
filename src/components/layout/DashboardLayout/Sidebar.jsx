import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { getInitials } from "../../../utils/scrollUtils";
import { getPublicUrl } from "../../../utils/formatURL";
import baiGiangThuongMaiAPI from "../../../services/baiGiangThuongMaiAPI";

/* ── Icons (inline SVG) ── */
const IconHome = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconBook = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <line x1="12" y1="6" x2="16" y2="6" />
    <line x1="12" y1="10" x2="16" y2="10" />
  </svg>
);

const IconUsers = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconHistory = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="12 8 12 12 14 14" />
    <path d="M3.05 11a9 9 0 1 0 .5-4H1" />
    <polyline points="1 3 1 7 5 7" />
  </svg>
);

const IconCollection = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const IconShield = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconLogout = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconClose = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Nav items config ── */

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const location = useLocation();
  const { isLoggedIn, user, handleLogout } = useAuth();
  const [tienDo, setTienDo] = useState({ phanTramHoanThanh: 0, tongBaiDaMua: 0 });
  
  const NAV_ITEMS = [
    {
      group: "Tổng quan",
      items: [
        {
          to: "/",
          label: "Trang chủ",
          icon: <IconHome />,
          exact: true,
          roles: ["admin", "giaovien", "hocsinh"],
          accent: "violet",
        },
      ],
    },
    {
      group: "Quản trị",
      items: [
        {
          to: "/admin/quan-ly-tai-khoan",
          label: "Quản lý tài khoản",
          icon: <IconShield />,
          accent: "red",
          roles: ["admin"],
        },
        {
          to: "/lop-hoc",
          label: user?.role === "hocsinh" ? "Danh sách các lớp" : "Quản lý lớp học",
          icon: <IconBook />,
          accent: "cyan",
          roles: ["admin", "giaovien", "hocsinh"],
        },
        {
          to: "/admin/lich-su-thi",
          label: "Lịch sử thi",
          icon: <IconHistory />,
          accent: "amber",
          roles: ["admin", "giaovien"],
        },
      ],
    },
    {
      group: "Học tập",
      items: [
        {
          to: "/hoc-sinh/bo-suu-tap",
          label: "Bộ sưu tập",
          icon: <IconCollection />,
          accent: "violet",
        },
      ],
    },
    {
      group: "Hệ thống",
      items: [
        {
          to: "/tai-khoan-cua-toi",
          label: "Thông tin tài khoản",
          icon: <IconUsers />,
          accent: "blue",
        },
        {
          to: "/403",
          label: "Quyền truy cập",
          icon: <IconShield />,
          accent: "emerald",
        },
      ],
    },
  ];
  // Lấy tiến độ học tập
  useEffect(() => {
    const fetchTienDo = async () => {
      const token = localStorage.getItem("token");
      if (!token || user?.role !== "hocsinh") return;
      
      try {
        const res = await baiGiangThuongMaiAPI.getTienDoHocTap(token);
        if (res.success) {
          setTienDo(res.data);
        }
      } catch (error) {
        console.error("Lỗi lấy tiến độ:", error);
      }
    };

    fetchTienDo();
  }, [user]);

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      >
        {/* Header / Logo */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <span>E</span>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>EduPlatform</span>
              <span className={styles.logoSub}>Học tập thông minh</span>
            </div>
          </div>
          {isMobile && (
            <button className={styles.closeBtn} onClick={onClose}>
              <IconClose />
            </button>
          )}
        </div>

        {/* User card */}
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.anh_dai_dien ? (
              <img
                src={getPublicUrl(user.anh_dai_dien)}
                className={styles.avatarImg}
                alt="Avatar"
                onError={(e) => {
                  // Nếu ảnh lỗi (link die), chuyển về hiển thị chữ
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
            ) : (
              <span>{getInitials(user?.ho_ten)}</span>
            )}
            <span className={styles.avatarOnline} />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.ho_ten || "Người dùng"}
            </span>
            <span className={styles.userRole}>
              {{
                admin: "Quản trị viên",
                giaovien: "Giáo viên",
                hocsinh: "Học sinh",
              }[user?.role] || "Người dùng"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className={styles.navGroup}>
              <span className={styles.groupLabel}>{group.group}</span>
              <ul className={styles.navList}>
                {group.items.map((item) => {
                  // Kiểm tra role nếu có yêu cầu
                  if (item.roles && !item.roles.includes(user?.role)) {
                    return null;
                  }
                  const active = isActive(item.to, item.exact);
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.exact}
                        onClick={isMobile ? onClose : undefined}
                        className={`${styles.navItem} ${active ? styles.navItemActive : ""} ${styles[`accent_${item.accent}`]}`}
                      >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                        {active && <span className={styles.activePill} />}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className={styles.sidebarBottom}>
          {user?.role === "hocsinh" && (
            <div className={styles.bottomCard}>
              <div className={styles.progressInfo}>
                <span>Tiến độ học tập</span>
                <span className={styles.progressPct}>{tienDo.phanTramHoanThanh}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${tienDo.phanTramHoanThanh}%` }} 
                />
              </div>
              <span className={styles.progressSub}>
                {tienDo.baiDaHoanThanh || 0}/{tienDo.tongBaiDaMua || 0} bài đã hoàn thành
              </span>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <IconLogout />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
