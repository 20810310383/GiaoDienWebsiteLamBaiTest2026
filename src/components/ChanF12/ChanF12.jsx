import { useEffect } from "react";
import { message } from "antd";

const SecurityWrapper = () => {
  useEffect(() => {
    // 1. Chặn chuột phải
    const disableContextMenu = (e) => e.preventDefault();

    // 2. Chặn các phím tắt mở DevTools và View Source
    const disableDevTools = (e) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U (View Source)
        (e.ctrlKey && e.keyCode === 83) // Ctrl+S (Save page)
      ) {
        e.preventDefault();
        message.error("Hành động này bị chặn để bảo vệ bản quyền!");
      }
    };

    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("keydown", disableDevTools);

    // Cleanup khi component bị unmount
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("keydown", disableDevTools);
    };
  }, []);

  return null; // Component này không render giao diện
};

export default SecurityWrapper;
