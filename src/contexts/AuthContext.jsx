import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile, loginUser, logoutUser } from "../services/apiAuth";
import { jwtDecode } from "jwt-decode"; // Nhớ cài: npm install jwt-decode
import { notification } from "antd";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Khi login thành công
  const handleLogin = async (values) => {
    const res = await loginUser(values);
    setToken(res.token);
    setUser(res.user);
    // sessionStorage.setItem("token", res.token); // lưu tạm (tự mất khi tắt tab)
    // Đổi từ sessionStorage sang localStorage để dùng chung mọi tab
    localStorage.setItem("token", res.token);
    return res;
  };

  // ✅ Bắn sự kiện khi user & token vừa thay đổi
  useEffect(() => {
    if (user && token) {
      window.dispatchEvent(new Event("user_logged_in"));
      window.dispatchEvent(new Event("cart_updated"));
    }
  }, [user, token]);

  // ✅ Kiểm tra token khi reload
  useEffect(() => {
    const tokenInSession = localStorage.getItem("token");
    if (!tokenInSession) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      try {
        const res = await getUserProfile(tokenInSession);
        setUser(res);
        setToken(tokenInSession);
      } catch (err) {
        console.warn("⛔ Token không hợp lệ hoặc bị xoá:", err.message);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Optional: Lắng nghe sự kiện logout từ tab khác để đồng bộ
    const syncLogout = (e) => {
      if (e.key === "token" && !e.newValue) {
        setUser(null);
        setToken(null);
      }
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Thời gian hiện tại (giây)

        // 1. Nếu token đã hết hạn ngay lúc load trang
        if (decoded.exp < currentTime) {
          handleLogout();
        } else {
          // 2. Tính toán thời gian còn lại (giây) và đặt hẹn giờ
          const msUntilExpire = (decoded.exp - currentTime) * 1000;

          const timer = setTimeout(() => {
            handleLogout();
            notification.warning({
              message: "Phiên đăng nhập hết hạn",
              description: "Vui lòng đăng nhập lại để tiếp tục.",
              placement: "topRight",
              duration: 5, // Tự đóng sau 5 giây
            });
          }, msUntilExpire);

          return () => clearTimeout(timer); // Xóa timer nếu user logout trước khi hết hạn
        }
      } catch (error) {
        console.error("Token lỏ:", error);
        handleLogout();
      }
    }
  }, [token]);

  useEffect(() => {
    const checkTokenSync = () => {
      const tokenInLocal = localStorage.getItem("token");
      // Nếu tab hiện tại đang có user mà localStorage lại trống (vừa logout ở tab khác)
      if (token && !tokenInLocal) {
        handleLogout();
      }
      // Nếu tab hiện tại chưa có user mà localStorage lại có (vừa login ở tab khác)
      else if (!token && tokenInLocal) {
        window.location.reload(); // Reload để nhận trạng thái login mới
      }
    };

    // Lắng nghe khi người dùng chuyển sang tab này
    window.addEventListener("focus", checkTokenSync);
    // Lắng nghe sự kiện storage (vẫn nên giữ để hỗ trợ các trình duyệt khác)
    window.addEventListener("storage", checkTokenSync);

    return () => {
      window.removeEventListener("focus", checkTokenSync);
      window.removeEventListener("storage", checkTokenSync);
    };
  }, [token]);

  // ✅ Logout thủ công hoặc khi token invalid
  const handleLogout = async () => {
    try {
      if (token) await logoutUser(token);
      // ✅ XÓA SẠCH Ở LOCALSTORAGE
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    } catch (err) {
      console.warn("⚠️ Lỗi logout:", err.message);
    } finally {
      setUser(null);
      setToken(null);
      sessionStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        isLoggedIn: !!user && !!token,
        handleLogin,
        handleLogout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
