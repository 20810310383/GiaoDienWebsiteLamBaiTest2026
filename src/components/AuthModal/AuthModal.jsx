import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Tabs } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./AuthModal.module.css";
import { loginUser, registerUser } from "../../services/apiAuth";

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const { handleLogin } = useAuth(); // Hàm login từ Context để lưu token/user
  const [formLogin] = Form.useForm();
  const [formRegister] = Form.useForm();

  const onFinishLogin = async (values) => {
    setLoading(true);
    try {
      const data = {
        taiKhoan: values.taiKhoan,
        password: values.password,
      };
      const res = await handleLogin(data);
      message.success(res?.message || "Đăng nhập thành công!");
      onClose();
      formLogin.resetFields();
    } catch (err) {
      message.error(err?.message || "Đăng nhập thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const onFinishRegister = async (values) => {
    setLoading(true);
    try {
      const res = await registerUser({
        hoTen: values.hoTen,
        soDienThoai: values.soDienThoai,
        email: values.email,
        password: values.password,
      });

      message.success("Đăng ký thành công!");
      onClose();
      formRegister.resetFields();
    } catch (err) {
      message.error(err?.message || "Đăng ký thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
      className={styles.authModal}
      maskClosable={false}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        items={[
          {
            key: "login",
            label: "ĐĂNG NHẬP",
            children: (
              <Form onFinish={onFinishLogin} layout="vertical" form={formLogin}>
                <Form.Item
                  name="taiKhoan"
                  rules={[
                    {
                      required: true,
                      message: "Nhập email hoặc số điện thoại!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Email hoặc Số điện thoại"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Nhập mật khẩu!" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Mật khẩu"
                    size="large"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  className={styles.submitBtn}
                >
                  ĐĂNG NHẬP
                </Button>
              </Form>
            ),
          },
          {
            key: "register",
            label: "ĐĂNG KÝ",
            children: (
              <Form
                onFinish={onFinishRegister}
                layout="vertical"
                form={formRegister}
              >
                <Form.Item
                  name="hoTen"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
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
                  <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="soDienThoai"
                  rules={[
                    {
                      required: true,
                      pattern: /^[0-9]{10}$/,
                      message: "Số điện thoại 10 số!",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Số điện thoại"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      min: 6,
                      message: "Mật khẩu tối thiểu 6 ký tự!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Mật khẩu"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  className={styles.submitBtn}
                >
                  ĐĂNG KÝ TÀI KHOẢN
                </Button>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default AuthModal;
