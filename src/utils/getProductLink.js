// import { createSlug } from "./scrollUtils";

// export const getProductLink = (product) => {
  
  
//   if (!product) return "/";
  
//   // 1. Slug danh mục kèm mã loại (Ví dụ: den-may-tre-A02BC)
//   const categorySlug = product.theLoaiCon?.tenLoai 
//     ? createSlug(product.theLoaiCon.tenLoai) 
//     : "san-pham";
//   const maLoaiSP = product.theLoaiCon?.maLoaiCon || "NONE";
//   const categoryPath = `${categorySlug}-${maLoaiSP}`;

//   // 2. Slug tên SP kèm mã SP (Ví dụ: den-tha-tran-may-tre-1B37F3)
//   const tenSPSlug = product.tieuDe ? createSlug(product.tieuDe) : "detail";
//   const productId = product.maSanPham || product._id;
//   const productPath = `${tenSPSlug}-${productId}`;

//   return `/${categoryPath}/${productPath}`;
// };

import { createSlug } from "./scrollUtils";

export const getProductLink = (product) => {
  if (!product) return "/";

  // 1. Xử lý Slug danh mục (Ưu tiên Loại Con, không có thì lấy Loại Cha)
  let categoryName = "san-pham";
  let categoryCode = "NONE";

  if (product.theLoaiCon && product.theLoaiCon.tenLoai) {
    // Nếu có Loại Con
    categoryName = product.theLoaiCon.tenLoai;
    categoryCode = product.theLoaiCon.maLoaiCon;
  } else if (product.theLoaiCha && product.theLoaiCha.tenLoai) {
    // Nếu không có Loại Con, tìm đến Loại Cha
    categoryName = product.theLoaiCha.tenLoai;
    categoryCode = product.theLoaiCha.maLoaiCha;
  }

  const categorySlug = createSlug(categoryName);
  const categoryPath = `${categorySlug}-${categoryCode}`;

  // 2. Slug tên SP kèm mã SP (Giữ nguyên logic cũ của bạn)
  const tenSPSlug = product.tieuDe ? createSlug(product.tieuDe) : "detail";
  const productId = product.maSanPham || product._id;
  const productPath = `${tenSPSlug}-${productId}`;

  return `/${categoryPath}/${productPath}`;
};