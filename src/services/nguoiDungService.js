import { apiFetchTongQuat } from "./apiTongQuat";

/**
 * 1. Lấy danh sách người dùng
 * @param {Object} params - { page, limit, search, role, isActive }
 */
export async function getAllUsers(params = {}, token) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/nguoidung?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 2. Lấy chi tiết một người dùng
 */
export async function getUserById(id, token) {
  return await apiFetchTongQuat(`/api/nguoidung/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 3. Tạo tài khoản mới (Dành cho Admin tạo nhân viên)
 */
export async function createUser(data, token) {
  return await apiFetchTongQuat("/api/nguoidung", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 4. Cập nhật thông tin người dùng
 */
export async function updateUser(id, data, token) {
  return await apiFetchTongQuat(`/api/nguoidung/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 5. Khóa hoặc Mở khóa tài khoản (Active/Deactive)
 */
export async function toggleUserActive(id, token) {
  return await apiFetchTongQuat(`/api/nguoidung/toggle-active/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 6. Xóa vĩnh viễn người dùng
 */
export async function deleteUser(id, token) {
  return await apiFetchTongQuat(`/api/nguoidung/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}