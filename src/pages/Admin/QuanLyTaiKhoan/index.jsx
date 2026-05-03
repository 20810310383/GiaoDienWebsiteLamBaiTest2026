import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  message,
  Popconfirm,
  Avatar,
  Tooltip,
  Badge,
} from "antd";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Shield,
  Users,
  UserCheck,
  UserX,
  MoreVertical,
  Eye,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { getAllUsers, getUserStats, deleteUser, toggleUserStatus, changeUserRole } from "../../../services/apiQuanLyNguoiDung";
import styles from "./QuanLyTaiKhoan.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { getPublicUrl } from "../../../utils/formatURL";

const { Option } = Select;

const QuanLyTaiKhoan = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    trang_thai: "",
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        role: filters.role,
        trang_thai: filters.trang_thai,
      };

      const response = await getAllUsers(params, token);
      if (response.success) {
        setUsers(response.data.items);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (error) {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await getUserStats(token);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // User Card for mobile
  const UserCard = ({ user }) => (
    <Card className={styles.userCard} hoverable>
      <div className={styles.userCardHeader}>
        <Avatar
          src={getPublicUrl(user.anh_dai_dien)}
          size={56}
          style={{ backgroundColor: user.role === "admin" ? "#ff4d4f" : user.role === "giaovien" ? "#1890ff" : "#52c41a" }}
        >
          {user.ho_ten?.charAt(0)}
        </Avatar>
        <div className={styles.userCardInfo}>
          <span className={styles.userCardName}>{user.ho_ten}</span>
          <span className={styles.userCardCode}>@{user.ma_so}</span>
          <div className={styles.userCardBadges}>
            {getRoleBadge(user.role)}
            {getStatusBadge(user.isActive)}
          </div>
        </div>
      </div>
      <div className={styles.userCardDetails}>
        <div className={styles.userCardDetail}>
          <Mail size={14} />
          <span>{user.email}</span>
        </div>
        <div className={styles.userCardDetail}>
          <Phone size={14} />
          <span>{user.so_dien_thoai || "Chưa cập nhật"}</span>
        </div>
        <div className={styles.userCardDetail}>
          <Calendar size={14} />
          <span>{new Date(user.ngay_tao).toLocaleDateString("vi-VN")}</span>
        </div>
      </div>
      <div className={styles.userCardActions}>
        <Button
          type="text"
          size="small"
          icon={<Shield size={16} />}
          onClick={() => showPermissionModal(user)}
        >
          Phân quyền
        </Button>
        <Button
          type="text"
          size="small"
          danger={user.isActive}
          icon={user.isActive ? <Lock size={16} /> : <Unlock size={16} />}
          onClick={() => user.role !== "admin" ? handleToggleStatus(user._id) : message.error("Không thể thay đổi trạng thái tài khoản admin")}
        >
          {user.isActive ? "Khóa" : "Mở khóa"}
        </Button>
        {user.role !== "admin" && (
          <Popconfirm
            title="Xóa tài khoản?"
            onConfirm={() => handleDelete(user._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            description="Hành động này không thể hoàn tác."
          >
            <Button type="text" size="small" danger icon={<Trash2 size={16} />}>
              Xóa
            </Button>
          </Popconfirm>
        )}
      </div>
    </Card>
  );

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Handle search
  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Handle table change
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Toggle status
  const handleToggleStatus = async (id) => {
    try {
      const response = await toggleUserStatus(id, token);
      if (response.success) {
        message.success(response.message);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      message.error("Không thể thay đổi trạng thái");
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    try {
      const response = await deleteUser(id, token);
      if (response.success) {
        message.success("Xóa tài khoản thành công");
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể xóa tài khoản");
    }
  };

  // Role badge
  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: "red", label: "Admin", icon: <Shield size={12} /> },
      giaovien: { color: "blue", label: "Giáo viên", icon: <UserCheck size={12} /> },
      hocsinh: { color: "green", label: "Học sinh", icon: <Users size={12} /> },
    };
    const badge = badges[role] || badges.hocsinh;
    return (
      <Tag color={badge.color} icon={badge.icon}>
        {badge.label}
      </Tag>
    );
  };

  // Status badge
  const getStatusBadge = (isActive) => (
    <Tag color={isActive ? "success" : "default"}>
      {isActive ? "Hoạt động" : "Bị khóa"}
    </Tag>
  );

  // Table columns
  const columns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <div className={styles.userCell}>
          <Avatar
            src={getPublicUrl(record.anh_dai_dien)}
            style={{ backgroundColor: record.role === "admin" ? "#ff4d4f" : record.role === "giaovien" ? "#1890ff" : "#52c41a" }}
          >
            {record.ho_ten?.charAt(0)}
          </Avatar>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{record.ho_ten}</span>
            <span className={styles.userCode}>@{record.ma_so}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"],
    },
    {
      title: "Số điện thoại",
      dataIndex: "so_dien_thoai",
      key: "so_dien_thoai",
      responsive: ["lg"],
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => getRoleBadge(role),
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Giáo viên", value: "giaovien" },
        { text: "Học sinh", value: "hocsinh" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => getStatusBadge(isActive),
      filters: [
        { text: "Hoạt động", value: "true" },
        { text: "Bị khóa", value: "false" },
      ],
      onFilter: (value, record) => record.isActive.toString() === value,
    },
    {
      title: "Ngày tạo",
      dataIndex: "ngay_tao",
      key: "ngay_tao",
      responsive: ["lg"],
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Phân quyền">
            <Button
              type="text"
              size="small"
              icon={<Shield size={16} />}
              onClick={() => showPermissionModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Khóa" : "Mở khóa"}>
            <Button
              type="text"
              size="small"
              icon={record.isActive ? <Unlock size={16} /> : <Lock size={16} />}
              onClick={() => (record.role !== "admin") ? handleToggleStatus(record._id) : message.error("Không thể thay đổi trạng thái tài khoản admin")}
            />
          </Tooltip>
         
          <Popconfirm
            title="Xóa tài khoản?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => record.role !== "admin" ? handleDelete(record._id) : message.error("Không thể xóa tài khoản admin")}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            disabled={record.role === "admin"}
          >
            <Tooltip title="Xóa">
              <Button type="text" size="small" danger icon={<Trash2 size={16} />} disabled={record.role === "admin"} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Permission Modal
  const [permModal, setPermModal] = useState({ open: false, user: null });
  const [permForm] = Form.useForm();

  const showPermissionModal = (user) => {
    setPermModal({ open: true, user });
    permForm.setFieldsValue({
      role: user.role,
      trang_thai_hoat_dong: user.isActive,
    });
  };

  const handlePermissionUpdate = async (values) => {
    try {
      const response = await changeUserRole(permModal.user._id, values, token);
      if (response.success) {
        message.success("Cập nhật phân quyền thành công");
        setPermModal({ open: false, user: null });
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể cập nhật phân quyền");
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý tài khoản</h1>
          <p className={styles.subtitle}>Phân quyền và quản lý người dùng</p>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={12} sm={8} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers || 0}
              prefix={<Users size={20} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Admin"
              value={stats.byRole?.admin || 0}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<Shield size={20} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Giáo viên"
              value={stats.byRole?.giaovien || 0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<UserCheck size={20} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Học sinh"
              value={stats.byRole?.hocsinh || 0}
              valueStyle={{ color: "#52c41a" }}
              prefix={<Users size={20} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm theo tên, mã số, email..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) handleSearch("");
              }}
              prefix={<Search size={16} />}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Vai trò"
              allowClear
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("role", value)}
              value={filters.role || undefined}
            >
              <Option value="admin">Admin</Option>
              <Option value="giaovien">Giáo viên</Option>
              <Option value="hocsinh">Học sinh</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("trang_thai", value)}
              value={filters.trang_thai || undefined}
            >
              <Option value="true">Hoạt động</Option>
              <Option value="false">Bị khóa</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Button
              icon={<RefreshCw size={16} />}
              onClick={fetchUsers}
              loading={loading}
            >
              Làm mới
            </Button>
          </Col>
          <Col xs={24} sm={12} md={4} style={{ textAlign: "right" }}>
            <span className={styles.totalCount}>
              Tổng: {pagination.total} người dùng
            </span>
          </Col>
        </Row>
      </Card>

      {/* User List - Table on Desktop, Cards on Mobile */}
      {isMobile ? (
        <div className={styles.userCardList}>
          <Row gutter={[12, 12]}>
            {users.map((user) => (
              <Col key={user._id} xs={24}>
                <UserCard user={user} />
              </Col>
            ))}
          </Row>
          {users.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <Users size={48} />
              <p>Không tìm thấy người dùng</p>
            </div>
          )}
          <div className={styles.mobilePagination}>
            <Button
              icon={<ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />}
              disabled={pagination.current === 1}
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
            >
              Trang trước
            </Button>
            <span className={styles.pageInfo}>
              Trang {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize) || 1}
            </span>
            <Button
              icon={<ChevronRight size={16} />}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
            >
              Trang sau
            </Button>
          </div>
        </div>
      ) : (
        <Card className={styles.tableCard}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
            }}
            onChange={handleTableChange}
          />
        </Card>
      )}

      {/* Permission Modal */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <Shield size={20} />
            Phân quyền: {permModal.user?.ho_ten}
          </div>
        }
        open={permModal.open}
        onCancel={() => setPermModal({ open: false, user: null })}
        footer={null}
        width={500}
      >
        <Form
          form={permForm}
          layout="vertical"
          onFinish={handlePermissionUpdate}
          initialValues={{
            role: permModal.user?.role,
            trang_thai_hoat_dong: permModal.user?.isActive,
          }}
        >
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select>
              <Option value="admin">
                <Tag color="red" icon={<Shield size={12} />}>Admin</Tag>
              </Option>
              <Option value="giaovien">
                <Tag color="blue" icon={<UserCheck size={12} />}>Giáo viên</Tag>
              </Option>
              <Option value="hocsinh">
                <Tag color="green" icon={<Users size={12} />}>Học sinh</Tag>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="trang_thai_hoat_dong"
            label="Trạng thái tài khoản"
          >
            <Select>
              <Option value={true}>
                <Tag color="success" icon={<Unlock size={12} />}>Hoạt động</Tag>
              </Option>
              <Option value={false}>
                <Tag color="default" icon={<Lock size={12} />}>Bị khóa</Tag>
              </Option>
            </Select>
          </Form.Item>

          <div className={styles.roleDescription}>
            <h4>Mô tả vai trò:</h4>
            <ul>
              <li><Tag color="red">Admin</Tag>: Toàn quyền quản lý hệ thống</li>
              <li><Tag color="blue">Giáo viên</Tag>: Quản lý lớp học, bài giảng, xem lịch sử thi</li>
              <li><Tag color="green">Học sinh</Tag>: Xem bài giảng, làm bài thi</li>
            </ul>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setPermModal({ open: false, user: null })}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<Shield size={16} />}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyTaiKhoan;
