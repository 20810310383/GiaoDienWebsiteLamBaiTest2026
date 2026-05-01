// components/PublicRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

const PublicRoute = () => {
  if (isAuthenticated()) {
    // Đã đăng nhập thì không cho vào trang login nữa
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
};

export default PublicRoute;
