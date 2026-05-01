import { apiFetchTongQuat } from "./apiTongQuat";

// Đăng ký tài khoản
export async function registerUser(data) {
  return await apiFetchTongQuat("/api/auth/register", {
    method: "POST",
    body: data,
  });
}

// Đăng nhập
export async function loginUser(data) {
  return await apiFetchTongQuat("/api/auth/login", {
    method: "POST",
    body: data,
  });
}

// Lấy thông tin người dùng hiện tại (dựa theo token)
export async function getUserProfile(token) {
  return await apiFetchTongQuat("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Đăng xuất (frontend xóa token)
export async function logoutUser(token) {
  return await apiFetchTongQuat("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export async function xacThucOTPAndRegister(data) {
  return await apiFetchTongQuat("/api/auth/verify-register", {
    method: "POST",
    body: data,
  });
}

export async function doiMatKhau(data, token) {
  return await apiFetchTongQuat("/api/auth/doi-mat-khau", {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function capNhatThongTin(data, token) {
  return await apiFetchTongQuat("/api/auth/cap-nhat-thong-tin", {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}