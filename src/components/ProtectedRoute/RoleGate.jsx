import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { canAccess } from "../../config/rolePermissions";

/**
 * Component ẩn/hiện nội dung dựa trên vai trò
 * @param {string[]} allowedRoles - Mảng các vai trò được phép xem
 * @param {string} path - Đường dẫn route cần kiểm tra
 */
const RoleGate = ({ allowedRoles = [], path = null, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) return fallback;

  // Nếu có allowedRoles, kiểm tra trực tiếp
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return fallback;
    }
    return children;
  }

  // Nếu có path, kiểm tra quyền truy cập route
  if (path) {
    if (!canAccess(user.role, path)) {
      return fallback;
    }
    return children;
  }

  // Nếu không có điều kiện nào, mặc định hiển thị
  return children;
};

export default RoleGate;
