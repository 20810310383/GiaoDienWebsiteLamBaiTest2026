import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Avatar,
  message,
  Upload,
  Divider,
  Row,
  Col,
} from "antd";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  ShieldCheck,
  CheckCircle,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./TaiKhoanCuaToi.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { capNhatThongTin, doiMatKhau } from "../../../services/apiAuth";
import { uploadAPI } from "../../../services/uploadAPI";
import { getPublicUrl } from "../../../utils/formatURL";

const TaiKhoanCuaToi = () => {
  const { user, token, setUser } = useAuth();
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formInfo] = Form.useForm();
  const [formPass] = Form.useForm();

  useEffect(() => {
    if (user) {
      formInfo.setFieldsValue({
        hoTen: user.hoTen,
        soDienThoai: user.soDienThoai,
        email: user.email,
        gioiThieu: user.gioiThieu || "",
      });
    }
  }, [user, formInfo]);

  const handleUploadAvatar = async ({ file }) => {
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      const newAvatarUrl = res.url || res.data.url;
      await capNhatThongTin({ avatar: newAvatarUrl }, token);
      setUser({ ...user, avatar: newAvatarUrl });
      message.success("Cập nhật ảnh đại diện thành công ✨");
    } catch (error) {
      message.error("Lỗi khi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const onUpdateInfo = async (values) => {
    setLoadingInfo(true);
    try {
      await capNhatThongTin(values, token);
      setUser({ ...user, ...values });
      message.success("Đã lưu thông tin cá nhân thành công");
    } catch (error) {
      message.error(error.message || "Cập nhật thất bại");
    } finally {
      setLoadingInfo(false);
    }
  };

  const onUpdatePass = async (values) => {
    setLoadingPass(true);
    try {
      await doiMatKhau(values, token);
      message.success("Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.");
      formPass.resetFields();
    } catch (error) {
      message.error(error.message || "Mật khẩu cũ không chính xác");
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerTitle}>
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          Hồ sơ cá nhân
        </motion.h2>
        <motion.p
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Quản lý thông tin định danh và bảo mật tài khoản của bạn tại hệ thống
          KTQUIZ.
        </motion.p>
      </div>

      <div className={styles.mainContent}>
        {/* CỘT TRÁI: AVATAR CARD */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${styles.glassCard} styles.avatarSection`}
        >
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <Avatar
                size={160}
                src={getPublicUrl(user?.avatar)}
                className={styles.avatarImg}
                style={{ backgroundColor: "var(--bg-main)", fontSize: "60px" }}
              >
                {user?.hoTen
                  ?.trim()
                  .split(/\s+/)
                  .at(-1)
                  .charAt(0)
                  .toUpperCase()}
              </Avatar>
              <Upload
                customRequest={handleUploadAvatar}
                showUploadList={false}
                accept="image/*"
              >
                <div className={styles.uploadCircle}>
                  {uploading ? (
                    <div className="loading-spinner-small" />
                  ) : (
                    <Camera size={20} />
                  )}
                </div>
              </Upload>
            </div>
            <h3
              style={{
                color: "var(--text-main)",
                fontSize: "20px",
                marginBottom: "4px",
              }}
            >
              {user?.hoTen}
            </h3>
            <p
              style={{
                color: "var(--accent)",
                fontWeight: "600",
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              {user?.role?.toUpperCase()}
            </p>

            <Divider
              style={{ borderColor: "var(--border)", margin: "24px 0" }}
            />

            <div
              style={{
                textAlign: "left",
                fontSize: "14px",
                color: "var(--text-sub)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span>Mã người dùng:</span>
                <b style={{ color: "var(--text-main)" }}>
                  #{user?.maNguoiDung}
                </b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Trạng thái:</span>
                <b style={{ color: "#10b981" }}>Hoạt động</b>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CỘT PHẢI: FORMS SECTION */}
        <div className={styles.formSection}>
          {/* Form Thông tin */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.glassCard}
          >
            <div className={styles.sectionHeading}>
              <User size={20} /> THÔNG TIN ĐỊNH DANH
            </div>
            <Form
              form={formInfo}
              layout="vertical"
              onFinish={onUpdateInfo}
              className={styles.customForm}
            >
              <Row gutter={20}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="hoTen"
                    label="Họ và tên khách hàng"
                    rules={[{ required: true }]}
                  >
                    <Input
                      prefix={<User size={18} />}
                      placeholder="Nhập họ và tên"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="soDienThoai" label="Số điện thoại liên hệ">
                    <Input
                      prefix={<Phone size={18} />}
                      placeholder="Nhập số điện thoại"
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="email" label="Địa chỉ Email (Định danh)">
                    <Input prefix={<Mail size={18} />} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="gioiThieu" label="Giới thiệu bản thân">
                    <Input
                      prefix={<Mail size={18} />}
                      placeholder="Nhập giới thiệu bản thân"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ textAlign: "right", marginTop: "12px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<CheckCircle size={18} />}
                  loading={loadingInfo}
                  className={styles.actionBtn}
                >
                  LƯU THÔNG TIN CÁ NHÂN
                </Button>
              </div>
            </Form>
          </motion.div>

          {/* Form Mật khẩu */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={styles.glassCard}
          >
            <div className={styles.sectionHeading}>
              <ShieldCheck size={20} /> BẢO MẬT & MẬT KHẨU
            </div>
            <Form
              form={formPass}
              layout="vertical"
              onFinish={onUpdatePass}
              className={styles.customForm}
            >
              <Form.Item
                name="matKhauCu"
                label="Xác nhận mật khẩu cũ"
                rules={[{ required: true }]}
              >
                <Input.Password
                  prefix={<Lock size={18} />}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </Form.Item>
              <Row gutter={20}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="matKhauMoi"
                    label="Thiết lập mật khẩu mới"
                    rules={[{ required: true, min: 6 }]}
                  >
                    <Input.Password
                      prefix={<Lock size={18} />}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="confirm"
                    label="Nhập lại mật khẩu mới"
                    dependencies={["matKhauMoi"]}
                    rules={[
                      { required: true },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("matKhauMoi") === value)
                            return Promise.resolve();
                          return Promise.reject(
                            new Error("Mật khẩu xác nhận không khớp!"),
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<Lock size={18} />}
                      placeholder="Xác nhận mật khẩu"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ textAlign: "right", marginTop: "12px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Save size={18} />}
                  loading={loadingPass}
                  className={styles.actionBtn}
                >
                  CẬP NHẬT MẬT KHẨU MỚI
                </Button>
              </div>
            </Form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TaiKhoanCuaToi;
