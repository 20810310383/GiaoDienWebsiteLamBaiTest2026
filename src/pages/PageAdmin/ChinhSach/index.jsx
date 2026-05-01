import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
} from "antd";
import {
  FileProtectOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Editor } from "@tinymce/tinymce-react";
import {
  getAllPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from "../../../services/chinhSachService";
import { uploadAPI } from "../../../services/uploadAPI";
import { getPublicUrl } from "../../../utils/formatURL";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./ChinhSach.module.css";

const { Title, Text } = Typography;

const convertToSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};
const ChinhSach = () => {
  const { token } = useAuth();
  const [form] = Form.useForm();
  const editorRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllPolicies();
      setData(res);
    } catch (error) {
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record._id);

      // 1. XỬ LÝ NỐI DOMAIN cho nội dung để Editor hiển thị được ảnh/video cũ
      const contentWithDomain =
        record.moTa?.replace(
          /src="\/uploads\//g,
          `src="${backendUrl}/uploads/`,
        ) || "";

      form.setFieldsValue({
        tieuDe: record.tieuDe,
        loaiChinhSach: record.loaiChinhSach,
      });

      // 2. Ép TinyMCE cập nhật nội dung
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.setContent(contentWithDomain);
        }
      }, 100);
    } else {
      setEditingId(null);
      form.resetFields();
      if (editorRef.current) editorRef.current.setContent("");
    }
    setIsModalOpen(true);
  };

  const onFinish = async (values) => {
    const editorContent = editorRef.current
      ? editorRef.current.getContent()
      : "";

    // 3. XỬ LÝ BỎ DOMAIN trước khi lưu xuống Database
    const cleanContent = editorContent.replace(new RegExp(backendUrl, "g"), "");

    const payload = {
      ...values,
      moTa: cleanContent,
    };

    try {
      if (editingId) {
        await updatePolicy(editingId, payload, token);
        message.success("Cập nhật thành công ✨");
      } else {
        await createPolicy(payload, token);
        message.success("Thêm mới thành công 🚀");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  // --- TINYMCE UPLOAD HANDLER (Giống trang Bài viết) ---
  const handleEditorUpload = async (blobInfo) => {
    const file = blobInfo.blob();
    try {
      let res;
      if (file.type.startsWith("video/")) {
        res = await uploadAPI.uploadVideo(file);
      } else {
        res = await uploadAPI.uploadImage(file);
      }
      const path = res.data?.url || res.url;
      return getPublicUrl(path);
    } catch (error) {
      throw "Upload thất bại";
    }
  };

  const columns = [
    {
      title: "Tiêu đề chính sách",
      dataIndex: "tieuDe",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Mã loại",
      dataIndex: "loaiChinhSach",
      render: (tag) => <Tag color="green">{tag}</Tag>,
    },
    {
      title: "Thao tác",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          {/* <Popconfirm
            title="Xóa chính sách?"
            onConfirm={() => deletePolicy(record._id, token).then(fetchData)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = convertToSlug(title);
    // Cập nhật giá trị vào form cho field loaiChinhSach
    form.setFieldsValue({ loaiChinhSach: slug });
  };

  return (
    <div className={styles.container}>
      <Card className={styles.cardShadow}>
        <div className={styles.header}>
          <Title level={3}>
            <FileProtectOutlined /> Quản lý chính sách
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            className={styles.addBtn}
            disabled
          >
            Thêm chính sách
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingId ? "✏️ Chỉnh sửa chính sách" : "✍️ Thêm chính sách mới"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={1000}
        okText={editingId ? "Cập nhật" : "Lưu lại"}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className={styles.formGrid}>
            <Form.Item
              name="tieuDe"
              label="Tiêu đề chính sách"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input
                placeholder="Nhập tiêu đề..."
                onChange={handleTitleChange} // Thêm dòng này vào
              />
            </Form.Item>

            <Form.Item
              name="loaiChinhSach"
              label="Mã loại (Slug)"
              rules={[{ required: true, message: "Vui lòng nhập mã loại!" }]}
            >
              <Input placeholder="Ví dụ: bao-hanh" disabled />
            </Form.Item>
          </div>

          <Form.Item label="Nội dung chi tiết" required>
            <div className={styles.editorWrapper}>
              <Editor
                onInit={(evt, editor) => (editorRef.current = editor)}
                apiKey="zjpcag3mx26mkofp78l7t8bmqyehvp1yqtapi5t9smj030pj"
                init={{
                  height: 500,
                  menubar: true,
                  promotion: false,
                  branding: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "image media | removeformat | fullscreen code",
                  images_upload_handler: handleEditorUpload,
                  file_picker_types: "image media",
                  file_picker_callback: (callback, value, meta) => {
                    const input = document.createElement("input");
                    input.setAttribute("type", "file");
                    input.setAttribute(
                      "accept",
                      meta.filetype === "image" ? "image/*" : "video/*",
                    );
                    input.onchange = async function () {
                      const file = this.files[0];
                      try {
                        let res = file.type.startsWith("video/")
                          ? await uploadAPI.uploadVideo(file)
                          : await uploadAPI.uploadImage(file);
                        callback(getPublicUrl(res.data?.url || res.url));
                      } catch (e) {
                        message.error("Lỗi upload");
                      }
                    };
                    input.click();
                  },
                }}
              />
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChinhSach;
