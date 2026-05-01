import { apiFetchTongQuat } from "./apiTongQuat";

/**
 * 1. Lấy danh sách thể loại đề thi (Có hỗ trợ phân trang & tìm kiếm)
 * @param {Object} params - { page, limit, search }
 */
export async function getAllTheLoai(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/theloaidethi?${queryString}`, {
    method: "GET",
  });
}

/**
 * 2. Lấy chi tiết một thể loại theo ID
 */
export async function getTheLoaiById(id) {
  return await apiFetchTongQuat(`/api/theloaidethi/${id}`, {
    method: "GET",
  });
}

/**
 * 3. Tạo thể loại mới (Yêu cầu quyền Admin)
 */
export async function createTheLoai(data, token) {
  return await apiFetchTongQuat("/api/theloaidethi", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 4. Cập nhật thể loại (Yêu cầu quyền Admin)
 */
export async function updateTheLoai(id, data, token) {
  return await apiFetchTongQuat(`/api/theloaidethi/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 5. Xóa vĩnh viễn thể loại (Yêu cầu quyền Admin)
 */
export async function deleteTheLoai(id, token) {
  return await apiFetchTongQuat(`/api/theloaidethi/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}