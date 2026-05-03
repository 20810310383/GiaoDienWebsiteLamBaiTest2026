import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Component bảo vệ route dựa trên vai trò (role)
 * @param {string[]} allowedRoles - Mảng các vai trò được phép truy cập
 */
const RoleProtectedRoute = ({ allowedRoles = [], children, fallbackPath = "/403" }) => {
  const { user, isLoading, token } = useAuth();

  if (isLoading) {
    return <div>Đang tải hệ thống...</div>;
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // Kiểm tra vai trò
  if (!allowedRoles.includes(user.role)) {
    // Nếu có fallbackPath, chuyển hướng đến đó
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    // Ngược lại hiển thị trang 403
    return <Navigate to="/403" replace />;
  }

  // Ưu tiên trả về children nếu có, nếu không thì dùng Outlet
  return children ? children : <Outlet />;
};

export default RoleProtectedRoute;
