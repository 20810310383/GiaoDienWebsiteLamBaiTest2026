import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import styles from "./DashboardLayout.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import UnfinishedExamReminder from '../../ProtectedRoute/UnfinishedExamReminder';
import { ChatProvider } from '../../Chat/ChatContext';
import { CallProvider } from '../../Call/CallContext';
import { SoundProvider } from '../../Sound/SoundContext';

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const isClassList = pathname === "/lop-hoc";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isLoggedIn, user, handleLogout } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <SoundProvider><CallProvider><ChatProvider><div className={`${styles.root} ${isClassList ? styles.classListLayout : ""}`}>
      <UnfinishedExamReminder />
      {/* Ambient glow background */}
      <div className={styles.ambientBg}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />
        <div className={styles.glow3} />
      </div>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`${styles.mainArea} ${
          sidebarOpen && !isMobile ? styles.mainShifted : ""
        }`}
      >
        <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        <main className={styles.content}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div></ChatProvider></CallProvider></SoundProvider>
  );
};

export default DashboardLayout;
