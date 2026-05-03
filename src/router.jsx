import React, { useEffect, useState } from "react";
import { createBrowserRouter, useLocation, Outlet } from "react-router-dom";

// Components
import NotFound from "./components/NotFound";
import ForbiddenPage from "./pages/PageAdmin/ForbiddenPage/ForbiddenPage";
import DangNhap from "./pages/Login";
// Layouts & Pages
import DashboardLayout from "./components/layout/DashboardLayout/DashboardLayout";
import UserProtectedRoute from "./components/ProtectedRoute/UserProtectedRoute";

// CSS
import "./layout.css";
import Home from "./pages/Home";
import TaiKhoanCuaToi from "./pages/Admin/TaiKhoanCuaToi";
import Classes from "./pages/Admin/Classes";
import BaiGiang from "./pages/Admin/Classes/BaiGiang";
import BoSuuTap from "./pages/HocSinh/BoSuuTap";
import LamBai from "./pages/HocSinh/LamBai";
import LichSuThi from "./pages/Admin/LichSuThi";

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
  {
    path: "/",
    // 🟢 Chuyển UserProtectedRoute lên làm element cha
    element: <UserProtectedRoute />,
    errorElement: <NotFound />,
    children: [
      {
        // 🟢 DashboardLayout sẽ nằm bên trong, bảo vệ toàn bộ con của nó
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "tai-khoan-cua-toi", element: <TaiKhoanCuaToi /> },
          { path: "lop-hoc", element: <Classes /> },
          {
            path: "lop-hoc/bai-giang/:classId/:className",
            element: <BaiGiang />,
          },
          { path: "hoc-sinh/bo-suu-tap", element: <BoSuuTap /> },
          { path: "hoc-sinh/lam-bai/:id", element: <LamBai /> },
          { path: "admin/lich-su-thi", element: <LichSuThi /> },
          { path: "403", element: <ForbiddenPage /> },
        ],
      },
    ],
  },
  {
    path: "dang-nhap",
    element: (
      <>
        <ScrollToTop />
        <DangNhap />
      </>
    ),
  },
]);

export default router;
