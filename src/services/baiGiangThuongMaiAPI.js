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

  // Lấy danh sách bài đã mua
  getDanhSachDaMua: async (token) => {
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/danh-sach-da-mua`,
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
  xemDapAn: async (idBaiGiang, token) => {
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/xem-dap-an/${idBaiGiang}`,
      getAuthHeaders(token)
    );
    return res.data;
  },

  // Lịch sử thi
  getLichSuThi: async (token) => {
    const res = await axios.get(
      `${API_URL}/api/bai-giang-thuong-mai/lich-su-thi`,
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
