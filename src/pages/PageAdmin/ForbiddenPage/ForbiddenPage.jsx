import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./ForbiddenPage.module.css";

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src="/icons8-forbidden-96.png"
          alt="403 Forbidden"
          className={styles.image}
        />
        <h1 className={styles.title}> Truy cập bị từ chối</h1>
        <p className={styles.subtitle}>
          Rất tiếc, bạn không có quyền để vào khu vực này.
          <br /> Vui lòng quay lại trang chủ hoặc liên hệ quản trị viên.
        </p>

        <div className={styles.actions}>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/")}
            className={styles.btnPrimary}
          >
            🏠 Về Trang Chủ
          </Button>
          <Button
            size="large"
            onClick={() => navigate(-1)}
            className={styles.btnSecondary}
          >
            ⬅️ Quay Lại
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForbiddenPage;
