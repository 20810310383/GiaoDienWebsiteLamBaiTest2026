const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function apiFetchTongQuat(endpoint, { method = "GET", body, headers = {} } = {}) {
  try {
    const isFormData = body instanceof FormData;

    const options = {
      method,
      headers: {
        // "Content-Type": "application/json",
        ...headers, // merge thêm header nếu cần (vd: Authorization)
      },
    };

    // if (body) {
    //   options.body = JSON.stringify(body);
    // }

    if (body) {
      if (isFormData) {
        // NẾU LÀ GỬI FILE: Tuyệt đối KHÔNG set Content-Type và KHÔNG JSON.stringify
        options.body = body; 
      } else {
        // NẾU LÀ JSON THƯỜNG: Set Content-Type chuẩn
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (res.status === 401) {
      // ⚠️ Token invalid → tự logout
      localStorage.removeItem("token");
      window.location.href = "/";
      return Promise.reject(new Error("Phiên đăng nhập đã hết hạn"));
    }

    if (!res.ok) {
      // Nếu backend trả lỗi (status >= 400)
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    return await res.json(); // dữ liệu JSON trả về
  } catch (error) {
    console.error("API Error:", error.message);
    throw error; // cho component gọi biết lỗi
  }
}
