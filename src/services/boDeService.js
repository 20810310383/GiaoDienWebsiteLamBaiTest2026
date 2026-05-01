import { apiFetchTongQuat } from "./apiTongQuat";

/**
 * 1. Lấy danh sách bộ đề thi (Public/User)
 * @param {Object} params - { page, limit, search, theLoai, cheDo, trangThaiDuyet }
 */
export async function getAllDeThi(params = {}, token) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/bodethi?${queryString}`, {
    method: "GET",
  
  });
}

/**
 * 2. Lấy chi tiết bộ đề thi theo ID (Bao gồm danh sách câu hỏi)
 */
export async function getDeThiById(id) {
  return await apiFetchTongQuat(`/api/bodethi/${id}`, {
    method: "GET",
  });
}

/**
 * 3. Tạo bộ đề thi mới (Yêu cầu Token)
 * @param {Object} data - Dữ liệu bộ đề và danh sách câu hỏi
 */
export async function createDeThi(data, token) {
  return await apiFetchTongQuat("/api/bodethi", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 4. Cập nhật bộ đề thi (Yêu cầu Token)
 */
export async function updateDeThi(id, data, token) {
  return await apiFetchTongQuat(`/api/bodethi/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 5. Xóa vĩnh viễn bộ đề thi (Yêu cầu Token)
 */
export async function deleteDeThi(id, token) {
  return await apiFetchTongQuat(`/api/bodethi/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 6. Admin: Duyệt hoặc Ẩn đề thi
 * @param {String} id - ID của bộ đề
 */
export async function toggleDuyetDeThi(id, token) {
  return await apiFetchTongQuat(`/api/bodethi/toggle-duyet/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function importDeThiWord(formData, token) {
  return await apiFetchTongQuat("/api/bodethi/import-word", {
    method: "POST",
    body: formData, // Không stringify vì là FormData
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function checkDeThiPassword(id, password, token) {
  return await apiFetchTongQuat(`/api/bodethi/check-password/${id}`, {
    method: "POST",
    body: {password},
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Truyền token vào đây
    },
  });
}