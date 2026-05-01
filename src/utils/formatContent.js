import { FileText } from "lucide-react";
import React from "react";

// utils/formatContent.js
export const formatContentHTML = (htmlContent) => {
  if (!htmlContent) return "";

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // Đảm bảo không thừa dấu gạch chéo ở cuối domain
  const cleanBase = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;

  // Tìm các src="/uploads/ và thay bằng src="http://domain/uploads/
  // Regex này xử lý được cả dấu nháy đơn ' và dấu nháy kép "
  return htmlContent.replace(/src="\/uploads\//g, `src="${cleanBase}/uploads/`);
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getPremiumFileIcon = (type) => {
  const iconSize = 24;
  const strokeWidth = 1.5;
  
  let color = "var(--accent)";
  if (type?.includes("pdf")) color = "#ef4444";
  if (type?.includes("docx") || type?.includes("doc")) color = "#3b82f6";

  // Thay vì dùng <FileText />, dùng React.createElement
  return React.createElement(FileText, { 
    size: iconSize, 
    strokeWidth: strokeWidth, 
    color: color 
  });
};