import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Bell,
  ChevronDown,
  BookOpen,
  Smartphone,
} from "lucide-react";
import { Dropdown, Avatar, Tooltip } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { getPublicUrl } from "../../utils/formatURL";
import styles from "./HeaderApp.module.css";
import DownloadWithCountdown from "./downloadAPK";

const HeaderApp = () => {
  const { user, handleLogout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm kiểm tra active linh hoạt
  const isActive = (path) => (location.pathname === path ? styles.active : "");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuUser = [
    {
      key: "profile",
      label: (
        <Link
          to="/admin/profile"
          onClick={() => (window.location.href = "/admin/profile")}
        >
          Trang cá nhân
        </Link>
      ),
      icon: <User size={16} />,
    },
    user?.role === "admin" && {
      key: "admin",
      label: (
        <Link to="/admin" onClick={() => (window.location.href = "/admin")}>
          Quản trị viên
        </Link>
      ),
      icon: <LayoutDashboard size={16} />,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogOut size={16} />,
      danger: true,
      onClick: () => {
        handleLogout();
        navigate("/");
      },
    },
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          {/* Thay thế icon và text bằng ảnh logo */}
          <img
            src="/logo_transparent_clean.png"
            alt="VuaQuiz Logo"
            className={styles.logoImg}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link to="/" className={isActive("/")}>
            Trang chủ
          </Link>
          <Link
            to="/danh-sach-de-thi"
            className={isActive("/danh-sach-de-thi")}
          >
            Kho đề thi
          </Link>
          {/* <Link to="/danh-muc" className={isActive("/danh-muc")}>
            Danh mục
          </Link> */}
          <Link to="/bang-xep-hang" className={isActive("/bang-xep-hang")}>
            Bảng xếp hạng
          </Link>
          <Link
            to="/chia-se-tai-lieu"
            className={isActive("/chia-se-tai-lieu")}
          >
            Chia sẻ tài liệu
          </Link>
          <Link to="/cong-dong" className={isActive("/cong-dong")}>
            Cộng đồng VuaQuiz
          </Link>
          <Link to="/tin-tuc" className={isActive("/tin-tuc")}>
            Tin tức
          </Link>
        </nav>

        {/* Actions Area */}
        <div className={styles.actions}>
          {/* NÚT TẢI APP TRÊN DESKTOP */}
          <Tooltip title="Tải ứng dụng VuaQuiz trên Android" placement="bottom">
            <DownloadWithCountdown />
          </Tooltip>

          {/* Desktop User Profile */}
          <div className={styles.desktopUserAction}>
            {user ? (
              <Dropdown
                menu={{ items: menuUser }}
                placement="bottomRight"
                arrow
              >
                <div className={styles.userProfile}>
                  <Avatar
                    src={getPublicUrl(user.avatar)}
                    className={styles.avatar}
                  />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.hoTen}</span>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </Dropdown>
            ) : (
              <Link to="/dang-nhap" className={styles.registerBtn}>
                Tham gia ngay
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.menuOpen : ""}`}
      >
        <div className={styles.mobileMenuContent}>
          {/* Mobile User Header */}
          {user ? (
            <div className={styles.mobileUserBox}>
              <Avatar src={getPublicUrl(user.avatar)} size={60} />
              <div className={styles.mobileUserDetail}>
                <span className={styles.mobileName}>{user.hoTen}</span>
                <span className={styles.mobileRole}>
                  {user.role === "admin" ? "Quản trị viên" : "Học viên"}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.mobileAuthBox}>
              <p>Chào mừng bạn đến với VuaQuiz</p>
              <Link
                to="/dang-nhap"
                className={styles.registerBtn}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}

          <div className={styles.mobileDivider} />

          {/* Mobile Nav Links */}
          <nav className={styles.mobileNavLinks}>
            <Link
              to="/"
              className={isActive("/")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/danh-sach-de-thi"
              className={isActive("/danh-sach-de-thi")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Kho đề thi
            </Link>
            {/* <Link
              className={isActive("/danh-muc")}
              to="/danh-muc"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Danh mục
            </Link> */}
            <Link
              to="/bang-xep-hang"
              className={isActive("/bang-xep-hang")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Bảng xếp hạng
            </Link>

            <Link
              to="/chia-se-tai-lieu"
              className={isActive("/chia-se-tai-lieu")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Chia sẻ tài liệu
            </Link>

            <Link
              to="/cong-dong"
              className={isActive("/cong-dong")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cộng đồng VuaQuiz
            </Link>

            <Link
              to="/tin-tuc"
              className={isActive("/tin-tuc")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tin tức
            </Link>

            {user && (
              <>
                <div className={styles.mobileDivider} />
                <Link
                  to="/admin/profile"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = "/admin/profile";
                  }}
                >
                  Trang cá nhân
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => {
                      window.location.href = "/admin";
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Quản trị hệ thống
                  </Link>
                )}
                <button
                  className={styles.mobileLogout}
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={18} /> Đăng xuất
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default HeaderApp;
