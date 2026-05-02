import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Card,
  Tooltip,
  message,
  Popconfirm,
  Row,
  Col,
  Upload,
  Drawer,
  Skeleton,
  Tag,
  Empty,
  Spin,
} from "antd";
import {
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Hash,
  Camera,
  ChevronRight,
  ChevronLeft,
  Search,
  BookOpen,
  Layers,
  TrendingUp,
  DollarSign,
  Eye,
  ListChecks,
  Lightbulb,
  X,
  Check,
  Clock,
  Play,
  FileText,
  Save,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Upload as UploadIcon,
  Video,
  Image,
  Star,
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import styles from "./BaiGiang.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getAllBaiGiang,
  getBaiGiangByLopHoc,
  getBaiGiangById,
  createBaiGiang,
  updateBaiGiang,
  deleteBaiGiang,
  themCauHoi,
  themNhieuCauHoi,
  updateCauHoi,
  xoaCauHoi,
} from "../../../services/apiBaiGiang";
import { uploadAPI } from "../../../services/uploadAPI";
import { getPublicUrl } from "../../../utils/formatURL";

const { TextArea } = Input;
const TINYMCE_API_KEY = "zjpcag3mx26mkofp78l7t8bmqyehvp1yqtapi5t9smj030pj";

const BaiGiang = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { classId, className } = useParams();


  // State chính
  const [baiGiangList, setBaiGiangList] = useState([]);
  const [lopHocInfo, setLopHocInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBaiGiang, setEditingBaiGiang] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [noiDungBaiHoc, setNoiDungBaiHoc] = useState(""); // Lưu HTML từ TinyMCE riêng để tránh circular reference

  // State cho question editor (Drawer)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [tempQuestions, setTempQuestions] = useState([]);
  const [tempBaiGiangId, setTempBaiGiangId] = useState(null);
  const [tempBaiGiangName, setTempBaiGiangName] = useState("");
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Editor ref
  const editorRef = useRef(null);
  const questionEditorRef = useRef(null);
  const giaiThichEditorRef = useRef(null);

  const isManagement = user?.role === "admin" || user?.role === "giaovien";
  const isHocSinh = user?.role === "hocsinh";

  // Fetch danh sách bài giảng
  const fetchBaiGiang = async () => {
    setLoading(true);
    try {
      const res = await getBaiGiangByLopHoc(classId, {}, token);
      setBaiGiangList(res.baiGiangs || []);
      setLopHocInfo(res.lopHoc || null);
    } catch (error) {
      message.error(error.message || "Không thể tải danh sách bài giảng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && classId) {
      fetchBaiGiang();
    }
  }, [token, classId]);

  // Reset noiDungBaiHoc khi mở modal tạo mới (editingBaiGiang = null)
  useEffect(() => {
    if (isModalOpen && !editingBaiGiang) {
      setNoiDungBaiHoc("");
    }
  }, [isModalOpen, editingBaiGiang]);

  // Upload ảnh đại diện
  const handleUploadImage = async ({ file }) => {
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      setImageUrl(res.url || res.data?.url);
      message.success("Tải ảnh thành công!");
    } catch {
      message.error("Lỗi tải ảnh");
    } finally {
      setUploading(false);
    }
  };

  // Submit form tạo/sửa bài giảng
  const handleSubmit = async (values) => {
    if (!imageUrl && !editingBaiGiang?.anhDaiDien) {
      message.warning("Vui lòng tải lên ảnh đại diện");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...values,
        anhDaiDien: imageUrl || editingBaiGiang?.anhDaiDien,
        id_lop_hoc: lopHocInfo._id,
        noi_dung_bai_hoc: noiDungBaiHoc, // Lấy từ state thay vì form để tránh circular reference
      };

      if (editingBaiGiang) {
        await updateBaiGiang(editingBaiGiang._id, payload, token);
        message.success("Cập nhật bài giảng thành công!");
      } else {
        await createBaiGiang(payload, token);
        message.success("Tạo bài giảng mới thành công!");
      }

      setIsModalOpen(false);
      setEditingBaiGiang(null);
      setImageUrl("");
      setNoiDungBaiHoc(""); // Reset nội dung bài học
      form.resetFields();
      fetchBaiGiang();
    } catch (error) {
      message.error(error.message || "Thao tác thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal sửa
  const handleEdit = (baiGiang) => {
    setEditingBaiGiang(baiGiang);
    setImageUrl(baiGiang.anhDaiDien || "");
    setNoiDungBaiHoc(baiGiang.noi_dung_bai_hoc || ""); // Lưu vào state riêng
    form.setFieldsValue({
      ten_bai_giang: baiGiang.ten_bai_giang,
      gioiThieu: baiGiang.gioiThieu,
      thoi_gian_lam_bai: baiGiang.thoi_gian_lam_bai,
      giaBaiGiang: baiGiang.giaBaiGiang,
    });
    setIsModalOpen(true);
  };

  // Xóa bài giảng
  const handleDelete = async (id) => {
    try {
      await deleteBaiGiang(id, token);
      setBaiGiangList((prev) => prev.filter((bg) => bg._id !== id));
      message.success("Xóa bài giảng thành công!");
    } catch (error) {
      message.error(error.message || "Xóa thất bại");
    }
  };

  // Mở drawer quản lý câu hỏi
  const openQuestionEditor = async (baiGiang) => {
    try {
      // Gọi API lấy chi tiết bài giảng để có đầy đủ danhSachCauHoi
      const res = await getBaiGiangById(baiGiang._id, token);
      const fullBaiGiang = res.baiGiang || res.data || res;

      // Clone questions và thêm showGiaiThich cho mỗi câu hỏi
      const questionsWithState = (fullBaiGiang.danhSachCauHoi || []).map((q) => ({
        ...q,
        showGiaiThich: !!q.giaiThich,
      }));

      setTempQuestions(questionsWithState);
      setTempBaiGiangId(fullBaiGiang._id);
      setTempBaiGiangName(fullBaiGiang.ten_bai_giang);
      setActiveQuestionIndex(0);
      setExpandedQuestions({ 0: true });
      setDrawerOpen(true);
    } catch (error) {
      message.error("Không thể tải câu hỏi: " + (error.message || "Lỗi không xác định"));
    }
  };

  // Thêm câu hỏi mới
  const addNewQuestion = () => {
    const newQuestion = {
      noiDungCauHoi: "",
      cacDapAn: [
        { noiDungDapAn: "", laDapAnDung: false },
        { noiDungDapAn: "", laDapAnDung: false },
      ],
      giaiThich: "",
    };
    const newIndex = tempQuestions.length;
    setTempQuestions((prev) => [...prev, newQuestion]);
    setActiveQuestionIndex(newIndex);
    setExpandedQuestions((prev) => ({ ...prev, [newIndex]: true }));
  };

  // Xóa câu hỏi
  const removeQuestion = (index) => {
    if (tempQuestions.length <= 1) {
      message.warning("Phải có ít nhất 1 câu hỏi");
      return;
    }
    setTempQuestions((prev) => prev.filter((_, i) => i !== index));
    if (activeQuestionIndex >= tempQuestions.length - 1) {
      setActiveQuestionIndex(Math.max(0, tempQuestions.length - 2));
    }
  };

  // Thêm đáp án
  const addAnswer = (questionIndex) => {
    setTempQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? { ...q, cacDapAn: [...q.cacDapAn, { noiDungDapAn: "", laDapAnDung: false }] }
          : q
      )
    );
  };

  // Xóa đáp án
  const removeAnswer = (questionIndex, answerIndex) => {
    if (tempQuestions[questionIndex].cacDapAn.length <= 2) {
      message.warning("Phải có ít nhất 2 đáp án");
      return;
    }
    setTempQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? { ...q, cacDapAn: q.cacDapAn.filter((_, ai) => ai !== answerIndex) }
          : q
      )
    );
  };

  // Toggle đáp án đúng (chỉ 1 đáp án đúng)
  const toggleCorrectAnswer = (questionIndex, answerIndex) => {
    setTempQuestions((prev) =>
      prev.map((q, qi) =>
        qi === questionIndex
          ? {
              ...q,
              cacDapAn: q.cacDapAn.map((a, ai) => ({
                ...a,
                laDapAnDung: ai === answerIndex,
              })),
            }
          : q
      )
    );
  };

  // Cập nhật nội dung câu hỏi (dùng Editor)
  const updateQuestionContent = (content) => {
    setTempQuestions((prev) =>
      prev.map((q, i) => (i === activeQuestionIndex ? { ...q, noiDungCauHoi: content } : q))
    );
  };

  // Cập nhật giải thích (dùng Editor)
  const updateGiaiThichContent = (content) => {
    setTempQuestions((prev) =>
      prev.map((q, i) => (i === activeQuestionIndex ? { ...q, giaiThich: content } : q))
    );
  };

  // Cập nhật đáp án
  const updateAnswerField = (answerIndex, value) => {
    setTempQuestions((prev) =>
      prev.map((q, i) =>
        i === activeQuestionIndex
          ? {
              ...q,
              cacDapAn: q.cacDapAn.map((a, ai) =>
                ai === answerIndex ? { ...a, noiDungDapAn: value } : a
              ),
            }
          : q
      )
    );
  };

  // Validate và lưu câu hỏi
  const handleSaveQuestions = async () => {
    const hasEmpty = tempQuestions.some((q) => {
      const content = typeof q.noiDungCauHoi === 'string' ? q.noiDungCauHoi.trim() : '';
      return (
        !content ||
        content === "<p></p>" ||
        q.cacDapAn.some((a) => typeof a.noiDungDapAn !== 'string' || !a.noiDungDapAn.trim()) ||
        !q.cacDapAn.some((a) => a.laDapAnDung)
      );
    });

    if (hasEmpty) {
      message.error("Vui lòng điền đầy đủ nội dung câu hỏi và chọn đáp án đúng!");
      return;
    }

    setSavingQuestions(true);
    try {
      // Xóa hết câu hỏi cũ
      const currentBaiGiang = baiGiangList.find((bg) => bg._id === tempBaiGiangId);
      if (currentBaiGiang?.danhSachCauHoi?.length > 0) {
        for (const cauHoi of currentBaiGiang.danhSachCauHoi) {
          await xoaCauHoi(tempBaiGiangId, cauHoi._id, token);
        }
      }

      // Thêm lại tất cả câu hỏi
      if (tempQuestions.length > 0) {
        await themNhieuCauHoi(tempBaiGiangId, { cauHois: tempQuestions }, token);
      }

      message.success("Lưu câu hỏi thành công!");
      setDrawerOpen(false);
      fetchBaiGiang();
    } catch (error) {
      message.error(error.message || "Lưu câu hỏi thất bại");
    } finally {
      setSavingQuestions(false);
    }
  };

  // Toggle expand question
  const toggleExpandQuestion = (index) => {
    setExpandedQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Upload handler cho TinyMCE
  const handleEditorUpload = async (blobInfo) => {
    return new Promise((resolve, reject) => {
      const file = blobInfo.blob();
      const fileName = blobInfo.filename();

      let uploadFunc;
      if (file.type.startsWith("image/")) {
        uploadFunc = uploadAPI.uploadImage(file);
      } else if (file.type.startsWith("video/")) {
        uploadFunc = uploadAPI.uploadVideo(file);
      } else if (file.type.startsWith("audio/")) {
        uploadFunc = uploadAPI.uploadAudio(file);
      } else {
        reject(new Error("Định dạng file không được hỗ trợ"));
        return;
      }

      uploadFunc
        .then((res) => {
          const url = res.url || res.data?.url;
          resolve(getPublicUrl(url));
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  // Lọc bài giảng
  const filteredBaiGiang = baiGiangList.filter(
    (bg) =>
      bg.ten_bai_giang?.toLowerCase().includes(searchKey.toLowerCase()) ||
      bg.maBaiGiang?.toLowerCase().includes(searchKey.toLowerCase())
  );

  // Thống kê
  const totalQuestions = baiGiangList.reduce((sum, bg) => sum + (bg.soCauHoi || 0), 0);
  const totalFree = baiGiangList.filter((bg) => bg.giaBaiGiang === 0).length;
  const totalPaid = baiGiangList.filter((bg) => bg.giaBaiGiang > 0).length;

  // Kiểm tra câu hỏi hợp lệ
  const isQuestionValid = (q) => {
    const content = typeof q.noiDungCauHoi === 'string' ? q.noiDungCauHoi.trim() : '';
    return (
      content &&
      content !== "<p></p>" &&
      q.cacDapAn.length >= 2 &&
      q.cacDapAn.some((a) => a.laDapAnDung) &&
      q.cacDapAn.every((a) => typeof a.noiDungDapAn === 'string' && a.noiDungDapAn.trim())
    );
  };

  const activeQuestion = tempQuestions[activeQuestionIndex] || null;
  const ANSWER_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div className={styles.page}>
      <div className={styles.meshBg} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <div className={styles.headerInfo}>
            <span className={styles.headerEyebrow}>
              <Layers size={12} />
              Quản lý lớp học
            </span>
            <h1 className={styles.headerTitle}>
              Bài Giảng <em>Lớp: {lopHocInfo?.ten_lop || className || "Không xác định"}</em>
            </h1>
            <p className={styles.headerSub}>
              {isHocSinh ? "Xem và học bài giảng" : "Quản lý bài giảng và câu hỏi trắc nghiệm"}
            </p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm bài giảng..."
              className={styles.searchInput}
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>
          {isManagement && (
            <div className={styles.actionBtns}>
              <button className={styles.btnSecondary} onClick={fetchBaiGiang}>
                <RefreshCw size={16} />
                Làm mới
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => {
                  setEditingBaiGiang(null);
                  setImageUrl("");
                  form.resetFields();
                  setIsModalOpen(true);
                }}
              >
                <Plus size={16} />
                Thêm Bài Giảng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ "--icon-color": "#185fa5" }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div className={styles.statNum}>{baiGiangList.length}</div>
            <div className={styles.statLabel}>Tổng Bài Giảng</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ "--icon-color": "#0891b2" }}>
            <ListChecks size={22} />
          </div>
          <div>
            <div className={styles.statNum}>{totalQuestions}</div>
            <div className={styles.statLabel}>Câu Hỏi</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ "--icon-color": "#15803d" }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className={styles.statNum}>{totalFree}</div>
            <div className={styles.statLabel}>Miễn Phí</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ "--icon-color": "#b45309" }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className={styles.statNum}>{totalPaid}</div>
            <div className={styles.statLabel}>Trả Phí</div>
          </div>
        </div>
      </div>

      {/* Section Label */}
      <div className={styles.sectionLabel}>
        <span>Danh sách bài giảng</span>
        <div className={styles.sectionLine} />
        <span className={styles.sectionCount}>{filteredBaiGiang.length} bài</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton.Image active style={{ width: "100%", height: 160 }} />
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      ) : filteredBaiGiang.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen size={48} strokeWidth={1.5} />
          <p>{isHocSinh ? "Lớp học này chưa có bài giảng nào" : "Chưa có bài giảng nào. Tạo bài giảng đầu tiên ngay!"}</p>
          {isManagement && (
            <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              Tạo Bài Giảng
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredBaiGiang.map((baiGiang, index) => (
            <div
              key={baiGiang._id}
              className={styles.baigiangCard}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Cover */}
              <div className={styles.cardCover}>
                <img
                  src={getPublicUrl(baiGiang.anhDaiDien) || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"}
                  alt={baiGiang.ten_bai_giang}
                  className={styles.coverImg}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600";
                  }}
                />
                <div className={styles.coverOverlay} />
                <div className={styles.coverTopRow}>
                  <span className={styles.maBaiGiang}>
                    <Hash size={10} style={{ marginRight: 2 }} />
                    {baiGiang.maBaiGiang}
                  </span>
                  <span className={styles.soCauHoi}>
                    <ListChecks size={12} />
                    {baiGiang.soCauHoi || 0} câu
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{baiGiang.ten_bai_giang}</h3>
                <p className={styles.cardDesc}>
                  {baiGiang.gioiThieu || "Chưa có mô tả"}
                </p>

                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <Clock size={14} />
                    {baiGiang.thoi_gian_lam_bai || 15} phút
                  </div>
                  <div className={styles.giaCoin}>
                    <DollarSign size={14} />
                    {baiGiang.giaBaiGiang === 0 ? "Miễn phí" : `${baiGiang.giaBaiGiang?.toLocaleString()}đ`}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={styles.cardFooter}>
                {isHocSinh ? (
                  <button className={styles.studyBtn} onClick={() => message.info("Tính năng đang phát triển")}>
                    <Play size={16} />
                    Vào Học
                  </button>
                ) : (
                  <>
                    <button
                      className={styles.editBtn}
                      onClick={() => openQuestionEditor(baiGiang)}
                    >
                      <ListChecks size={14} />
                      Câu Hỏi
                    </button>
                    <Tooltip title="Sửa">
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleEdit(baiGiang)}
                      >
                        <Edit3 size={15} />
                      </button>
                    </Tooltip>
                    <Popconfirm
                      title="Xóa bài giảng?"
                      description="Hành động này không thể hoàn tác."
                      onConfirm={() => handleDelete(baiGiang._id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Tooltip title="Xóa">
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`}>
                          <Trash2 size={15} />
                        </button>
                      </Tooltip>
                    </Popconfirm>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo/Sửa Bài Giảng */}
      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingBaiGiang(null);
          setImageUrl("");
          setNoiDungBaiHoc("");
          form.resetFields();
        }}
        footer={null}
        width={800}
        className="customModal"
        destroyOnClose
        title={null}
        maskClosable={false}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleIcon}>
            <BookOpen size={20} />
          </div>
          <span className={styles.modalTitle}>
            {editingBaiGiang ? "Chỉnh sửa bài giảng" : "Tạo bài giảng mới"}
          </span>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.modalForm}
          initialValues={{
            thoi_gian_lam_bai: 15,
            giaBaiGiang: 0,
          }}
        >
          {/* Upload Image */}
          <div className={styles.uploadSection}>
            <label className={styles.uploadLabel}>
              <Camera size={16} />
              Ảnh đại diện bài giảng
            </label>
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUploadImage}
              accept="image/*"
            >
              {imageUrl ? (
                <div className={styles.imagePreview}>
                  <img src={getPublicUrl(imageUrl)} alt="Preview" className={styles.previewImg} />
                  <div className={styles.imageOverlay}>
                    <Camera size={24} />
                    <span>Đổi ảnh</span>
                  </div>
                </div>
              ) : (
                <div className={styles.dropZone}>
                  <div className={styles.dropZonePlaceholder}>
                    <ImageIcon size={40} strokeWidth={1.5} />
                    <p>Kéo thả hoặc nhấn để chọn ảnh</p>
                    <span>PNG, JPG, WEBP (Tối đa 5MB)</span>
                  </div>
                </div>
              )}
            </Upload>
            {uploading && <Spin tip="Đang tải ảnh..." />}
          </div>

          <Form.Item
            name="ten_bai_giang"
            label={<span className={styles.formLabel}>Tên bài giảng</span>}
            rules={[{ required: true, message: "Vui lòng nhập tên bài giảng" }]}
          >
            <Input placeholder="VD: Bài 1 - Giới thiệu JavaScript" size="large" />
          </Form.Item>

          <Form.Item
            name="gioiThieu"
            label={<span className={styles.formLabel}>Giới thiệu ngắn</span>}
          >
            <TextArea
              rows={2}
              placeholder="Mô tả ngắn về bài giảng..."
              showCount
              maxLength={300}
            />
          </Form.Item>

          {/* Nội dung bài học - Dùng state riêng để tránh circular reference */}
          <div className={styles.editorWrapper}>
            <label className={styles.formLabel}>Nội dung bài học</label>
            <Editor
              apiKey={TINYMCE_API_KEY}
              onInit={(evt, editor) => (editorRef.current = editor)}
              value={noiDungBaiHoc}
              onEditorChange={(content) => setNoiDungBaiHoc(content)}
              init={{
                height: 300,
                menubar: true,
                plugins: [
                  "advlist", "autolink", "lists", "link", "image",
                  "charmap", "preview", "anchor", "searchreplace",
                  "visualblocks", "code", "fullscreen", "insertdatetime",
                  "media", "table", "help", "wordcount",
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
                    input.setAttribute("accept", "video/*,audio/*");
                  }
                  input.onchange = async function () {
                    try {
                      const file = this.files[0];
                      let res;
                      if (file.type.startsWith("image/")) {
                        res = await uploadAPI.uploadImage(file);
                      } else if (file.type.startsWith("video/")) {
                        res = await uploadAPI.uploadVideo(file);
                      } else if (file.type.startsWith("audio/")) {
                        res = await uploadAPI.uploadAudio(file);
                      } else {
                        throw new Error("Định dạng file không được hỗ trợ");
                      }
                      const finalUrl = getPublicUrl(res.url || res.data?.url);
                      callback(finalUrl);
                    } catch {
                      message.error("Lỗi upload");
                    }
                  };
                  input.click();
                },
                placeholder: "Nhập nội dung bài học...",
                content_style: "body { font-family: 'Segoe UI', sans-serif; font-size: 14px; }",
              }}
            />
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="thoi_gian_lam_bai"
                label={<span className={styles.formLabel}>Thời gian làm bài (phút)</span>}
                rules={[{ required: true, message: "Nhập thời gian" }]}
              >
                <InputNumber min={1} max={180} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="giaBaiGiang"
                label={<span className={styles.formLabel}>Giá bài giảng (VNĐ)</span>}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/,/g, "")}
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="0 = Miễn phí"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className={styles.modalActions}>
            <Button size="large" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={submitting}
              className={styles.submitBtn}
            >
              <Save size={16} />
              {editingBaiGiang ? "Cập nhật" : "Tạo bài giảng"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer Quản lý Câu Hỏi */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={900}
        title={
          <div className={styles.drawerHeader}>
            <div className={styles.drawerHeaderIcon}>
              <ListChecks size={20} />
            </div>
            <div className={styles.drawerHeaderText}>
              <div className={styles.drawerTitle}>Quản lý câu hỏi</div>
              <div className={styles.drawerSubtitle}>{tempBaiGiangName}</div>
            </div>
          </div>
        }
        className="customDrawer"
        footer={
          <div className={styles.drawerFooter}>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSaveQuestions}
              loading={savingQuestions}
              className={styles.saveBtn}
            >
              <Save size={16} />
              Lưu câu hỏi
            </Button>
          </div>
        }
      >
        {/* Question Navigator */}
        <div className={styles.questionNav}>
          {tempQuestions.map((q, index) => (
            <div
              key={index}
              className={`${styles.questionNavItem} ${index === activeQuestionIndex ? styles.questionNavActive : ""}`}
              onClick={() => {
                setActiveQuestionIndex(index);
                setExpandedQuestions((prev) => ({ ...prev, [index]: true }));
              }}
            >
              <span className={styles.questionNavNumber}>{index + 1}</span>
              {isQuestionValid(q) && <span className={styles.questionNavCheck}>✓</span>}
            </div>
          ))}
          <button className={styles.addQuestionBtn} onClick={addNewQuestion} title="Thêm câu hỏi">
            +
          </button>
        </div>

        {/* Question List */}
        <div className={styles.questionList}>
          {tempQuestions.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có câu hỏi nào"
            >
              <Button type="primary" onClick={addNewQuestion}>
                <Plus size={16} /> Thêm câu hỏi đầu tiên
              </Button>
            </Empty>
          ) : (
            tempQuestions.map((question, index) => (
              <div
                key={index}
                className={`${styles.questionItem} ${index === activeQuestionIndex ? styles.questionItemActive : ""}`}
                onClick={() => {
                  setActiveQuestionIndex(index);
                  setExpandedQuestions((prev) => ({ ...prev, [index]: true }));
                }}
              >
                <div className={styles.questionItemHeader}>
                  <div className={styles.questionItemLeft}>
                    <span className={styles.questionItemBadge}>{index + 1}</span>
                    <span className={styles.questionItemLabel}>Câu hỏi</span>
                    {isQuestionValid(question) && (
                      <Tag color="success" className={styles.validTag}>Hợp lệ</Tag>
                    )}
                  </div>
                  <div className={styles.questionItemActions}>
                    <Tooltip title="Xóa câu hỏi">
                      <button
                        className={styles.deleteQuestionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(index);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </Tooltip>
                    <button
                      className={styles.expandBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandQuestion(index);
                      }}
                    >
                      {expandedQuestions[index] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {expandedQuestions[index] && (
                  <div className={styles.questionItemBody}>
                    {/* Nội dung câu hỏi với TinyMCE */}
                    <div className={styles.questionEditorSection}>
                      <label className={styles.editorLabel}>
                        <FileText size={14} />
                        Nội dung câu hỏi
                      </label>
                      <Editor
                        key={`question-editor-${index}`}
                        apiKey={TINYMCE_API_KEY}
                        onInit={(evt, editor) => {
                          if (index === activeQuestionIndex) questionEditorRef.current = editor;
                        }}
                        initialValue={question.noiDungCauHoi || ""}
                        onChange={(content) => {
                          if (index === activeQuestionIndex) {
                            updateQuestionContent(content);
                          }
                        }}
                        init={{
                          height: 180,
                          menubar: false,
                          plugins: [
                            "advlist", "autolink", "lists", "link", "image",
                            "charmap", "preview", "anchor", "searchreplace",
                            "visualblocks", "code", "insertdatetime",
                            "media", "table", "wordcount",
                          ],
                          toolbar:
                            "undo redo | blocks | bold italic forecolor | alignleft aligncenter " +
                            "alignright alignjustify | bullist numlist outdent indent | " +
                            "image media | table | removeformat | code",
                          images_upload_handler: handleEditorUpload,
                          file_picker_types: "image media",
                          file_picker_callback: (callback, value, meta) => {
                            const input = document.createElement("input");
                            input.setAttribute("type", "file");
                            if (meta.filetype === "image") {
                              input.setAttribute("accept", "image/*");
                            } else if (meta.filetype === "media") {
                              input.setAttribute("accept", "video/*");
                            }
                            input.onchange = async function () {
                              try {
                                const file = this.files[0];
                                let res;
                                if (file.type.startsWith("image/")) {
                                  res = await uploadAPI.uploadImage(file);
                                  const finalUrl = getPublicUrl(res.url || res.data?.url);
                                  callback(finalUrl, { alt: file.name });
                                } else if (file.type.startsWith("video/")) {
                                  res = await uploadAPI.uploadVideo(file);
                                  const finalUrl = getPublicUrl(res.url || res.data?.url);
                                  callback(finalUrl, { alt: file.name, title: file.name });
                                } else {
                                  res = await uploadAPI.uploadAudio(file);
                                  const finalUrl = getPublicUrl(res.url || res.data?.url);
                                  callback(finalUrl, { alt: file.name });
                                }
                              } catch {
                                message.error("Lỗi upload file");
                              }
                            };
                            input.click();
                          },
                          media_alt_source: true,
                          media_poster: false,
                          content_style: "body { font-family: 'Segoe UI', sans-serif; font-size: 14px; }",
                        }}
                      />
                    </div>

                    {/* Đáp án */}
                    <div className={styles.answerSection}>
                      <div className={styles.answerSectionHeader}>
                        <span className={styles.answerHint}>
                          <Star size={12} /> Chọn đáp án đúng
                        </span>
                        <button
                          className={styles.addAnswerBtn}
                          onClick={() => addAnswer(index)}
                        >
                          <Plus size={14} />
                          Thêm đáp án
                        </button>
                      </div>

                      <div className={styles.answerList}>
                        {question.cacDapAn.map((answer, answerIndex) => (
                          <div
                            key={answerIndex}
                            className={`${styles.answerRow} ${answer.laDapAnDung ? styles.answerRowCorrect : ""}`}
                          >
                            <span className={`${styles.answerLetter} ${answer.laDapAnDung ? styles.answerLetterCorrect : ""}`}>
                              {ANSWER_LETTERS[answerIndex]}
                            </span>
                            <input
                              type="text"
                              className={styles.answerInput}
                              placeholder={`Đáp án ${ANSWER_LETTERS[answerIndex]}...`}
                              value={answer.noiDungDapAn}
                              onChange={(e) => {
                                if (index === activeQuestionIndex) {
                                  updateAnswerField(answerIndex, e.target.value);
                                }
                              }}
                              onClick={() => {
                                if (index === activeQuestionIndex) {
                                  toggleCorrectAnswer(index, answerIndex);
                                }
                              }}
                            />
                            <button
                              className={`${styles.correctToggle} ${answer.laDapAnDung ? styles.correctToggleOn : ""}`}
                              onClick={() => toggleCorrectAnswer(index, answerIndex)}
                              title="Đánh dấu đáp án đúng"
                            >
                              {answer.laDapAnDung ? <Check size={16} /> : <X size={16} />}
                            </button>
                            <button
                              className={styles.removeAnswerBtn}
                              onClick={() => removeAnswer(index, answerIndex)}
                              title="Xóa đáp án"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Giải thích với TinyMCE */}
                    <div className={styles.giaiThichSection}>
                      <button
                        className={styles.giaiThichToggle}
                        onClick={() => setTempQuestions((prev) =>
                          prev.map((q, i) =>
                            i === index ? { ...q, showGiaiThich: !q.showGiaiThich } : q
                          )
                        )}
                      >
                        <Lightbulb size={14} />
                        {question.showGiaiThich ? "Ẩn giải thích" : "Thêm giải thích đáp án"}
                      </button>

                      {question.showGiaiThich && (
                        <div className={styles.giaiThichBox}>
                          <label className={styles.editorLabel}>
                            <Lightbulb size={14} />
                            Giải thích đáp án
                          </label>
                          <Editor
                            key={`giaithich-editor-${index}`}
                            apiKey={TINYMCE_API_KEY}
                            initialValue={question.giaiThich || ""}
                            onChange={(content) => {
                              if (index === activeQuestionIndex) {
                                updateGiaiThichContent(content);
                              }
                            }}
                            init={{
                              height: 120,
                              menubar: false,
                              plugins: ["lists", "link", "wordcount", "image"],
                              toolbar: "bold italic | bullist numlist | image",
                              images_upload_handler: handleEditorUpload,
                              content_style: "body { font-family: 'Segoe UI', sans-serif; font-size: 14px; }",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default BaiGiang;
