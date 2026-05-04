import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Home.module.css";

// Import APIs
import { getUserStats } from "../../services/apiQuanLyNguoiDung";
import { getAllLopHoc } from "../../services/apiLopHoc";
import { getThongKeBaiGiang } from "../../services/apiBaiGiang";
import { getDanhSach, getThongKe } from "../../services/apiLichSuThi";
import { getPublicUrl } from "../../utils/formatURL";

// Icons
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconHistory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 8 12 12 14 14" />
    <path d="M3.05 11a9 9 0 1 0 .5-4H1" />
    <polyline points="1 3 1 7 5 7" />
  </svg>
);

const IconFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconGraduation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconInbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </svg>
);

// Role labels
const roleLabels = {
  admin: { label: "Quản trị viên", icon: <IconShield /> },
  giaovien: { label: "Giáo viên", icon: <IconGraduation /> },
  hocsinh: { label: "Học sinh", icon: <IconStar /> },
};


// Quick actions config by role
const actionsConfig = {
  admin: [
    { label: "Quản lý tài khoản", icon: <IconUsers />, gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)", link: "/admin/quan-ly-tai-khoan" },
    { label: "Tạo lớp học", icon: <IconBook />, gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", link: "/lop-hoc" },
    { label: "Xem lịch sử thi", icon: <IconHistory />, gradient: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", link: "/admin/lich-su-thi" },
    { label: "Xem thống kê", icon: <IconChart />, gradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)", link: "/" },
  ],
  giaovien: [
    { label: "Quản lý lớp học", icon: <IconBook />, gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", link: "/lop-hoc" },
    { label: "Tạo bài giảng", icon: <IconFolder />, gradient: "linear-gradient(135deg, #f59e0b 0%, #eab308 100%)", link: "/lop-hoc" },
    { label: "Xem lịch sử thi", icon: <IconHistory />, gradient: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", link: "/admin/lich-su-thi" },
    { label: "Bộ sưu tập", icon: <IconFolder />, gradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)", link: "/hoc-sinh/bo-suu-tap" },
  ],
  hocsinh: [
    { label: "Bộ sưu tập", icon: <IconFolder />, gradient: "linear-gradient(135deg, #22c55e 0%, #84cc16 100%)", link: "/hoc-sinh/bo-suu-tap" },
    { label: "Làm bài thi", icon: <IconCheck />, gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", link: "/hoc-sinh/bo-suu-tap" },
    { label: "Xem lịch sử", icon: <IconHistory />, gradient: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", link: "/hoc-sinh/bo-suu-tap" },
    { label: "Tài khoản", icon: <IconUsers />, gradient: "linear-gradient(135deg, #f59e0b 0%, #eab308 100%)", link: "/tai-khoan-cua-toi" },
  ],
};

// Recent activities config by role
const activitiesConfig = {
  admin: [
    { title: "Chào mừng đến với hệ thống", meta: "Bạn có quyền quản trị cao nhất", icon: <IconShield />, color: "#ef4444" },
    { title: "Quản lý người dùng", meta: "Thêm, sửa, xóa tài khoản", icon: <IconUsers />, color: "#3b82f6" },
    { title: "Theo dõi lịch sử thi", meta: "Xem chi tiết bài thi của học sinh", icon: <IconHistory />, color: "#8b5cf6" },
  ],
  giaovien: [
    { title: "Chào mừng giáo viên", meta: "Quản lý lớp học và bài giảng", icon: <IconGraduation />, color: "#3b82f6" },
    { title: "Tạo bài giảng mới", meta: "Soạn câu hỏi và nội dung", icon: <IconBook />, color: "#10b981" },
    { title: "Theo dõi tiến độ học sinh", meta: "Xem lịch sử làm bài", icon: <IconHistory />, color: "#8b5cf6" },
  ],
  hocsinh: [
    { title: "Chào mừng đến với hệ thống", meta: "Học tập hiệu quả cùng chúng tôi", icon: <IconStar />, color: "#22c55e" },
    { title: "Khám phá bộ sưu tập", meta: "Danh sách bài giảng đã mua", icon: <IconFolder />, color: "#3b82f6" },
    { title: "Làm bài thi trắc nghiệm", meta: "Kiểm tra kiến thức của bạn", icon: <IconCheck />, color: "#8b5cf6" },
  ],
};

const Home = () => {
  const { user, isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = user?.role || "hocsinh";
  const roleInfo = roleLabels[role] || roleLabels.hocsinh;
  const userName = user?.ho_ten || user?.name || user?.username || "Bạn";
  const firstName = userName.split(" ").pop() || userName;
  const avatar = user?.anh_dai_dien || user?.avatar_url || user?.avatar_path || "https://ui-avatars.com/api/?name=" + userName;


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const currentActions = actionsConfig[role] || actionsConfig.hocsinh;
  const currentActivities = recentActivities.length > 0 ? recentActivities : (activitiesConfig[role] || activitiesConfig.hocsinh);

  return (
    <div className={styles.page}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeCard}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {user?.anh_dai_dien ? (
                <img src={getPublicUrl(user?.anh_dai_dien)} alt="Avatar" className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarText}>{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className={styles.avatarRing} />
            <div className={styles.onlineBadge} />
          </div>

          <div className={styles.welcomeInfo}>
            <div className={styles.greeting}>{getGreeting()}</div>
            <h1 className={styles.welcomeName}>
              Xin chào, <span>{firstName}!</span>
            </h1>
            <div className={styles.roleBadge}>
              <span className={styles.roleIcon}>{roleInfo.icon}</span>
              {roleInfo.label}
            </div>
            <div className={styles.welcomeMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}><IconClock /></span>
                {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </div>

     

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>
            <IconFolder />
            Thao tác nhanh
          </h2>
          <div className={styles.actionsGrid}>
            {currentActions.map((action, index) => (
              <button
                key={index}
                className={styles.actionBtn}
                onClick={() => navigate(action.link)}
              >
                <div className={styles.actionIcon} style={{ background: action.gradient }}>
                  {action.icon}
                </div>
                <span className={styles.actionLabel}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.recentActivity}>
          <h2 className={styles.sectionTitle}>
            <IconInbox />
            Hoạt động gần đây
          </h2>
          <div className={styles.activityList}>
            {currentActivities.length > 0 ? (
              currentActivities.map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon} style={{ background: `${activity.color}15`, color: activity.color }}>
                    {activity.icon}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>{activity.title}</div>
                    <div className={styles.activityMeta}>{activity.meta}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyActivity}>
                <IconInbox />
                <p className={styles.emptyText}>Chưa có hoạt động gần đây</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
