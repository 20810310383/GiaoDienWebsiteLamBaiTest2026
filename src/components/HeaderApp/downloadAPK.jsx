import React, { useState, useEffect } from "react";
import { Modal, Progress, Button } from "antd";
import { Smartphone, ExternalLink, Download } from "lucide-react";
import styles from "./DownloadWithCountdown.module.css";

const DownloadWithCountdown = () => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const downloadLink =
    "https://play.google.com/store/apps/details?id=com.khactu02.ktquizz";

  // Hàm xử lý chuyển hướng ngay lập tức
  const handleRedirect = () => {
    window.open(downloadLink, "_blank"); // Mở tab mới để không làm mất trang web hiện tại
    setShowModal(false);
  };

  useEffect(() => {
    let timer;
    if (showModal && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0 && showModal) {
      handleRedirect();
    }
    return () => clearTimeout(timer);
  }, [countdown, showModal]);

  const handleClickDownload = (e) => {
    e.preventDefault();
    setCountdown(3);
    setShowModal(true);
  };

  return (
    <>
      <div className={styles.badgeContainer} onClick={handleRedirect}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
          alt="Tải từ Google Play"
          className={styles.playBadge}
        />
        <div className={styles.badgeOverlay} />
      </div>
    </>
  );
};

export default DownloadWithCountdown;
