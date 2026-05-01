import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Tooltip,
  message,
  Image,
  Badge,
  Tabs,
  Typography,
  Avatar,
  Divider,
  Switch,
} from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import styles from "./BaiVietCongDong.module.css";
import {
  getPosts,
  approvePost,
  deletePost,
  updatePost,
} from "../../../services/baiVietService";
import { useAuth } from "../../../contexts/AuthContext";
import { getPublicUrl } from "../../../utils/formatURL";

const { Title, Text } = Typography;
const { confirm } = Modal;

const BaiVietCongDong = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("false");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosts(`?status=${statusFilter}&limit=100`); //
      if (res.success) setPosts(res.data);
    } catch (err) {
      message.error("Lỗi kết nối dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApprove = async (id, targetStatus) => {
    setLoadingId(id);
    try {
      // Gọi API approvePost với tham số targetStatus mới
      const res = await approvePost(id, targetStatus, token);

      if (res.success) {
        message.success(res.message);
        fetchData(); // Cập nhật lại bảng
      }
    } catch (err) {
      message.error("Lỗi khi thay đổi trạng thái");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Xác nhận xóa bài viết?",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: "Bài viết sẽ bị xóa vĩnh viễn khỏi hệ thống.",
      okText: "Xóa ngay",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await deletePost(id, token); //
          if (res.success) {
            message.success("Đã xóa bài viết");
            fetchData();
            setIsModalOpen(false);
          }
        } catch (err) {
          message.error("Lỗi khi xóa");
        }
      },
    });
  };

  const columns = [
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 200,
      render: (author) => (
        <Space>
          <Avatar
            src={getPublicUrl(author?.avatar)}
            className={styles.tableAvatar}
          />
          <Text className={styles.textMain}>{author?.hoTen}</Text>
        </Space>
      ),
    },
    {
      title: "Nội dung tóm tắt",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (content) => <Text className={styles.textSub}>{content}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 150,
      render: (active, record) => (
        <div className={styles.statusWrapper}>
          <Switch
            checked={active}
            loading={loadingId === record._id}
            // Khi gạt Switch, truyền trạng thái ngược lại (!active) vào API
            onChange={(checked) => handleToggleApprove(record._id, checked)}
            checkedChildren="ĐÃ DUYỆT"
            unCheckedChildren="CHỜ DUYỆT"
          />
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              className={styles.actionBtn}
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedPost(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          {/* 🟢 Nút này bây giờ sẽ luôn hiển thị để Bật hoặc Tắt nhanh */}
          <Tooltip title={record.isActive ? "Gỡ bài viết" : "Duyệt bài viết"}>
            <Button
              // Đổi class theo trạng thái để đổi màu icon
              className={record.isActive ? styles.rejectBtn : styles.approveBtn}
              icon={record.isActive ? <CloseOutlined /> : <CheckOutlined />}
              // Gọi chung hàm handleToggleApprove để xử lý logic API mới
              onClick={() => handleToggleApprove(record._id, !record.isActive)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              className={styles.deleteBtn}
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.pageBody}>
      <div className={styles.containerInner}>
        <header className={styles.pageHeader}>
          <div className={styles.headerTitle}>
            <Title level={3} className={styles.textMain}>
              Quản lý Cộng đồng
            </Title>
            <Text className={styles.textSub}>
              Kiểm duyệt và quản lý các bài đăng của sĩ tử
            </Text>
          </div>
          <Badge count={posts.length} color="var(--accent)" showZero />
        </header>

        <Tabs
          className={styles.customTabs}
          defaultActiveKey="false"
          onChange={(key) => setStatusFilter(key)}
          items={[
            { label: "BÀI ĐỢI DUYỆT", key: "false" },
            { label: "BÀI ĐÃ ĐĂNG", key: "true" },
          ]}
        />

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            dataSource={posts}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: 900 }}
          />
        </div>
      </div>

      {/* Modal chi tiết - Glassmorphism style */}
      <Modal
        title={<span className={styles.textMain}>Nội dung bài viết</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        className={styles.detailModal}
      >
        {selectedPost && (
          <div className={styles.postDetail}>
            <div className={styles.authorRow}>
              <Avatar
                size={50}
                src={getPublicUrl(selectedPost.author?.avatar)}
              />
              <div className={styles.authorInfo}>
                <Title
                  level={5}
                  className={styles.textMain}
                  style={{ margin: 0 }}
                >
                  {selectedPost.author?.hoTen}
                </Title>
                <Text className={styles.textSub}>
                  {new Date(selectedPost.createdAt).toLocaleString()}
                </Text>
              </div>
            </div>

            <Divider className={styles.divider} />

            <div className={styles.contentArea}>
              <Text className={styles.textMain} style={{ fontSize: "16px" }}>
                {selectedPost.content}
              </Text>

              <div className={styles.mediaPreview}>
                {selectedPost.image && (
                  <Image
                    src={getPublicUrl(selectedPost.image)}
                    className={styles.mediaItem}
                  />
                )}
                {selectedPost.video && (
                  <video
                    src={getPublicUrl(selectedPost.video)}
                    controls
                    className={styles.mediaItem}
                  />
                )}
                {selectedPost.audio && (
                  <audio
                    src={getPublicUrl(selectedPost.audio)}
                    controls
                    className={styles.audioItem}
                  />
                )}
              </div>
            </div>

            <Divider className={styles.divider} />

            <div className={styles.modalActions}>
              <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
              <Button danger onClick={() => handleDelete(selectedPost._id)}>
                Xóa bài
              </Button>
              {!selectedPost.isActive && (
                <Button
                  type="primary"
                  className={styles.mainApproveBtn}
                  onClick={() => {
                    handleToggleApprove(
                      selectedPost._id,
                      !selectedPost.isActive,
                    );
                    setIsModalOpen(false);
                  }}
                >
                  Phê duyệt ngay
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BaiVietCongDong;
