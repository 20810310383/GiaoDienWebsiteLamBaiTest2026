import React, { useEffect, useState } from "react";
import { createBrowserRouter, useLocation, Outlet } from "react-router-dom";

// Components
import NotFound from "./components/NotFound";
import ForbiddenPage from "./pages/PageAdmin/ForbiddenPage/ForbiddenPage";
import DangNhap from "./pages/Login";
// Layouts & Pages
import DashboardLayout from "./components/layout/DashboardLayout/DashboardLayout";
import UserProtectedRoute from "./components/ProtectedRoute/UserProtectedRoute";
import RoleProtectedRoute from "./components/ProtectedRoute/RoleProtectedRoute";

// Pages
import Home from "./pages/Home";
import TaiKhoanCuaToi from "./pages/Admin/TaiKhoanCuaToi";
import Classes from "./pages/Admin/Classes";
import BaiGiang from "./pages/Admin/Classes/BaiGiang";
import BoSuuTap from "./pages/HocSinh/BoSuuTap";
import LamBai from "./pages/HocSinh/LamBai";
import LichSuThi from "./pages/Admin/LichSuThi";
import QuanLyTaiKhoan from "./pages/Admin/QuanLyTaiKhoan";

// CSS
import "./layout.css";

const SCROLL_THRESHOLD = 80;

// Hỗ trợ cuộn lên đầu trang
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const router = createBrowserRouter([
  // ================== PUBLIC ROUTES ==================
  {
    path: "/dang-nhap",
    element: (
      <>
        <ScrollToTop />
        <DangNhap />
      </>
    ),
  },

  // ================== PROTECTED ROUTES ==================
  {
    path: "/",
    element: <UserProtectedRoute />,
    errorElement: <NotFound />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // ================== ALL USERS ==================
          { index: true, element: <Home /> },
          { path: "tai-khoan-cua-toi", element: <TaiKhoanCuaToi /> },

          // ================== ADMIN ONLY ==================
          {
            path: "admin/quan-ly-tai-khoan",
            element: (
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <QuanLyTaiKhoan />
              </RoleProtectedRoute>
            ),
          },

          // ================== ADMIN & GIAO VIEN ==================
          {
            path: "lop-hoc",
            element: (
              <RoleProtectedRoute allowedRoles={["admin", "giaovien", "hocsinh"]}>
                <Classes />
              </RoleProtectedRoute>
            ),
          },
          {
            path: "lop-hoc/bai-giang/:classId/:className",
            element: (
              <RoleProtectedRoute allowedRoles={["admin", "giaovien", "hocsinh"]}>
                <BaiGiang />
              </RoleProtectedRoute>
            ),
          },
          {
            path: "admin/lich-su-thi",
            element: (
              <RoleProtectedRoute allowedRoles={["admin", "giaovien"]}>
                <LichSuThi />
              </RoleProtectedRoute>
            ),
          },

          // ================== ALL USERS (Hoc sinh co the xem bo suu tap) ==================
          { path: "hoc-sinh/bo-suu-tap", element: <BoSuuTap /> },
          { path: "hoc-sinh/lam-bai/:id", element: <LamBai /> },

          // ================== FORBIDDEN ==================
          { path: "403", element: <ForbiddenPage /> },
        ],
      },
    ],
  },
]);

export default router;
