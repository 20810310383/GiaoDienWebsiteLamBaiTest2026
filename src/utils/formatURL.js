// utils/formatURL.js
export const getPublicUrl = (fileName) => {
  if (!fileName) return "https://via.placeholder.com/150?text=No+Media";
  
  // Nếu fileName đã là một URL (http...) thì trả về luôn, 
  // nếu là tên file thì mới nối domain backend
  if (fileName.startsWith("http")) return fileName;

  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  // Đảm bảo không bị thừa dấu gạch chéo
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBase}${fileName}`;
};

export const slugify = (str) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };
