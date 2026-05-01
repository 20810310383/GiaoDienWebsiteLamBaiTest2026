import { apiFetchTongQuat } from "./apiTongQuat";

/**
 * 1. Lấy danh sách thể loại bài viết
 * @param {Object} params - { page, limit, search }
 */
export async function getTheLoai(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/the-loai-bai-viet?${queryString}`, {
    method: "GET",
  });
}

/**
 * 2. Lấy chi tiết thể loại bài viết theo ID
 */
export async function getTheLoaiBaiVietById(id) {
  return await apiFetchTongQuat(`/api/the-loai-bai-viet/${id}`, {
    method: "GET",
  });
}

/**
 * 3. Lấy thể loại theo mã (maTL)
 */
export async function getTheLoaiByMa(maTL) {
  return await apiFetchTongQuat(`/api/the-loai-bai-viet/ma/${maTL}`, {
    method: "GET",
  });
}

/**
 * 4. Tạo thể loại bài viết mới (Admin)
 */
export async function createTheLoai(data, token) {
  return await apiFetchTongQuat("/api/the-loai-bai-viet", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 5. Cập nhật thể loại bài viết (Admin)
 */
export async function updateTheLoaiBaiViet(id, data, token) {
  return await apiFetchTongQuat(`/api/the-loai-bai-viet/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 6. Xóa thể loại bài viết (Admin)
 */
export async function deleteTheLoaiBaiViet(id, token) {
  return await apiFetchTongQuat(`/api/the-loai-bai-viet/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}