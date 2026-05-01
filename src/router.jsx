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
  // 1️⃣ DASHBOARD LÀ GỐC (PATH: "/")
  // Toàn bộ các trang quản lý sẽ nằm ở đây
  {
    path: "/",
    element: (
      <UserProtectedRoute>
        {/* <ScrollToTop /> */}
        <DashboardLayout />
      </UserProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true, // Đây sẽ là trang mặc định khi vào domain.com
        element: <Home />,
      },
      {
        path: "mon-hoc",
        element: <div>Trang quản lý môn học</div>,
      },
      {
        path: "lop-hoc",
        element: <div>Trang quản lý lớp học</div>,
      },
      {
        path: "lich-su",
        element: <div>Trang xem lịch sử làm bài</div>,
      },
      {
        path: "403",
        element: <ForbiddenPage />,
      },
    ],
  },

  // 2️⃣ TRANG ĐĂNG NHẬP (Nằm ngoài Layout Dashboard)
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
