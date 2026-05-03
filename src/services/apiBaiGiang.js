import { apiFetchTongQuat } from "./apiTongQuat";

/* ──────────────────────────────────────────────────────────────────
   ROUTES CRUD CƠ BẢN
   ────────────────────────────────────────────────────────────────── */

/**
 * 1. Tạo bài giảng mới (Giáo viên/Admin)
 * @param {Object} data - { id_lop_hoc, ten_bai_giang, anhDaiDien, gioiThieu, monHoc, noi_dung_bai_hoc, danhSachCauHoi, thoi_gian_lam_bai, giaBaiGiang }
 * @param {string} token
 */
export async function createBaiGiang(data, token) {
  return await apiFetchTongQuat("/api/bai-giang", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 2. Lấy tất cả bài giảng (Có phân trang, tìm kiếm, lọc)
 * @param {Object} params - { page, limit, search, id_lop_hoc, sortBy, order }
 * @param {string} token
 */
export async function getAllBaiGiang(params = {}, token) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/bai-giang?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 3. Lấy chi tiết một bài giảng
 * @param {string} id - ID bài giảng
 * @param {string} token
 */
export async function getBaiGiangById(id, token) {
  return await apiFetchTongQuat(`/api/bai-giang/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 4. Cập nhật bài giảng (Giáo viên/Admin)
 * @param {string} id - ID bài giảng
 * @param {Object} data - Dữ liệu cần cập nhật
 * @param {string} token
 */
export async function updateBaiGiang(id, data, token) {
  return await apiFetchTongQuat(`/api/bai-giang/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 5. Xóa bài giảng (Giáo viên/Admin)
 * @param {string} id - ID bài giảng
 * @param {string} token
 */
export async function deleteBaiGiang(id, token) {
  return await apiFetchTongQuat(`/api/bai-giang/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
   ROUTES THEO LỚP HỌC
   ────────────────────────────────────────────────────────────────── */

/**
 * 6. Lấy bài giảng theo lớp học
 * @param {string} id_lop_hoc - ID lớp học
 * @param {Object} params - { page, limit }
 * @param {string} token
 */
export async function getBaiGiangByLopHoc(id_lop_hoc, params = {}, token) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/bai-giang/lop-hoc/${id_lop_hoc}?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
   ROUTES QUẢN LÝ CÂU HỎI
   ────────────────────────────────────────────────────────────────── */

/**
 * 7. Thêm một câu hỏi vào bài giảng (Giáo viên/Admin)
 * @param {string} id - ID bài giảng
 * @param {Object} data - { noiDungCauHoi, cacDapAn: [{ noiDungDapAn, laDapAnDung }], giaiThich }
 * @param {string} token
 */
export async function themCauHoi(id, data, token) {
  return await apiFetchTongQuat(`/api/bai-giang/${id}/cau-hoi`, {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 8. Thêm nhiều câu hỏi cùng lúc (Giáo viên/Admin)
 * @param {string} id - ID bài giảng
 * @param {Object} data - { cauHois: [...] }
 * @param {string} token
 */
export async function themNhieuCauHoi(id, data, token) {
  return await apiFetchTongQuat(`/api/bai-giang/${id}/cau-hoi/nhieu`, {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 9. Cập nhật câu hỏi trong bài giảng (Giáo viên/Admin)
 * @param {string} id - ID bài giảng
 * @param {string} cauHoiId - ID câu hỏi
 * @param {Object} data - Dữ liệu cần cập nhật
 * @param {string} token
 */
export async function updateCauHoi(id, cauHoiId, data, token) {
  return await apiFetchTongQuat(`/api/bai-giang/${id}/cau-hoi/${cauHoiId}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 10. Xóa câu hỏi khỏi bài giảng (Giáo viên/Admin)
 * @param {string} id - ID bài giảng
 * @param {string} cauHoiId - ID câu hỏi
 * @param {string} token
 */
export async function xoaCauHoi(id, cauHoiId, token) {
  return await apiFetchTongQuat(`/api/bai-giang/${id}/cau-hoi/${cauHoiId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 11. Sắp xếp lại thứ tự câu hỏi (Giáo viên/Admin)
 * @param {string} id - ID bài giảng
 * @param {Object} data - { cauHoiIds: [...] } - Danh sách ID câu hỏi theo thứ tự mới
 * @param {string} token
 */
export async function sapXepCauHoi(id, data, token) {
  return await apiFetchTongQuat(`/api/bai-giang/${id}/cau-hoi/sap-xep`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
   ROUTES THỐNG KÊ
   ────────────────────────────────────────────────────────────────── */

/**
 * 12. Lấy thống kê bài giảng (Cho dashboard - Giáo viên/Admin)
 * @param {Object} params - { id_lop_hoc } (optional)
 * @param {string} token
 */
export async function getThongKeBaiGiang(params = {}, token) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/bai-giang/thong-ke/tong-quan?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ──────────────────────────────────────────────────────────────────
   IMPORT TỪ FILE
   ────────────────────────────────────────────────────────────────── */

/**
 * 13. Import câu hỏi từ file Word (.docx)
 * @param {string} id - ID bài giảng
 * @param {File} file - File Word cần import
 * @param {string} token
 */
export async function importCauHoiTuWord(id, file, token) {
  const formData = new FormData();
  formData.append('file', file);

  return await apiFetchTongQuat(`/api/bai-giang/${id}/cau-hoi/import-word`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
