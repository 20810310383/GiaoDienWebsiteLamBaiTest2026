import { apiFetchTongQuat } from "./apiTongQuat";

/**
 * 1. Lấy tất cả lớp học (Phục vụ danh sách chung, đã ẩn mã lớp)
 * @param {Object} params - { search, id_mon_hoc, ... }
 */
export async function getAllLopHoc(params = {}, token) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/lop-hoc?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 2. Lấy chi tiết 1 lớp học theo ID
 * (Giáo viên sẽ thấy mã lớp và danh sách học viên ở đây)
 */
export async function getLopHocById(id) {
  return await apiFetchTongQuat(`/api/lop-hoc/${id}`, {
    method: "GET",
  });
}

/**
 * 3. Tạo lớp học mới (Giáo viên/Admin)
 * Backend tự động sinh mã lớp ngẫu nhiên
 */
export async function createLopHoc(data, token) {
  return await apiFetchTongQuat("/api/lop-hoc", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 4. Cập nhật thông tin lớp học (Giáo viên/Admin)
 */
export async function updateLopHoc(id, data, token) {
  return await apiFetchTongQuat(`/api/lop-hoc/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 5. Xóa lớp học (Giáo viên/Admin)
 */
export async function deleteLopHoc(id, token) {
  return await apiFetchTongQuat(`/api/lop-hoc/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 6. Đổi mã lớp ngẫu nhiên mới (Giáo viên/Admin)
 * Ghi đè mã cũ ngay lập tức trong Database
 */
export async function refreshClassCode(id, token) {
  return await apiFetchTongQuat(`/api/lop-hoc/${id}/refresh-code`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 7. Phê duyệt hoặc từ chối học viên tham gia lớp (Giáo viên/Admin)
 * @param {Object} data - { classId, studentId, status: 'da_tham_gia' | 'bi_tu_choi' }
 */
export async function approveStudent(data, token) {
  return await apiFetchTongQuat("/api/lop-hoc/approve-student", {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 8. Học viên gửi mã để xin vào lớp (Học sinh)
 * @param {Object} data - { ma_lop_random }
 */
export async function joinClassByCode(data, token) {
  return await apiFetchTongQuat("/api/lop-hoc/join-by-code", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}