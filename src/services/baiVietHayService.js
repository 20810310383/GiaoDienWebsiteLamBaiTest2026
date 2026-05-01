import { apiFetchTongQuat } from "./apiTongQuat";

/**
 * 1. Lấy danh sách bài viết hay (Hỗ trợ phân trang, tìm kiếm, lọc theo categoryId)
 * @param {Object} params - { page, limit, search, categoryId }
 */
export async function getBaiViet(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/bai-viet-hay?${queryString}`, {
    method: "GET",
  });
}

/**
 * 2. Lấy chi tiết bài viết theo ID
 */
export async function getBaiVietById(id) {
  return await apiFetchTongQuat(`/api/bai-viet-hay/${id}`, {
    method: "GET",
  });
}

/**
 * 3. Lấy bài viết theo mã (maBV) - Phục vụ cho SEO URL
 */
export async function getBaiVietByMa(maBV) {
  return await apiFetchTongQuat(`/api/bai-viet-hay/ma/${maBV}`, {
    method: "GET",
  });
}

/**
 * 4. Tạo bài viết mới (Admin)
 */
export async function createBaiViet(data, token) {
  return await apiFetchTongQuat("/api/bai-viet-hay", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 5. Cập nhật bài viết (Admin)
 */
export async function updateBaiViet(id, data, token) {
  return await apiFetchTongQuat(`/api/bai-viet-hay/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 6. Xóa bài viết (Admin)
 */
export async function deleteBaiViet(id, token) {
  return await apiFetchTongQuat(`/api/bai-viet-hay/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}