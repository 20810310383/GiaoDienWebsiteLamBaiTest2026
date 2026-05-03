import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles, requiredPermission }) => {
  const { isLoggedIn, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }


  // 1. Kiểm tra vai trò - tạm đóng
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // 2. Kiểm tra permission
  // if (requiredPermission) {
  //   const hasPermission = user.permissions?.includes(requiredPermission);

  //   if (!hasPermission) {
  //     return <Navigate to="/admin/403" replace />;
  //   }
  // }

  return <Outlet />;
};

export default ProtectedRoute;
