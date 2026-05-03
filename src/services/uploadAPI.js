
export const uploadAPI = {
  // Upload hình ảnh
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    // const token = sessionStorage.getItem("token");

    // Lưu ý: Không set Content-Type để trình duyệt tự nhận diện multipart/form-data
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload/image`, {
      method: "POST",
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload ảnh thất bại");
    return res.json();
  },

  // Upload video
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append("video", file);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-video/video`, {
      method: "POST",
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload video thất bại");
    return res.json();
  },

   // Upload audio
  uploadAudio: async (file) => {
    const formData = new FormData();
    formData.append("audio", file);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-audio/audio`, {
      method: "POST",
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload audio thất bại");
    return res.json();
  },

  // Upload tài liệu (Word, PDF)
  uploadDocument: async (file) => {
    const formData = new FormData();
    // Lưu ý: Key phải là "document" để khớp với backend
    formData.append("document", file);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-document/document`, {
      method: "POST",
      // Quan trọng: Không set headers Content-Type để trình duyệt tự nhận diện boundary
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Upload tài liệu thất bại");
    }

    return res.json();
  },

  // Upload file Word cho import câu hỏi
  uploadWord: async (file) => {
    const formData = new FormData();
    formData.append("document", file);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-document/word`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Upload file Word thất bại");
    }

    return res.json();
  },
};