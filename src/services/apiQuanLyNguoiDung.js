import { apiFetchTongQuat } from "./apiTongQuat";

const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      query.append(key, value);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
};

// Lấy danh sách người dùng
export const getAllUsers = async (params = {}, token) => {
  return apiFetchTongQuat(`/api/admin/nguoi-dung${buildQueryString(params)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Lấy thống kê người dùng
export const getUserStats = async (token) => {
  return apiFetchTongQuat("/api/admin/nguoi-dung/stats", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Lấy chi tiết người dùng
export const getUserById = async (id, token) => {
  return apiFetchTongQuat(`/api/admin/nguoi-dung/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Tạo người dùng mới
export const createUser = async (data, token) => {
  return apiFetchTongQuat("/api/admin/nguoi-dung", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
};

// Cập nhật người dùng
export const updateUser = async (id, data, token) => {
  return apiFetchTongQuat(`/api/admin/nguoi-dung/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
};

// Đổi mật khẩu
export const changeUserPassword = async (id, mat_khau_moi, token) => {
  return apiFetchTongQuat(`/api/admin/nguoi-dung/${id}/doi-mat-khau`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: { mat_khau_moi },
  });
};

// Phân quyền
export const changeUserRole = async (id, data, token) => {
  return apiFetchTongQuat(`/api/admin/nguoi-dung/${id}/phan-quyen`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
};

// Khóa/Mở khóa tài khoản
export const toggleUserStatus = async (id, token) => {
  return apiFetchTongQuat(`/api/admin/nguoi-dung/${id}/toggle-status`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: {},
  });
};

// Xóa người dùng
export const deleteUser = async (id, token) => {
  return apiFetchTongQuat(`/api/admin/nguoi-dung/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};
