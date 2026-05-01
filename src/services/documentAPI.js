import axios from 'axios';

// Cấu hình URL cơ sở (Thay đổi theo file .env của Dũng)
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/documents`;

// Helper để lấy token nếu Dũng cần dùng cho các quyền Admin
const getHeader = (token) => {
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const documentAPI = {
    // ==========================================
    // THỂ LOẠI TÀI LIỆU (CATEGORY)
    // ==========================================

    // Lấy tất cả thể loại
    getAllCategories: async () => {
        const res = await axios.get(`${BASE_URL}/categories`);
        return res.data;
    },

    // Tạo thể loại mới (Admin)
    createCategory: async (data, token) => {
        const res = await axios.post(`${BASE_URL}/categories`, data, getHeader(token));
        return res.data;
    },

    // Cập nhật thể loại (Admin)
    updateCategory: async (id, data, token) => {
        const res = await axios.put(`${BASE_URL}/categories/${id}`, data, getHeader(token   ));
        return res.data;
    },

    // Xóa thể loại (Admin)
    deleteCategory: async (id, token) => {
        const res = await axios.delete(`${BASE_URL}/categories/${id}`, getHeader(token));
        return res.data;
    },

    // ==========================================
    // TÀI LIỆU (DOCUMENT)
    // ==========================================

    // Lấy danh sách tài liệu (Hỗ trợ Search, Filter, Pagination)
    // params truyền vào có dạng: { search: '', categoryId: '', page: 1, limit: 10, sort: 'popular' }
    getDocuments: async (params) => {
        const res = await axios.get(BASE_URL, { params });
        return res.data;
    },

    // Tạo tài liệu mới
    createDocument: async (data, token) => {
        const res = await axios.post(BASE_URL, data, getHeader(token));
        return res.data;
    },

    // Cập nhật tài liệu (Admin)
    updateDocument: async (id, data, token) => {
        const res = await axios.put(`${BASE_URL}/${id}`, data, getHeader(token));
        return res.data;
    },

    // Xóa tài liệu (Admin)
    deleteDocument: async (id, token) => {
        const res = await axios.delete(`${BASE_URL}/${id}`, getHeader(token));
        return res.data;
    },

    // Route tăng lượt tải và lấy link
    downloadDocument: async (id) => {
        const res = await axios.get(`${BASE_URL}/download/${id}`);
        return res.data;
    }
};