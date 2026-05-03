import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const baiGiangThuongMaiAPI = {
  // Mua bài giảng
  muaBaiGiang: async (idBaiGiang, token) => {
    const res = await axios.post(
      `${API_URL}/api/bai-giang-thuong-mai/mua-bai-giang`,
      { id_bai_giang: idBaiGiang },
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Lấy danh sách bài đã mua (có phân trang và tìm kiếm)
  getDanhSachDaMua: async (token, params = {}) => {
    const { page = 1, limit = 10, search = "" } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search
    });
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/danh-sach-da-mua?${queryParams}`,
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Lấy thông tin bài thi
  getBaiThi: async (idBaiGiang, token) => {
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/bai-thi/${idBaiGiang}`,
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Nộp bài thi
  nopBaiThi: async (data, token) => {
    const res = await axios.post(
      `${API_URL}/api/bai-giang-thuong-mai/nop-bai-thi`,
      data,
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Xem đáp án
  xemDapAn: async (idBaiGiang, token, lanThi = null) => {
    const params = lanThi ? `?lan_thi=${lanThi}` : '';
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/xem-dap-an/${idBaiGiang}${params}`,
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Lịch sử thi (có phân trang và tìm kiếm)
  getLichSuThi: async (token, params = {}) => {
    const { page = 1, limit = 10, search = "" } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search
    });
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/lich-su-thi?${queryParams}`,
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Thống kê theo lớp (GV)
  thongKeDiemTheoLop: async (idLopHoc, token) => {
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/thong-ke/lop/${idLopHoc}`,
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Thống kê theo học sinh (GV)
  thongKeDiemHocSinh: async (idHocSinh, token) => {
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/thong-ke/hoc-sinh/${idHocSinh}`,
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Lấy tiến độ học tập của học sinh
  getTienDoHocTap: async (token) => {
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/tien-do-hoc-tap`,
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Thống kê theo bài giảng (GV)
  thongKeDiemBaiGiang: async (idBaiGiang, token) => {
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/thong-ke/bai-giang/${idBaiGiang}`,
      getAuthHeaders(token)
    );
    return res.data;
  },
};

export default baiGiangThuongMaiAPI;
