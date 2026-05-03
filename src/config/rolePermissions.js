/**
 * Cấu hình quyền truy cập cho từng route
 * Admin: Toàn quyền
 * GiaoVien: Quản lý lớp học, bài giảng, xem lịch sử thi của học sinh trong lớp
 * HocSinh: Xem bài giảng, làm bài thi, xem lịch sử thi cá nhân
 */

const ROLE_PERMISSIONS = {
  // Routes dành cho Admin
  admin: {
    // Dashboard & Home
    "/": true,
    "/tai-khoan-cua-toi": true,
    
    // Quản lý người dùng (Admin only)
    "/admin/quan-ly-tai-khoan": true,
    "/admin/phan-quyen": true,
    
    // Quản lý lớp học
    "/lop-hoc": true,
    "/lop-hoc/bai-giang/:classId/:className": true,
    
    // Quản lý bài giảng
    "/admin/tao-bai-giang": true,
    "/admin/chinh-sua-bai-giang/:id": true,
    
    // Lịch sử thi
    "/admin/lich-su-thi": true,
    "/admin/thong-ke": true,
    
    // Bộ sưu tập (xem tất cả)
    "/hoc-sinh/bo-suu-tap": true,
    
    // Làm bài thi
    "/hoc-sinh/lam-bai/:id": true,
  },

  // Routes dành cho Giáo viên
  giaovien: {
    // Dashboard & Home
    "/": true,
    "/tai-khoan-cua-toi": true,
    
    // Quản lý lớp học (chỉ lớp của mình)
    "/lop-hoc": true,
    "/lop-hoc/bai-giang/:classId/:className": true,
    
    // Tạo/chỉnh sửa bài giảng
    "/admin/tao-bai-giang": true,
    "/admin/chinh-sua-bai-giang/:id": true,
    
    // Lịch sử thi (chỉ học sinh trong lớp)
    "/admin/lich-su-thi": true,
    
    // Không có quyền quản lý tài khoản
    // "/admin/quan-ly-tai-khoan": false,
    // "/admin/phan-quyen": false,
    
    // Bộ sưu tập
    "/hoc-sinh/bo-suu-tap": true,
    
    // Làm bài thi
    "/hoc-sinh/lam-bai/:id": true,
  },

  // Routes dành cho Học sinh
  hocsinh: {
    // Dashboard & Home
    "/": true,
    "/tai-khoan-cua-toi": true,
    
    // Xem danh sách lớp (sẽ xem trong bộ sưu tập)
    "/lop-hoc": true,
    "/lop-hoc/bai-giang/:classId/:className": true,
    
    // Không tạo/chỉnh sửa bài giảng
    "/admin/tao-bai-giang": false,
    "/admin/chinh-sua-bai-giang/:id": false,
    
    // Không xem lịch sử thi chung (chỉ xem cá nhân trong trang tài khoản)
    "/admin/lich-su-thi": false,
    "/admin/thong-ke": false,
    "/admin/quan-ly-tai-khoan": false,
    "/admin/phan-quyen": false,
    
    // Bộ sưu tập
    "/hoc-sinh/bo-suu-tap": true,
    
    // Làm bài thi
    "/hoc-sinh/lam-bai/:id": true,
  }
};

/**
 * Kiểm tra xem user có quyền truy cập route không
 * @param {string} role - Vai trò của user
 * @param {string} path - Đường dẫn cần kiểm tra
 * @returns {boolean}
 */
const canAccess = (role, path) => {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  // Kiểm tra exact match
  if (permissions[path] !== undefined) {
    return permissions[path];
  }

  // Kiểm tra wildcard match (cho dynamic routes như /lop-hoc/bai-giang/:id)
  for (const [pattern, allowed] of Object.entries(permissions)) {
    if (pattern.includes(":")) {
      const regex = new RegExp(
        "^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$"
      );
      if (regex.test(path)) {
        return allowed;
      }
    }
  }

  // Mặc định không cho phép
  return false;
};

/**
 * Lấy menu items theo vai trò
 */
const getMenuByRole = (role) => {
  const menus = {
    admin: [
      { key: "home", path: "/", label: "Trang chủ", icon: "Home" },
      { key: "quan-ly-tai-khoan", path: "/admin/quan-ly-tai-khoan", label: "Quản lý tài khoản", icon: "Users" },
      { key: "lop-hoc", path: "/lop-hoc", label: "Quản lý lớp học", icon: "BookOpen" },
      { key: "lich-su-thi", path: "/admin/lich-su-thi", label: "Lịch sử thi", icon: "FileText" },
      { key: "thong-ke", path: "/admin/thong-ke", label: "Thống kê", icon: "BarChart" },
      { key: "bo-suu-tap", path: "/hoc-sinh/bo-suu-tap", label: "Bộ sưu tập", icon: "Folder" },
    ],
    giaovien: [
      { key: "home", path: "/", label: "Trang chủ", icon: "Home" },
      { key: "lop-hoc", path: "/lop-hoc", label: "Quản lý lớp học", icon: "BookOpen" },
      { key: "lich-su-thi", path: "/admin/lich-su-thi", label: "Lịch sử thi", icon: "FileText" },
      { key: "bo-suu-tap", path: "/hoc-sinh/bo-suu-tap", label: "Bộ sưu tập", icon: "Folder" },
    ],
    hocsinh: [
      { key: "home", path: "/", label: "Trang chủ", icon: "Home" },
      { key: "bo-suu-tap", path: "/hoc-sinh/bo-suu-tap", label: "Bộ sưu tập", icon: "Folder" },
    ],
  };

  return menus[role] || menus.hocsinh;
};

/**
 * Lấy danh sách quyền hạn chi tiết theo vai trò
 */
const getPermissions = (role) => {
  return ROLE_PERMISSIONS[role] || {};
};

module.exports = {
  ROLE_PERMISSIONS,
  canAccess,
  getMenuByRole,
  getPermissions
};
