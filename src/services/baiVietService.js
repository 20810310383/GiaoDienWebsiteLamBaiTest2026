import { apiFetchTongQuat } from "./apiTongQuat";

// 1. Lấy danh sách bài viết (Có phân trang)
// Ví dụ params: "?status=true&page=1&limit=10"
export async function getPosts(params = "?status=false") {
  return await apiFetchTongQuat(`/api/baiviet${params}`, {
    method: "GET",
  });
}

// 2. Đăng bài mới
export async function createPost(data, token) {
  return await apiFetchTongQuat("/api/baiviet/create", {
    method: "POST",
    body: data, // Gồm content, image, video, audio
    headers: { Authorization: `Bearer ${token}` },
  });
}

// 3. Thả tim / Bỏ tim
export async function likePost(id, token) {
  return await apiFetchTongQuat(`/api/baiviet/like/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// 4. Bình luận
export async function commentPost(id, text, token) {
  return await apiFetchTongQuat(`/api/baiviet/comment/${id}`, {
    method: "POST",
    body: { text },
    headers: { Authorization: `Bearer ${token}` },
  });
}

// 5. Duyệt bài (Dành cho Admin)
export async function approvePost(id, isActive, token) {
  return await apiFetchTongQuat(`/api/baiviet/approve/${id}`, {
    method: "PUT",
    body: { isActive }, // Gửi trạng thái muốn thay đổi lên
    headers: { Authorization: `Bearer ${token}` },
  });
}

// 6. Xóa bài
export async function deletePost(id, token) {
  return await apiFetchTongQuat(`/api/baiviet/delete/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updatePost(id, data, token) {
  return await apiFetchTongQuat(`/api/baiviet/update/${id}`, {
    method: "PUT",
    body: data, // Gồm content, image, video, audio
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}