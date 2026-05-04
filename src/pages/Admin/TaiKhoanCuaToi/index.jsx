import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Row,
  Col,
  message,
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
  BookOpen,
  Hash,
  BadgeCheck,
  Calendar,
  IdCard,
} from "lucide-react";
import { motion } from "framer-motion";
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
        ma_so: user.ma_so,
        ho_ten: user.ho_ten,
        so_dien_thoai: user.so_dien_thoai,
        ten_lop_sinh_hoat: user.ten_lop_sinh_hoat,
        email: user.email,
        role: {
          admin: "Quản trị viên",
          giaovien: "Giáo viên",
          hocsinh: "Học sinh",
        }[user?.role],
        gioiThieu: user.gioiThieu || "",
      });
    }
  }, [user, formInfo]);

  const handleUploadAvatar = async ({ file }) => {
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      const newAvatarUrl = res.url || res.data.url;
      await capNhatThongTin({ anh_dai_dien: newAvatarUrl }, token);
      setUser({ ...user, anh_dai_dien: newAvatarUrl });
      message.success("Cập nhật ảnh đại diện thành công");
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

  const getRoleDisplay = (role) => {
    const roles = {
      admin: "Quản trị viên",
      giaovien: "Giáo viên",
      hocsinh: "Học sinh",
    };
    return roles[role] || "Người dùng";
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <ShieldCheck size={14} />;
      case "giaovien":
        return <BadgeCheck size={14} />;
      default:
        return <User size={14} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        className={styles.headerSection}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.headerTop}>
          <div className={styles.headerIcon}>
            <User />
          </div>
          <div className={styles.headerText}>
            <h1>Hồ sơ cá nhân</h1>
            <p>Quản lý thông tin định danh và bảo mật tài khoản</p>
          </div>
        </div>

        <div className={styles.headerStats}>
          <div className={styles.statChip}>
            <div className={`${styles.icon} ${styles.blue}`}>
              <IdCard size={16} />
            </div>
            <span>
              Mã SV/GV: <strong>{user?.ma_so || "—"}</strong>
            </span>
          </div>
          <div className={styles.statChip}>
            <div className={`${styles.icon} ${styles.green}`}>
              <CheckCircle size={16} />
            </div>
            <span>
              Trạng thái: <strong className={styles.active}>Hoạt động</strong>
            </span>
          </div>
          <div className={styles.statChip}>
            <div className={`${styles.icon} ${styles.amber}`}>
              <Calendar size={16} />
            </div>
            <span>
              Ngày tham gia: <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"}</strong>
            </span>
          </div>
        </div>
      </motion.div>

      <div className={styles.mainGrid}>
        {/* Profile Card (Left) */}
        <motion.div
          className={styles.profileCard}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={styles.profileHeader}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarCircle}>
                {user?.anh_dai_dien ? (
                  <img
                    src={getPublicUrl(user.anh_dai_dien)}
                    alt="Avatar"
                  />
                ) : (
                  user?.ho_ten?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <Upload
                customRequest={handleUploadAvatar}
                showUploadList={false}
                accept="image/*"
              >
                <button className={styles.uploadBtn} disabled={uploading}>
                  {uploading ? (
                    <div className={styles.loadingSpinner} />
                  ) : (
                    <Camera size={18} />
                  )}
                </button>
              </Upload>
            </div>
          </div>

          <div className={styles.profileBody}>
            <h3 className={styles.profileName}>{user?.ho_ten || "Người dùng"}</h3>
            <div className={styles.profileRole}>
              {getRoleIcon(user?.role)}
              {getRoleDisplay(user?.role)}
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Hash /> Mã số
                </span>
                <span className={styles.infoValue}>{user?.ma_so || "—"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Mail /> Email
                </span>
                <span className={styles.infoValue}>{user?.email || "—"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <Phone /> Điện thoại
                </span>
                <span className={styles.infoValue}>{user?.so_dien_thoai || "Chưa cập nhật"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <BookOpen /> Lớp
                </span>
                <span className={styles.infoValue}>{user?.ten_lop_sinh_hoat || "Chưa cập nhật"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <CheckCircle /> Trạng thái
                </span>
                <span className={`${styles.infoValue} ${styles.active}`}>
                  <span className={styles.statusBadge}>Hoạt động</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Forms Section (Right) */}
        <div className={styles.formsSection}>
          {/* Form Thông tin */}
          <motion.div
            className={styles.formCard}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className={styles.formHeader}>
              <div className={`${styles.formIcon} ${styles.blue}`}>
                <User size={22} />
              </div>
              <div>
                <h3 className={styles.formTitle}>Thông tin định danh</h3>
                <p className={styles.formSubtitle}>Cập nhật thông tin cá nhân của bạn</p>
              </div>
            </div>

            <Form
              form={formInfo}
              layout="vertical"
              onFinish={onUpdateInfo}
              className={styles.customForm}
            >
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="ma_so"
                    label="Mã số định danh (MSSV/MGV)"
                    rules={[{ required: true, message: "Vui lòng nhập mã số!" }]}
                  >
                    <Input
                      prefix={<Hash size={18} />}
                      placeholder="Ví dụ: SV123456"
                      // readOnly={user?.role !== "admin"}
                      readOnly
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="ho_ten"
                    label="Họ và tên"
                    rules={[{ required: true, message: "Không được để trống họ tên!" }]}
                  >
                    <Input prefix={<User size={18} />} placeholder="Nhập họ và tên" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Địa chỉ Email"
                    rules={[{ type: "email", message: "Email không đúng định dạng!" }]}
                    required
                  >
                    <Input prefix={<Mail size={18} />} readOnly />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="so_dien_thoai"
                    label="Số điện thoại liên hệ"
                    rules={[
                      { required: true, message: "Nhập số điện thoại!" },
                      { pattern: /^[0-9]{10}$/, message: "Phải là 10 chữ số!" },
                    ]}
                  >
                    <Input
                      // readOnly={user?.role !== "admin"}
                      readOnly
                      prefix={<Phone size={18} />}
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item name="ten_lop_sinh_hoat" label="Lớp sinh hoạt">
                    <Input
                      prefix={<BookOpen size={18} />}
                      placeholder="Ví dụ: IT01, Marketing02"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item name="role" label="Vai trò hệ thống">
                    <Input
                      prefix={<ShieldCheck size={18} />}
                      disabled
                      value={getRoleDisplay(user?.role)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="gioiThieu" label="Giới thiệu bản thân">
                    <Input.TextArea
                      rows={3}
                      placeholder="Chia sẻ một chút về bản thân bạn..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className={styles.actionWrapper}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<CheckCircle size={18} />}
                  loading={loadingInfo}
                  className={styles.actionBtn}
                >
                  Lưu thông tin
                </Button>
              </div>
            </Form>
          </motion.div>

          {/* Form Mật khẩu */}
          <motion.div
            className={styles.formCard}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className={styles.formHeader}>
              <div className={`${styles.formIcon} ${styles.green}`}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className={styles.formTitle}>Bảo mật & Mật khẩu</h3>
                <p className={styles.formSubtitle}>Thay đổi mật khẩu để bảo vệ tài khoản</p>
              </div>
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
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
              >
                <Input.Password
                  prefix={<Lock size={18} />}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </Form.Item>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="matKhauMoi"
                    label="Thiết lập mật khẩu mới"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                      { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                    ]}
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
                      { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("matKhauMoi") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
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

              <div className={styles.actionWrapper}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Save size={18} />}
                  loading={loadingPass}
                  className={styles.actionBtn}
                >
                  Cập nhật mật khẩu
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
