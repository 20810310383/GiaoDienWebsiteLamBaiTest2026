import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Component này bảo vệ các trang chỉ dành cho USER đã đăng nhập.
 * Ví dụ: Trang "Tài khoản của tôi", "Đổi mật khẩu"...
 */
// const UserProtectedRoute = () => {
//   const { isLoggedIn, isLoading } = useAuth();

//   // Nếu đang trong quá trình kiểm tra (ví dụ: đang gọi API /me)
//   if (isLoading) {
//     // Bạn có thể hiển thị một spinner (biểu tượng tải) ở đây
//     return <div>Đang tải...</div>;
//   }

//   // Nếu KHÔNG đăng nhập, điều hướng về trang chủ
//   if (!isLoggedIn) {
//     // Bạn cũng có thể điều hướng về trang đăng nhập
//     // return <Navigate to="/dang-nhap" replace />;

//     return <Navigate to="/" replace />; // Điều hướng về trang chủ
//   }

//   // Nếu đã đăng nhập, cho phép truy cập trang
//   return <Outlet />;
// };

const UserProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) return <div>Đang tải hệ thống...</div>;

  if (!isLoggedIn) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // Ưu tiên trả về children nếu có, nếu không thì mới dùng Outlet
  return children ? children : <Outlet />;
};

export default UserProtectedRoute;
