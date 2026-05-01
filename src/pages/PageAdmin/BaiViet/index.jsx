import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Upload,
  message,
  Popconfirm,
  Divider,
  Empty,
  Space,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileImageOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Editor } from "@tinymce/tinymce-react";
import styles from "./BaiViet.module.css";

// Services
import {
  getBaiViet,
  createBaiViet,
  updateBaiViet,
  deleteBaiViet,
} from "../../../services/baiVietHayService";
import { uploadAPI } from "../../../services/uploadAPI";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getTheLoai,
  createTheLoai,
} from "../../../services/theLoaiBaiVietService";
import { getPublicUrl } from "../../../utils/formatURL";

const BaiVietHay = () => {
  const [data, setData] = useState([]);
  const [theLoaiList, setTheLoaiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [form] = Form.useForm();
  const { token } = useAuth();
  const editorRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await getBaiViet();
    if (res.success) setData(res.data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await getTheLoai();
    if (res.success) setTheLoaiList(res.data);
  };

  // Xử lý upload ảnh bìa bài viết
  const handleThumbnailUpload = async (info) => {
    try {
      setUploading(true);
      const res = await uploadAPI.uploadImage(info.file);
      form.setFieldsValue({ anh: res.url || res.data?.url });
      message.success("Tải ảnh bìa thành công");
    } catch (err) {
      message.error("Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  // Thêm nhanh thể loại ngay tại Select
  const onAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const res = await createTheLoai({ ten: newCategoryName }, token);
    if (res.success) {
      message.success("Đã thêm thể loại mới");
      setTheLoaiList([...theLoaiList, res.data]);
      setNewCategoryName("");
    }
  };

  const handleSubmit = async (values) => {
    const content = editorRef.current ? editorRef.current.getContent() : "";
    const finalData = { ...values, moTaChiTiet: content };

    let res;
    if (editingId) res = await updateBaiViet(editingId, finalData, token);
    else res = await createBaiViet(finalData, token);

    if (res.success) {
      message.success(res.message);
      setIsModalOpen(false);
      fetchData();
    } else {
      message.error(res.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);

    // Set giá trị cho Form
    form.setFieldsValue({
      ...item,
      theLoaiBaiViet: item.theLoaiBaiViet?._id || item.theLoaiBaiViet,
    });

    // Quan trọng: Cập nhật link ảnh vào state preview để hiển thị lên khung Upload
    setPreviewImage(item.anh || "");

    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const res = await deleteBaiViet(id, token);
    if (res.success) {
      message.success("Đã xóa bài viết");
      fetchData();
    }
  };

  const handleEditorUpload = (blobInfo, progress) => {
    return new Promise(async (resolve, reject) => {
      try {
        const file = blobInfo.blob(); // Lấy file từ editor
        let res;

        // Kiểm tra loại file để gọi đúng API
        if (file.type.startsWith("image/")) {
          res = await uploadAPI.uploadImage(file);
        } else if (file.type.startsWith("video/")) {
          res = await uploadAPI.uploadVideo(file);
        } else if (file.type.startsWith("audio/")) {
          res = await uploadAPI.uploadAudio(file);
        } else {
          return reject("Định dạng file không hỗ trợ");
        }

        // Trả về URL cho TinyMCE
        const url = getPublicUrl(res.data?.url || res.url);
        resolve(url);
      } catch (error) {
        reject("Lỗi upload: " + error.message);
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 style={{ margin: 0 }}>Quản lý Bài Viết</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Viết bài mới
        </Button>
      </div>

      <Row gutter={[24, 32]}>
        {data.map((item) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={item._id}>
            <Card
              className={styles.postCard}
              cover={
                <div className={styles.thumbnailWrapper}>
                  <img
                    alt="thumbnail"
                    src={
                      getPublicUrl(item.anh) ||
                      "https://placehold.co/600x400?text=No+Image"
                    }
                    className={styles.thumbnail}
                  />
                </div>
              }
              actions={[
                <Space
                  onClick={() => handleEdit(item)}
                  style={{ cursor: "pointer", color: "#1890ff" }}
                >
                  <EditOutlined /> <b>Sửa</b>
                </Space>,
                <Popconfirm
                  title="Xóa bài viết này?"
                  okText="Xóa luôn"
                  cancelText="Hủy"
                  onConfirm={() => handleDelete(item._id)}
                >
                  <Space style={{ cursor: "pointer", color: "#ff4d4f" }}>
                    <DeleteOutlined /> <b>Xóa</b>
                  </Space>
                </Popconfirm>,
              ]}
            >
              <div className={styles.contentArea}>
                <Tag color="geekblue" className={styles.categoryTag}>
                  {item.theLoaiBaiViet?.ten || "TIN TỨC"}
                </Tag>

                <div className={styles.title} title={item.tieuDeLon}>
                  {item.tieuDeLon}
                </div>

                <div className={styles.subTitle}>
                  {item.tieuDeNho || "Chưa có mô tả ngắn cho bài viết này..."}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        maskClosable={false}
        title={editingId ? "Cập nhật bài viết" : "Tạo bài viết mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="tieuDeLon"
                label="Tiêu đề chính"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="Vd: Hướng dẫn cài đặt VPS cho người mới"
                  size="large"
                />
              </Form.Item>
              <Form.Item name="tieuDeNho" label="Tiêu đề phụ/Sapo">
                <Input placeholder="Vd: Những bước cơ bản nhất để tối ưu VPS..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="theLoaiBaiViet"
                label="Thể loại bài viết"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Chọn hoặc thêm thể loại"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 4px" }}>
                        <Input
                          placeholder="Tên thể loại mới"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={onAddCategory}
                        >
                          Thêm nhanh
                        </Button>
                      </Space>
                    </>
                  )}
                  options={theLoaiList.map((item) => ({
                    label: item.ten,
                    value: item._id,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="anh"
                label="Ảnh bìa bài viết"
                rules={[
                  { required: true, message: "Dũng ơi, chưa có ảnh bìa nè!" },
                ]}
              >
                <Upload
                  listType="picture-card"
                  className={styles.avatarUploader}
                  showUploadList={false}
                  customRequest={handleThumbnailUpload}
                  accept="image/*"
                >
                  {/* Dùng previewImage ở đây để nó nhạy hơn */}
                  {previewImage ? (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <img
                        src={getPublicUrl(previewImage)}
                        alt="thumbnail"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <div className={styles.uploadOverlay}>
                        <EditOutlined style={{ color: "#fff", fontSize: 20 }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Nội dung chi tiết">
                <Editor
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  initialValue={form.getFieldValue("moTaChiTiet") || ""}
                  apiKey="zjpcag3mx26mkofp78l7t8bmqyehvp1yqtapi5t9smj030pj"
                  init={{
                    height: 500,
                    menubar: true,
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
                      if (meta.filetype === "image") {
                        input.setAttribute("accept", "image/*");
                      } else if (meta.filetype === "media") {
                        // Cho phép cả video và audio khi mở công cụ media
                        input.setAttribute("accept", "video/*,audio/*");
                      }
                      input.onchange = async function () {
                        try {
                          const file = this.files[0];
                          let res;

                          // Bước 3: Phân luồng upload dựa trên định dạng file thực tế
                          if (file.type.startsWith("image/")) {
                            res = await uploadAPI.uploadImage(file);
                          } else if (file.type.startsWith("video/")) {
                            res = await uploadAPI.uploadVideo(file);
                          } else if (file.type.startsWith("audio/")) {
                            res = await uploadAPI.uploadAudio(file);
                          } else {
                            throw new Error("Định dạng file không được hỗ trợ");
                          }

                          // Bước 4: Trả URL về cho Editor
                          const finalUrl = getPublicUrl(
                            res.data?.url || res.url,
                          );
                          callback(finalUrl);
                        } catch {
                          message.error("Lỗi upload");
                        }
                      };
                      input.click();
                    },
                    placeholder: "Nhập mô tả...",
                    // skin: "oxide-dark",
                    // content_css: "dark",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" size="large">
              Lưu bài viết
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BaiVietHay;
