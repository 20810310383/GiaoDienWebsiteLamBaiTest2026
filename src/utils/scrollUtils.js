/**
 * Cuộn mượt mà lên đầu trang
 */
export const scrollToTop = () => {
  // Kiểm tra 'window' để đảm bảo an toàn (ví dụ khi dùng SSR)
  if (typeof window !== "undefined") {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};

 export const convertToSlug = (text) => {
      if (!text || typeof text !== "string") return ""; // ✅ kiểm tra trước

    return text
      .toLowerCase()
      .normalize("NFD") // bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-") // thay khoảng trắng & ký tự đặc biệt bằng -
      .replace(/^-+|-+$/g, ""); // xóa dấu - ở đầu/cuối
  };

  export const createSlug = (str) => {
  if (!str) return "";

  return str
    .toLowerCase()
    .normalize("NFD")              // Chuyển chuỗi sang dạng tổ hợp
    .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu sau khi tổ hợp
    .replace(/[đĐ]/g, "d")         // Xử lý riêng chữ đ
    .replace(/([^0-9a-z-\s])/g, "") // Xóa ký tự đặc biệt
    .replace(/(\s+)/g, "-")         // Thay khoảng trắng bằng gạch ngang
    .replace(/-+/g, "-")            // Lọc bỏ nhiều gạch ngang liên tiếp
    .replace(/^-+|-+$/g, "");       // Cắt gạch ngang ở đầu và cuối chuỗi
};

  export const formatCurrency = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0, // 👈 Không hiện số lẻ
    maximumFractionDigits: 0,
  }).format(amount);
};

export const smoothScrollTo = (targetY, duration) => {
  const startingY = window.pageYOffset;
  const diff = targetY - startingY;
  let start;

  // Hàm Easing (Cubic Bezier - giúp cuộn mượt lúc đầu và cuối)
  const easing = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  window.requestAnimationFrame(function step(timestamp) {
    if (!start) start = timestamp;
    const time = timestamp - start;
    const percent = Math.min(time / duration, 1);
    
    window.scrollTo(0, startingY + diff * easing(percent));

    if (time < duration) {
      window.requestAnimationFrame(step);
    }
  });
};

export const getInitials = (name) => {
  if (!name) return "U"; // Viết tắt của User nếu không có tên
  const nameParts = name.trim().split(" ");
  const lastName = nameParts[nameParts.length - 1];
  return lastName.charAt(0).toUpperCase();
};