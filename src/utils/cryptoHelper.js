import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;


export const decryptData = (response) => {
  try {
    // 1. Kiểm tra nếu không có trường 'data' mã hóa thì trả về gốc (tránh lỗi)
    if (!response || !response.data || typeof response.data !== "string") {
      return response;
    }

    // 2. Giải mã chuỗi AES
    const bytes = CryptoJS.AES.decrypt(response.data, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    // 3. Nếu giải mã ra chuỗi rỗng (sai key), trả về response gốc
    if (!decryptedText) return response;

    // 4. Chuyển JSON string thành Object
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error("❌", error);
    return response; 
  }
};

/**
 * Mã hóa dữ liệu (Nếu Tú cần gửi data dạng mã hóa lên Server)
 */
export const encryptData = (data) => {
  try {
    const stringData = JSON.stringify(data);
    return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
  } catch (error) {
    console.error("❌ Lỗi mã hóa:", error);
    return data;
  }
};