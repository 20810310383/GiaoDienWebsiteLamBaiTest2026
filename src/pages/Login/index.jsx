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

  // Các trạng thái cho bộ đếm ngược
  const [countdown, setCountdown] = useState(300); // 5 phút xác thực
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60); // 60s để gửi lại mã

  const { handleLogin, isLoggedIn } = useAuth(); // Lấy hàm login từ Context
  const [formLogin] = Form.useForm();
  const [formRegister] = Form.useForm();

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // Xử lý đếm ngược OTP
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

  // ✅ HÀM ĐĂNG NHẬP (Fix lỗi undefined của anh ở đây)
  const onFinishLogin = async (values) => {
    setLoading(true);
    try {
      await handleLogin({
        taiKhoan: values.taiKhoan,
        password: values.password,
      });
      // navigate("/");
      window.location.href = "/"; // Reload lại trang để cập nhật trạng thái đăng nhập mới
      scrollToTop();
      message.success("Chào mừng Sếp quay trở lại!");
    } catch (err) {
      message.error(
        err?.message || "Đăng nhập thất bại, vui lòng kiểm tra lại",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ HÀM ĐĂNG KÝ BƯỚC 1 (Gửi OTP)
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
        err?.message || "Thông tin không hợp lệ hoặc Email đã tồn tại",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ HÀM XÁC THỰC OTP & ĐĂNG KÝ BƯỚC 2
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

  return (
    <div className={styles.authContainer}>
      <SecurityWrapper />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.authCard}
      >
        <AnimatePresence mode="wait">
          {!isVerifying ? (
            <motion.div
              key="auth-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div className={styles.titleArea}>
                <h2
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                  }}
                >
                  HỆ THỐNG
                </h2>
                <p>
                  {activeTab === "login"
                    ? "Vui lòng đăng nhập để tiếp tục"
                    : "Tạo tài khoản mới ngay hôm nay"}
                </p>
              </div>

              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                centered
                className={styles.customTabs}
                items={[
                  {
                    key: "login",
                    label: (
                      <span>
                        <LogIn size={18} /> ĐĂNG NHẬP
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
                          rules={[
                            { required: true, message: "Nhập tài khoản!" },
                          ]}
                        >
                          <Input
                            prefix={<User size={18} />}
                            placeholder="Email hoặc Số điện thoại hoặc Mã sinh viên"
                            size="large"
                          />
                        </Form.Item>
                        <Form.Item
                          name="password"
                          rules={[
                            { required: true, message: "Nhập mật khẩu!" },
                          ]}
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
                        >
                          TRUY CẬP HỆ THỐNG
                        </Button>
                      </Form>
                    ),
                  },
                  {
                    key: "register",
                    label: (
                      <span>
                        <UserPlus size={18} /> ĐĂNG KÝ
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
                            {
                              required: true,
                              message: "Vui lòng nhập mã sinh viên!",
                            },
                            {
                              pattern: /^[a-zA-Z0-9]+$/,
                              message:
                                "Mã sinh viên chỉ được chứa chữ và số (không có khoảng trắng)!",
                            },
                            {
                              min: 4,
                              message: "Mã sinh viên quá ngắn!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<UserSquare size={18} />}
                            placeholder="Nhập mã sinh viên (ví dụ: SV2026)"
                            maxLength={15} // Khóa không cho nhập quá dài (tùy quy định trường ông)
                            style={{ borderRadius: "var(--radius-md)" }}
                          />
                        </Form.Item>
                        <Form.Item
                          name="ho_ten"
                          validateTrigger="onBlur" // Validate khi user thoát khỏi ô input cho đỡ khó chịu
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập họ và tên!",
                            },
                            {
                              whitespace: true,
                              message:
                                "Họ tên không được chỉ chứa khoảng trắng!",
                            },
                            {
                              // Regex đã sửa lỗi range và bắt buộc có khoảng trắng ở giữa để tách ít nhất 2 từ
                              pattern:
                                /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểế]+(?:\s+[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểế]+)+$/,
                              message:
                                "Họ và tên phải có ít nhất 2 từ, chỉ chứa chữ cái và khoảng trắng!",
                            },
                            {
                              max: 50,
                              message: "Họ tên quá dài (tối đa 50 ký tự)!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<User size={18} />}
                            placeholder="Ví dụ: Nguyễn Văn A"
                            // Tự động viết hoa chữ cái đầu cho đẹp dữ liệu (Optional)
                            style={{ textTransform: "capitalize" }}
                          />
                        </Form.Item>
                        <Form.Item
                          name="email"
                          rules={[
                            {
                              required: true,
                              type: "email",
                              message: "Email không hợp lệ!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<Mail size={18} />}
                            placeholder="Email nhận mã OTP"
                          />
                        </Form.Item>
                        <Form.Item
                          name="so_dien_thoai"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số điện thoại!",
                            },
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
                            maxLength={10} // Khóa luôn không cho nhập quá 10 ký tự
                          />
                        </Form.Item>
                        <Form.Item
                          name="mat_khau"
                          rules={[
                            {
                              required: true,
                              min: 6,
                              message: "Tối thiểu 6 ký tự!",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<Lock size={18} />}
                            placeholder="Mật khẩu"
                          />
                        </Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          loading={loading}
                          className={styles.submitBtn}
                        >
                          TIẾP TỤC XÁC THỰC
                        </Button>
                      </Form>
                    ),
                  },
                ]}
              />
            </motion.div>
          ) : (
            <motion.div
              key="otp-verify"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className={styles.otpSection}
            >
              <button
                className={styles.backBtn}
                onClick={() => setIsVerifying(false)}
              >
                <ArrowLeft size={18} /> Quay lại
              </button>

              <div className={styles.otpHeader}>
                <div className={styles.shieldWrapper}>
                  <ShieldCheck size={40} className={styles.shieldIcon} />
                </div>
                <h3>Xác thực OTP</h3>
                <p>
                  Chúng tôi đã gửi mã đến <strong>{regData?.email}</strong>
                </p>
                <div className={styles.mainTimer}>{formatTime(countdown)}</div>
              </div>

              <Form
                onFinish={onFinishVerify}
                layout="vertical"
                className={styles.inputField}
              >
                <Form.Item
                  name="otp"
                  rules={[{ required: true, len: 6, message: "Nhập đủ 6 số!" }]}
                >
                  <Input
                    placeholder="Nhập OTP để xác thực"
                    maxLength={6}
                    className={styles.otpInput}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className={styles.submitBtn}
                  disabled={countdown === 0}
                >
                  XÁC NHẬN & HOÀN TẤT
                </Button>
                <div className={styles.resendArea}>
                  {canResend ? (
                    <Button
                      type="link"
                      onClick={handleResend}
                      icon={<RefreshCw size={14} />}
                      className={styles.resendBtnActive}
                    >
                      Gửi lại mã ngay
                    </Button>
                  ) : (
                    <span>
                      Gửi lại mã sau <strong>{resendTimer}s</strong>
                    </span>
                  )}
                </div>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DangNhap;
