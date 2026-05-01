// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   base: '/', // Cấu hình base URL. Đổi nếu deploy vào subdirectory (ví dụ '/my-app/')
//   plugins: [react(), ],
//   server: {
//     port: 2003, 
//   },
//   build: {
//     outDir: 'dist', // Thư mục đầu ra sau khi build
//     assetsDir: 'assets', // Thư mục chứa file tĩnh trong `dist`
//     sourcemap: false, // 🟢 Tắt tạo Source Map khi build
//   },   
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', 
  plugins: [react()],
  server: {
    port: 2004, 
  },
  build: {
    outDir: 'dist', 
    assetsDir: 'assets', 
    
    // 1. Tắt hoàn toàn Source Map để F12 không thấy code gốc
    sourcemap: false, 

    // 2. Sử dụng 'terser' để làm rối tên biến (cần cài: npm add -D terser)
    minify: 'terser', 
    terserOptions: {
      compress: {
        // Tự động xóa các lệnh console.log khi build để tránh lộ data
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        // Xóa bỏ tất cả các chú thích (comments) trong code
        comments: false, 
      },
    },

    // 3. Gom nhóm các file để khó tìm cấu trúc folder
    rollupOptions: {
      output: {
        manualChunks: undefined, // Để Vite tự động gom nhóm tối ưu
      }
    }
  },   
})