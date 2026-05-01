import { apiFetchTongQuat } from "./apiTongQuat";

// 1. Lấy tất cả chính sách (Có thể truyền query lọc theo loại)
export async function getAllPolicies(params = "") {
  return await apiFetchTongQuat(`/api/chinhsach${params}`, {
    method: "GET",
  });
}

// 2. Lấy chi tiết chính sách theo slug (loại chính sách)
export async function getPolicyBySlug(slug) {
  return await apiFetchTongQuat(`/api/chinhsach/detail/${slug}`, {
    method: "GET",
  });
}

// 3. Thêm mới chính sách (Yêu cầu Admin)
export async function createPolicy(data, token) {
  return await apiFetchTongQuat("/api/chinhsach", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// 4. Cập nhật chính sách theo ID (Yêu cầu Admin)
export async function updatePolicy(id, data, token) {
  return await apiFetchTongQuat(`/api/chinhsach/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// 5. Xóa chính sách theo ID (Yêu cầu Admin)
export async function deletePolicy(id, token) {
  return await apiFetchTongQuat(`/api/chinhsach/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}