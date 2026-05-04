import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Tabs } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Mail,
  Phone,
  LogIn,
  UserPlus,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  UserSquare,
  GraduationCap,
  Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { registerUser, xacThucOTPAndRegister } from "../../services/apiAuth";
import styles from "./DangNhap.module.css";
import { useNavigate } from "react-router-dom";
import { scrollToTop } from "../../utils/scrollUtils";
import SecurityWrapper from "../../components/ChanF12/ChanF12";

const DangNhap = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [regData, setRegData] = useState(null);

  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const { handleLogin, isLoggedIn } = useAuth();
  const [formLogin] = Form.useForm();
  const [formRegister] = Form.useForm();

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    let timer;
    if (isVerifying && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifying, countdown]);

  useEffect(() => {
    let timer;
    if (isVerifying && !canResend && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [isVerifying, canResend, resendTimer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const onFinishLogin = async (values) => {
    setLoading(true);
    try {
      await handleLogin({
        taiKhoan: values.taiKhoan,
        password: values.password,
      });
      window.location.href = "/";
      scrollToTop();
      message.success("Chào mừng Sếp quay trở lại!");
    } catch (err) {
      message.error(
        err?.message || "Đăng nhập thất bại, vui lòng kiểm tra lại"
      );
    } finally {
      setLoading(false);
    }
  };

  const onPreRegister = async (values) => {
    setLoading(true);
    try {
      await registerUser({
        ho_ten: values.ho_ten,
        ma_so: values.ma_so,
        so_dien_thoai: values.so_dien_thoai,
        email: values.email,
        mat_khau: values.mat_khau,
      });
      setRegData(values);
      setIsVerifying(true);
      setCountdown(300);
      setResendTimer(60);
      setCanResend(false);
      message.success("Mã OTP đã được gửi đến email của bạn!");
    } catch (err) {
      message.error(
        err?.message || "Thông tin không hợp lệ hoặc Email đã tồn tại"
      );
    } finally {
      setLoading(false);
    }
  };

  const onFinishVerify = async (values) => {
    setLoading(true);
    try {
      const finalData = { ...regData, otp: values.otp };
      await xacThucOTPAndRegister(finalData);
      message.success("Xác thực và đăng ký thành công!");
      setIsVerifying(false);
      setActiveTab("login");
      formRegister.resetFields();
    } catch (err) {
      message.error(err?.message || "Mã OTP không chính xác hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await registerUser(regData);
      setResendTimer(60);
      setCanResend(false);
      message.success("Đã gửi lại mã OTP mới!");
    } catch (err) {
      message.error("Không thể gửi lại mã, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTab = (key) => {
    setActiveTab(key);
    scrollToTop();
  };

  const tabItems = [
    {
      key: "login",
      label: (
        <span className={styles.tabLabel}>
          <LogIn size={18} />
          Đăng Nhập
        </span>
      ),
      children: (
        <Form
          onFinish={onFinishLogin}
          layout="vertical"
          form={formLogin}
          className={styles.inputField}
        >
          <Form.Item
            name="taiKhoan"
            rules={[{ required: true, message: "Nhập tài khoản!" }]}
          >
            <Input
              prefix={<User size={18} />}
              placeholder="Email hoặc Số điện thoại hoặc Mã sinh viên"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<Lock size={18} />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className={styles.submitBtn}
            size="large"
          >
            <LogIn size={18} />
            Truy Cập Hệ Thống
          </Button>
          <div className={styles.formFooter}>
            <p>
              Chưa có tài khoản?{" "}
              <a onClick={() => handleSwitchTab("register")}>Đăng ký ngay</a>
            </p>
          </div>
        </Form>
      ),
    },
    {
      key: "register",
      label: (
        <span className={styles.tabLabel}>
          <UserPlus size={18} />
          Đăng Ký
        </span>
      ),
      children: (
        <Form
          onFinish={onPreRegister}
          layout="vertical"
          form={formRegister}
          className={styles.inputField}
        >
          <Form.Item
            name="ma_so"
            rules={[
              { required: true, message: "Vui lòng nhập mã sinh viên!" },
              {
                pattern: /^[a-zA-Z0-9]+$/,
                message:
                  "Mã sinh viên chỉ được chứa chữ và số (không có khoảng trắng)!",
              },
              { min: 4, message: "Mã sinh viên quá ngắn!" },
            ]}
          >
            <Input
              prefix={<UserSquare size={18} />}
              placeholder="Nhập mã sinh viên (ví dụ: SV2026)"
              maxLength={15}
            />
          </Form.Item>
          <Form.Item
            name="ho_ten"
            validateTrigger="onBlur"
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên!" },
              {
                whitespace: true,
                message: "Họ tên không được chỉ chứa khoảng trắng!",
              },
              {
                pattern:
                  /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểế]+(?:\s+[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểế]+)+$/,
                message:
                  "Họ và tên phải có ít nhất 2 từ, chỉ chứa chữ cái và khoảng trắng!",
              },
              { max: 50, message: "Họ tên quá dài (tối đa 50 ký tự)!" },
            ]}
          >
            <Input
              prefix={<User size={18} />}
              placeholder="Ví dụ: Nguyễn Văn A"
              style={{ textTransform: "capitalize" }}
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<Mail size={18} />} placeholder="Email nhận mã OTP" />
          </Form.Item>
          <Form.Item
            name="so_dien_thoai"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^(0[3|5|7|8|9])[0-9]{8}$/,
                message:
                  "Số điện thoại không đúng định dạng (10 số, đầu 03, 05, 07, 08, 09)!",
              },
            ]}
          >
            <Input
              prefix={<Phone size={18} />}
              placeholder="Ví dụ: 0987654321"
              maxLength={10}
            />
          </Form.Item>
          <Form.Item
            name="mat_khau"
            rules={[
              { required: true, min: 6, message: "Tối thiểu 6 ký tự!" },
            ]}
          >
            <Input.Password prefix={<Lock size={18} />} placeholder="Mật khẩu" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className={styles.submitBtn}
            size="large"
          >
            <UserPlus size={18} />
            Tiếp Tục Xác Thực
          </Button>
          <div className={styles.formFooter}>
            <p>
              Đã có tài khoản?{" "}
              <a onClick={() => handleSwitchTab("login")}>Đăng nhập ngay</a>
            </p>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <div className={styles.authContainer}>
      <SecurityWrapper />
      
      {/* Floating decorative shapes */}
      <div className={`${styles.floatingShape} ${styles.shape1}`} />
      <div className={`${styles.floatingShape} ${styles.shape2}`} />
      <div className={`${styles.floatingShape} ${styles.shape3}`} />
      <div className={`${styles.floatingShape} ${styles.shape4}`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={styles.authCard}
      >
        <AnimatePresence mode="wait">
          {!isVerifying ? (
            <motion.div
              key="auth-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header with gradient */}
              <div className={styles.authHeader}>
                <div className={styles.authHeaderContent}>
                  <div className={styles.logoWrapper}>
                    <GraduationCap size={36} className={styles.logoIcon} />
                  </div>
                  <h1>HỆ THỐNG BÀI TRẮC NGHIỆM</h1>
                  <p>
                    {activeTab === "login"
                      ? "Đăng nhập để truy cập tài khoản của bạn"
                      : "Tạo tài khoản mới để bắt đầu học tập"}
                  </p>
                </div>
              </div>

              {/* Body with tabs */}
              <div className={styles.authBody}>
                <Tabs
                  activeKey={activeTab}
                  onChange={handleSwitchTab}
                  centered
                  className={styles.customTabs}
                  items={tabItems}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp-verify"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className={styles.authHeader}>
                <div className={styles.authHeaderContent}>
                  <div className={styles.logoWrapper}>
                    <GraduationCap size={36} className={styles.logoIcon} />
                  </div>
                  <h1>XÁC THỰC TÀI KHOẢN</h1>
                  <p>Hoàn tất đăng ký bằng mã OTP</p>
                </div>
              </div>

              {/* OTP Body */}
              <div className={styles.authBody}>
                <div className={styles.otpSection}>
                  <button
                    className={styles.backBtn}
                    onClick={() => setIsVerifying(false)}
                  >
                    <ArrowLeft size={18} />
                    Quay lại
                  </button>

                  <div className={styles.otpHeader}>
                    <div className={styles.otpIconWrapper}>
                      <ShieldCheck size={48} className={styles.otpIcon} />
                    </div>
                    <h3>Xác Thực OTP</h3>
                    <p>
                      Chúng tôi đã gửi mã đến{" "}
                      <strong>{regData?.email}</strong>
                    </p>
                  </div>

                  <div className={styles.timerWrapper}>
                    <Clock size={20} className={styles.timerIcon} />
                    <div>
                      <div className={styles.timerDisplay}>
                        {formatTime(countdown)}
                      </div>
                      <div className={styles.timerLabel}>Thời gian còn lại</div>
                    </div>
                  </div>

                  <Form
                    onFinish={onFinishVerify}
                    layout="vertical"
                    className={styles.inputField}
                  >
                    <div className={styles.otpInputWrapper}>
                      <Form.Item
                        name="otp"
                        rules={[
                          { required: true, len: 6, message: "Nhập đủ 6 số!" },
                        ]}
                      >
                        <Input
                          placeholder="● ● ● ● ● ●"
                          maxLength={6}
                          className={styles.otpInput}
                        />
                      </Form.Item>
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      className={styles.submitBtn}
                      size="large"
                      disabled={countdown === 0}
                    >
                      <ShieldCheck size={18} />
                      Xác Nhận & Hoàn Tất
                    </Button>

                    <div className={styles.resendArea}>
                      {canResend ? (
                        <Button
                          type="link"
                          onClick={handleResend}
                          icon={<RefreshCw size={16} />}
                          className={styles.resendBtnActive}
                        >
                          Gửi lại mã ngay
                        </Button>
                      ) : (
                        <span>
                          Gửi lại mã sau{" "}
                          <strong style={{ color: "var(--accent-primary)" }}>
                            {resendTimer}s
                          </strong>
                        </span>
                      )}
                    </div>
                  </Form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DangNhap;
