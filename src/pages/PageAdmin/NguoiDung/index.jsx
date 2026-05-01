import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  message,
  Tooltip,
  Avatar,
} from "antd";
import {
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "./NguoiDung.module.css";

import { useAuth } from "../../../contexts/AuthContext";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
} from "../../../services/nguoiDungService";
import { getPublicUrl } from "../../../utils/formatURL";

const NguoiDung = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    role: "",
    isActive: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [params]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(params, token);
      setUsers(res.users);
      setTotal(res.totalUsers);
    } catch (error) {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const onFinish = async (values) => {
    try {
      if (editingUser) {
        await updateUser(editingUser._id, values, token);
        message.success("Cập nhật thành công ✨");
      } else {
        await createUser(values, token);
        message.success("Tạo người dùng mới thành công ✨");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      message.error(error.message || "Thao tác thất bại");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserActive(id, token);
      message.success("Đã thay đổi trạng thái tài khoản");
      fetchUsers();
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa vĩnh viễn?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa ngay",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteUser(id, token);
          message.success("Đã xóa người dùng");
          fetchUsers();
        } catch (error) {
          message.error("Lỗi khi xóa");
        }
      },
    });
  };

  const columns = [
    {
      title: "NGƯỜI DÙNG",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            src={getPublicUrl(record.avatar)}
            size="large"
            style={{ backgroundColor: "#10b981" }}
          >
            {/* {record.hoTen.charAt(0)} */}
            {record?.hoTen?.trim().split(/\s+/).at(-1)}
          </Avatar>
          <div>
            <div className={styles.ten}>{record.hoTen}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              #{record.maNguoiDung}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "LIÊN HỆ",
      key: "contact",
      render: (_, record) => (
        <div style={{ fontSize: "13px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              //   color: "#cbd5e1",
            }}
            className={styles.lienHe}
          >
            <Mail size={14} color="#10b981" /> {record.email}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              //   color: "#cbd5e1",
              marginTop: 4,
            }}
            className={styles.lienHe}
          >
            <Phone size={14} color="#10b981" />{" "}
            {record.soDienThoai || "Chưa cập nhật"}
          </div>
        </div>
      ),
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      render: (role) => (
        <Tag
          color={role === "admin" ? "gold" : "blue"}
          icon={<Shield size={12} />}
        >
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "isActive",
      render: (isActive) => (
        <span
          className={`${styles.statusBadge} ${isActive ? styles.active : styles.locked}`}
        >
          {isActive ? "ĐANG HOẠT ĐỘNG" : "ĐÃ KHÓA"}
        </span>
      ),
    },
    {
      title: "THAO TÁC",
      key: "actions",
      render: (_, record) => (
        <div className={styles.actionBtns}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<Edit3 size={18} color="#10b981" />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Khóa tài khoản" : "Mở khóa"}>
            <Button
              type="text"
              icon={
                record.isActive ? (
                  <Lock size={18} color="#f59e0b" />
                ) : (
                  <Unlock size={18} color="#10b981" />
                )
              }
              onClick={() => handleToggleStatus(record._id)}
            />
          </Tooltip>
          <Tooltip title="Xóa vĩnh viễn">
            <Button
              type="text"
              icon={<Trash2 size={18} color="#ef4444" />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={styles.container}
    >
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Quản lý người dùng</h2>
          <p>Quản lý danh sách nhân viên và khách hàng trên hệ thống</p>
        </div>
        <Button
          type="primary"
          icon={<UserPlus size={18} />}
          size="large"
          style={{ background: "#10b981", border: "none", borderRadius: "8px" }}
          onClick={() => handleOpenModal()}
        >
          Thêm người dùng
        </Button>
      </div>

      <div className={styles.filterCard}>
        <Input
          size="large"
          placeholder="Tìm theo tên, email, SĐT..."
          prefix={<Search size={18} color="#94a3b8" />}
          className={styles.searchBar}
          onChange={(e) =>
            setParams({ ...params, search: e.target.value, page: 1 })
          }
        />
        <Select
          size="large"
          placeholder="Vai trò"
          style={{ width: 150 }}
          onChange={(val) => setParams({ ...params, role: val, page: 1 })}
          options={[
            { value: "admin", label: "Admin" },
            { value: "user", label: "User" },
          ]}
        />
        <Select
          size="large"
          placeholder="Trạng thái"
          style={{ width: 150 }}
          onChange={(val) => setParams({ ...params, isActive: val, page: 1 })}
          options={[
            {
              value: true,
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 8px #10b981",
                      marginLeft: 10,
                    }}
                  />
                  Hoạt động
                </span>
              ),
            },
            {
              value: false,
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ef4444",
                      boxShadow: "0 0 8px #ef4444",
                      marginLeft: 10,
                    }}
                  />
                  Đã khóa
                </span>
              ),
            },
          ]}
        />
      </div>

      <div className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: total,
            current: params.page,
            pageSize: params.limit,
            onChange: (page) => setParams({ ...params, page }),
            showSizeChanger: false,
          }}
        />
      </div>

      <Modal
        title={editingUser ? "CẬP NHẬT NGƯỜI DÙNG" : "THÊM NGƯỜI DÙNG MỚI"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={500}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="hoTen"
            label="Họ và tên"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Nhập email" disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại" required>
            <Input placeholder="Nhập SĐT" disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password placeholder="Tối thiểu 6 ký tự" />
            </Form.Item>
          )}
          <Form.Item name="role" label="Vai trò" initialValue="user">
            <Select
              options={[
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ]}
            />
          </Form.Item>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <Button block onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button
              block
              type="primary"
              htmlType="submit"
              style={{ background: "#10b981" }}
            >
              {editingUser ? "Cập nhật ngay" : "Tạo tài khoản"}
            </Button>
          </div>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default NguoiDung;
