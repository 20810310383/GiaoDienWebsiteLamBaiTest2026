import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  message,
  Space,
  Tooltip,
  Image,
  Upload,
} from "antd";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Image as ImageIcon,
  FileText,
  UploadCloud,
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "./TheLoaiDe.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadAPI } from "../../../services/uploadAPI";
import { getPublicUrl } from "../../../utils/formatURL";
import {
  getAllTheLoai,
  createTheLoai,
  updateTheLoai,
  deleteTheLoai,
} from "../../../services/theLoaiDeThi";

const TheLoaiDe = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({ page: 1, limit: 10, search: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const { token } = useAuth();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchList();
  }, [params]);

  console.log("data: ", data);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getAllTheLoai(params);
      setData(res.theLoais);
      setTotal(res.totalItems);
    } catch (error) {
      message.error("Lỗi tải danh sách thể loại");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);

    if (item) {
      form.setFieldsValue(item);
      // Fill ảnh cũ vào fileList để Dragger hiển thị được
      if (item.anhDaiDien) {
        setFileList([
          {
            uid: "-1", // ID giả định cho file đã có trên server
            name: "Ảnh hiện tại",
            status: "done", // Trạng thái đã hoàn thành
            url: getPublicUrl(item.anhDaiDien), // URL để hiển thị preview
            thumbUrl: getPublicUrl(item.anhDaiDien),
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
    setIsModalOpen(true);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let finalData = { ...values };

      // Nếu có chọn file mới -> Upload lên server lấy URL
      if (fileList.length > 0) {
        const uploadRes = await uploadAPI.uploadImage(
          fileList[0].originFileObj,
        );
        finalData.anhDaiDien = uploadRes.url || uploadRes.data.url;
      }

      if (editingItem) {
        await updateTheLoai(editingItem._id, finalData, token);
        message.success("Cập nhật thành công ✨");
      } else {
        await createTheLoai(finalData, token);
        message.success("Tạo thể loại mới thành công ✨");
      }
      setIsModalOpen(false);
      fetchList();
    } catch (error) {
      message.error(error.message || "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa?",
      content: "Các đề thi thuộc thể loại này có thể bị ảnh hưởng.",
      okText: "Xóa",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteTheLoai(id, token);
          message.success("Đã xóa thể loại");
          fetchList();
        } catch (error) {
          message.error("Lỗi khi xóa");
        }
      },
    });
  };

  const columns = [
    {
      title: "ẢNH",
      dataIndex: "anhDaiDien",
      width: 200,
      render: (img) => (
        <Image
          src={getPublicUrl(img)}
          fallback="https://via.placeholder.com/50"
          width={50}
          height={50}
          style={{ borderRadius: "8px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "TÊN THỂ LOẠI",
      dataIndex: "tenTheLoai",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
            {text}
          </div>
          {/* <div style={{ fontSize: "12px", color: "var(--text-sub)" }}>
            #{record.maTheLoai}
          </div> */}
          <span style={{ color: "#94a3b8", fontSize: "15px" }}>
            ({record.soBoDe || 0} đề thi)
          </span>
        </div>
      ),
    },
    // {
    //   title: "MÔ TẢ",
    //   dataIndex: "moTa",
    //   ellipsis: true,
    //   responsive: ["md"],
    // },
    {
      title: "THAO TÁC",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<Edit3 size={18} color="var(--accent)" />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<Trash2 size={18} color="#ef4444" />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
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
          <h2>Thể loại đề thi</h2>
          <p>Quản lý các danh mục môn học, lĩnh vực thi</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<Plus size={18} />}
          style={{ background: "var(--accent)", border: "none" }}
          onClick={() => handleOpenModal()}
        >
          Thêm thể loại
        </Button>
      </div>

      <div className={styles.contentCard}>
        <Input
          size="large"
          placeholder="Tìm tên thể loại..."
          prefix={<Search size={18} color="var(--text-sub)" />}
          className={styles.searchBar}
          onChange={(e) =>
            setParams({ ...params, search: e.target.value, page: 1 })
          }
        />

        <Table
          className={styles.table}
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: total,
            current: params.page,
            pageSize: params.limit,
            onChange: (page) => setParams({ ...params, page }),
          }}
        />
      </div>

      <Modal
        title={editingItem ? "Cập nhật thể loại đề" : "Thêm thể loại đề mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        centered
        style={{ padding: 20 }}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20, padding: 20 }}
        >
          <Form.Item
            name="tenTheLoai"
            label="Tên danh mục"
            rules={[{ required: true }]}
          >
            <Input placeholder="Ví dụ: Lập trình ReactJS..." />
          </Form.Item>

          <Form.Item label="Ảnh đại diện">
            <Upload.Dragger
              className={styles.uploadDragger}
              maxCount={1}
              fileList={fileList} // QUAN TRỌNG: Kết nối với state fileList
              listType="picture" // Hiển thị dạng hình ảnh preview
              beforeUpload={() => false} // Chặn upload tự động của Antd
              onChange={({ fileList }) => setFileList(fileList)}
              onRemove={() => setFileList([])} // Cho phép xóa ảnh để cập nhật ảnh mới hoặc để trống
            >
              {/* Chỉ hiện Icon/Text khi chưa có ảnh nào trong list */}
              {fileList.length === 0 && (
                <>
                  <p className="ant-upload-drag-icon">
                    <UploadCloud size={32} color="var(--accent)" />
                  </p>
                  <p style={{ color: "var(--text-main)" }}>
                    Nhấp hoặc kéo tệp vào đây
                  </p>
                  <p style={{ color: "var(--text-sub)", fontSize: "12px" }}>
                    Hỗ trợ JPG, PNG chất lượng cao
                  </p>
                </>
              )}
            </Upload.Dragger>
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea
              rows={3}
              placeholder="Mô tả ngắn gọn về danh mục..."
            />
          </Form.Item>

          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <Button
              block
              size="large"
              onClick={() => setIsModalOpen(false)}
              style={{ borderRadius: "12px" }}
            >
              Hủy
            </Button>
            <Button
              block
              size="large"
              htmlType="submit"
              loading={loading}
              className={styles.btnUpdate}
            >
              {editingItem ? "Lưu thay đổi" : "Tạo danh mục"}
            </Button>
          </div>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default TheLoaiDe;
