import React, { useState, useEffect } from "react";
import styles from "./TaiLieuChiaSe.module.css";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  FileText,
  CloudUpload,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  Table,
  Modal,
  Button,
  Input,
  Select,
  Tag,
  Form,
  Upload,
  Space,
  Tooltip,
  message,
} from "antd";
import { documentAPI } from "../../../services/documentAPI";
import { uploadAPI } from "../../../services/uploadAPI";
import { useAuth } from "../../../contexts/AuthContext";
import {
  formatFileSize,
  getPremiumFileIcon,
} from "../../../utils/formatContent";

const { Option } = Select;

const TaiLieuChiaSe = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("documents");
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals Visibility
  const [showCatModal, setShowCatModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, docRes] = await Promise.all([
        documentAPI.getAllCategories(),
        documentAPI.getDocuments({ limit: 1000, isAdminPage: true }), // Lấy tất cả tài liệu để đếm số lượng trong mỗi thể loại
      ]);
      setCategories(catRes.data);
      setDocuments(docRes.data);
    } catch (err) {
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Upload File
  const handleFileUpload = async (info) => {
    const file = info.file;
    try {
      message.loading({ content: "Đang tải lên hồ sơ...", key: "upDoc" });
      const res = await uploadAPI.uploadDocument(file);

      // Định dạng lại dung lượng file từ bytes sang KB/MB
      const formattedSize = formatFileSize(res.data.sizeRaw || file.size);

      form.setFieldsValue({
        fileUrl: res.data.fileUrl,
        fileType: res.data.mimeType.includes("pdf") ? "PDF" : "DOCX",
        fileSize: formattedSize,
        originalName: file.name,
      });

      message.success({ content: "Tải lên thành công!", key: "upDoc" });
    } catch (err) {
      message.error({ content: "Lỗi upload tài liệu", key: "upDoc" });
    }
  };

  // Xử lý Submit Form (Thêm/Sửa)
  const onFinish = async (values) => {
    try {
      if (activeTab === "categories") {
        if (editingItem)
          await documentAPI.updateCategory(editingItem._id, values, token);
        else await documentAPI.createCategory(values, token);
        setShowCatModal(false);
      } else {
        if (editingItem)
          await documentAPI.updateDocument(editingItem._id, values, token);
        else await documentAPI.createDocument(values, token);
        setShowDocModal(false);
      }
      message.success("Thao tác thành công");
      fetchData();
    } catch (err) {
      message.error("Có lỗi xảy ra, Dũng kiểm tra lại nhé!");
    }
  };

  // Xóa mục
  const handleDelete = async (id, type) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Dũng có chắc chắn muốn xóa ${type === "cat" ? "thể loại" : "tài liệu"} này không?`,
      okText: "Xóa luôn",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          if (type === "cat") await documentAPI.deleteCategory(id, token);
          else await documentAPI.deleteDocument(id, token);
          message.success("Đã xóa xong!");
          fetchData();
        } catch (err) {
          message.error(err.response?.data?.message || "Lỗi xóa dữ liệu");
        }
      },
    });
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => <b className={styles.tableTitle}>{text}</b>,
    },
    {
      title: "Thể loại",
      dataIndex: ["category", "name"],
      key: "category",
      render: (name) => <Tag color="green">{name || "Chưa phân loại"}</Tag>,
    },
    {
      title: "Định dạng",
      dataIndex: "fileType",
      key: "fileType",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Lượt tải",
      dataIndex: "downloadCount",
      key: "downloadCount",
      sorter: (a, b) => a.downloadCount - b.downloadCount,
      render: (count) => (
        <span>
          {count}{" "}
          <Download
            size={14}
            style={{ verticalAlign: "middle", marginLeft: 4 }}
          />
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "cyan" : "default"}>
          {status === "active" ? "Công khai" : "Đang ẩn"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button
              icon={<Edit size={18} />}
              onClick={() => {
                setEditingItem(record);
                form.setFieldsValue({
                  ...record,
                  category: record.category?._id || record.category,
                });
                setShowDocModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<Trash2 size={18} />}
              onClick={() => handleDelete(record._id, "doc")}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.adminWrapper}>
      <div className={styles.adminHeader}>
        <div className={styles.headerLeft}>
          <h1>Quản lý Kho Tài Liệu</h1>
          <p className={styles.subHeader}>
            Quản lý dữ liệu file PDF, Word cho hệ thống
          </p>
        </div>
        <div className={styles.tabActions}>
          <div className={styles.tabs}>
            <button
              className={activeTab === "documents" ? styles.activeTab : ""}
              onClick={() => setActiveTab("documents")}
            >
              Tài liệu
            </button>
            <button
              className={activeTab === "categories" ? styles.activeTab : ""}
              onClick={() => setActiveTab("categories")}
            >
              Thể loại
            </button>
          </div>
          <Button
            type="primary"
            icon={<Plus size={18} />}
            className={styles.btnAdd}
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              activeTab === "documents"
                ? setShowDocModal(true)
                : setShowCatModal(true);
            }}
          >
            Thêm mới
          </Button>
        </div>
      </div>

      <div className={styles.contentCard}>
        {activeTab === "documents" ? (
          <>
            <div className={styles.tableFilter}>
              <Input
                size="large"
                prefix={<Search size={16} />}
                placeholder="Tìm kiếm tiêu đề tài liệu..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <Table
              columns={columns}
              dataSource={documents.filter((d) =>
                d.title.toLowerCase().includes(searchTerm.toLowerCase()),
              )}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 8,
                showTotal: (total) => `Tổng cộng ${total} tài liệu`,
              }}
            />
          </>
        ) : (
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <div key={cat._id} className={styles.catCard}>
                <div className={styles.catIcon}>{cat.icon}</div>
                <div className={styles.catInfo}>
                  <h3>{cat.name}</h3>
                  <p>{cat.documentCount || 0} tài liệu</p>
                </div>
                <div className={styles.catActions}>
                  <Button
                    type="text"
                    icon={<Edit size={16} />}
                    onClick={() => {
                      setEditingItem(cat);
                      form.setFieldsValue(cat);
                      setShowCatModal(true);
                    }}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDelete(cat._id, "cat")}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL THỂ LOẠI */}
      <Modal
        title={editingItem ? "Sửa Thể Loại" : "Thêm Thể Loại"}
        open={showCatModal}
        onCancel={() => setShowCatModal(false)}
        footer={null}
        className={styles.customModal}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Tên thể loại"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input placeholder="Ví dụ: Tiếng Anh, Lập trình..." />
          </Form.Item>
          <Form.Item name="icon" label="Icon (Emoji)">
            <Input placeholder="📁, 📚, 💻..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Mô tả ngắn về thể loại này" />
          </Form.Item>
          <Button
            type="primary"
            block
            htmlType="submit"
            size="large"
            className={styles.btnSubmitLarge}
          >
            Lưu lại
          </Button>
        </Form>
      </Modal>

      {/* MODAL TÀI LIỆU */}
      <Modal
        title={
          <div className={styles.modalTitleCustom}>
            {editingItem ? <Edit size={20} /> : <Plus size={20} />}
            <span>
              {editingItem
                ? "Cập nhật hồ sơ tài liệu"
                : "Đăng tải tài liệu mới"}
            </span>
          </div>
        }
        open={showDocModal}
        onCancel={() => setShowDocModal(false)}
        footer={null}
        width={750}
        centered
        className={styles.customModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.modernForm}
        >
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>1. Thông tin định danh</h4>
            <div className={styles.inputRow}>
              <Form.Item
                name="title"
                label="Tiêu đề tài liệu"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                className={styles.flex2}
              >
                <Input
                  placeholder="Ví dụ: Đề thi thử THPT Quốc gia 2026..."
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="category"
                label="Thể loại"
                rules={[{ required: true, message: "Chọn thể loại!" }]}
                className={styles.flex1}
              >
                <Select placeholder="Chọn nhóm">
                  {categories.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item name="description" label="Mô tả nội dung">
              <Input.TextArea
                rows={2}
                placeholder="Tóm tắt ngắn gọn nội dung tài liệu này..."
              />
            </Form.Item>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>2. Tệp tin hồ sơ</h4>
            <div className={styles.premiumUploadSection}>
              <Form.Item label="Đính kèm tệp tin" required shouldUpdate>
                {() => {
                  const fileUrl = form.getFieldValue("fileUrl");
                  return !fileUrl ? (
                    <Upload.Dragger
                      beforeUpload={() => false}
                      onChange={handleFileUpload}
                      maxCount={1}
                      showUploadList={false}
                      className={styles.premiumDragger}
                    >
                      <div className={styles.draggerPremiumContent}>
                        <div className={styles.textUploadGroup}>
                          <p className={styles.mainUploadText}>
                            Kéo thả hồ sơ vào đây
                          </p>
                          <p className={styles.subUploadText}>
                            hoặc{" "}
                            <span className={styles.browseText}>
                              chọn tệp từ máy tính
                            </span>
                          </p>
                        </div>
                      </div>
                    </Upload.Dragger>
                  ) : (
                    <div className={styles.fileCardPremium}>
                      <div className={styles.filePreviewIcon}>
                        {/* Kiểm tra loại file để hiển thị Icon tương ứng */}
                        {form.getFieldValue("fileType") === "PDF" ? (
                          <FileText
                            size={32}
                            strokeWidth={1.5}
                            color="#ef4444"
                          /> // Đỏ cho PDF
                        ) : (
                          <FileText
                            size={32}
                            strokeWidth={1.5}
                            color="#3b82f6"
                          /> // Xanh cho Word/Docx
                        )}
                      </div>
                      <div className={styles.fileMainInfo}>
                        <div className={styles.fileNameHeader}>
                          <span className={styles.fileTitleLabel}>
                            {form.getFieldValue("originalName") ||
                              "Tài liệu đã tải lên"}
                          </span>
                          <Tag className={styles.typeBadge}>
                            {form.getFieldValue("fileType")}
                          </Tag>
                        </div>
                        <div className={styles.fileSubInfo}>
                          <span>
                            Dung lượng:{" "}
                            <strong>{form.getFieldValue("fileSize")}</strong>
                          </span>
                          <span className={styles.divider}>|</span>
                          <span className={styles.statusSuccess}>
                            ● Đã xác thực
                          </span>
                        </div>
                      </div>
                      <Tooltip title="Hủy file để chọn lại">
                        <Button
                          type="text"
                          danger
                          icon={<X size={18} />}
                          onClick={() =>
                            form.setFieldsValue({
                              fileUrl: "",
                              fileSize: "",
                              fileType: "",
                              originalName: "",
                            })
                          }
                          className={styles.btnResetFile}
                        />
                      </Tooltip>
                    </div>
                  );
                }}
              </Form.Item>

              {/* Nhóm Hidden Inputs */}
              <div style={{ display: "none" }}>
                <Form.Item name="fileUrl" noStyle>
                  <Input />
                </Form.Item>
                <Form.Item name="fileSize" noStyle>
                  <Input />
                </Form.Item>
                <Form.Item name="fileType" noStyle>
                  <Input />
                </Form.Item>
                <Form.Item name="originalName" noStyle>
                  <Input />
                </Form.Item>
              </div>
            </div>

            <div className={styles.inputRow}>
              <Form.Item
                name="giaDownload"
                label="Giá tải (VNĐ)"
                className={styles.flex1}
              >
                <Input type="number" prefix="₫" placeholder="0 = Miễn phí" />
              </Form.Item>

              <Form.Item
                name="status"
                label="Chế độ hiển thị"
                className={styles.flex1}
                initialValue="active"
              >
                <Select>
                  <Option value="active">🟢 Đang công khai</Option>
                  <Option value="hidden">🔴 Đang tạm ẩn</Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <Button onClick={() => setShowDocModal(false)} size="large">
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles.btnSubmitLarge}
            >
              {editingItem ? "Cập nhật ngay" : "Phát hành hồ sơ"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TaiLieuChiaSe;
