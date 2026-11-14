import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
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
  Users,
  MessageCircle,
  Phone,
  Video as VideoCall,
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
  EyeOff,
  Eye as EyeIcon,
  Upload as UploadIcon,
  Video,
  Image,
  Star,
  HelpCircle,
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import styles from "./BaiGiang.module.css";
import LessonPreviewDrawer from "./LessonPreviewDrawer";
import { useAuth } from "../../../contexts/AuthContext";
import { useChat } from "../../../components/Chat/ChatContext";
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
import baiGiangThuongMaiAPI from "../../../services/baiGiangThuongMaiAPI";

const { TextArea } = Input;
const TINYMCE_API_KEY = "zjpcag3mx26mkofp78l7t8bmqyehvp1yqtapi5t9smj030pj";

const BaiGiang = () => {
  const { token, user } = useAuth();
  const { openChat } = useChat();
  const navigate = useNavigate();
  const { classId, className } = useParams();


  // State chính
  const [baiGiangList, setBaiGiangList] = useState([]);
  const [lopHocInfo, setLopHocInfo] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
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
  const [originalQuestions, setOriginalQuestions] = useState([]); // Lưu câu hỏi gốc để xóa khi save
  const [tempBaiGiangId, setTempBaiGiangId] = useState(null);
  const [tempBaiGiangName, setTempBaiGiangName] = useState("");
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [importingWord, setImportingWord] = useState(false);
  const [importedWordCount, setImportedWordCount] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewBaiGiang, setPreviewBaiGiang] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const questionRefs = useRef({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const previewRequest = useRef(0);

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

  // Reset noiDungBaiHoc khi modal đóng hoàn toàn (dùng ref để track)
  useEffect(() => {
    if (!isModalOpen) {
      setNoiDungBaiHoc("");
    }
  }, [isModalOpen]);

  // Sync noiDungBaiHoc khi editingBaiGiang thay đổi
  useEffect(() => {
    if (editingBaiGiang) {
      const content = editingBaiGiang.noi_dung_bai_hoc || editingBaiGiang.noiDungBaiHoc || editingBaiGiang.content || "";
      setNoiDungBaiHoc(content);
    }
  }, [editingBaiGiang?._id]);

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
        giaBaiGiang: 0,
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
    setEditingBaiGiang({ ...baiGiang });
    setImageUrl(baiGiang.anhDaiDien || "");
    const content = baiGiang.noi_dung_bai_hoc || baiGiang.noiDungBaiHoc || "";
    setNoiDungBaiHoc(content);
    form.setFieldsValue({
      ten_bai_giang: baiGiang.ten_bai_giang,
      gioiThieu: baiGiang.gioiThieu,
      thoi_gian_lam_bai: baiGiang.thoi_gian_lam_bai,
      noi_dung_bai_hoc: baiGiang.noi_dung_bai_hoc,
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
      const fullBaiGiang = res.data || res;

      // Clone questions và thêm showGiaiThich cho mỗi câu hỏi
      const questionsWithState = (fullBaiGiang.danhSachCauHoi || []).map((q) => ({
        ...q,
        showGiaiThich: !!q.giaiThich,
      }));

      setTempQuestions(questionsWithState);
      setOriginalQuestions(fullBaiGiang.danhSachCauHoi || []);
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
    const nextIndex = Math.max(0, Math.min(index, tempQuestions.length - 2));
    setActiveQuestionIndex(nextIndex);
    setExpandedQuestions({ [nextIndex]: true });
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
  const updateQuestionContent = (index, content) => {
    // Đảm bảo content luôn là string
    const safeContent = typeof content === 'string' ? content : '';
    setTempQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, noiDungCauHoi: safeContent } : q))
    );
  };

  // Cập nhật Lưu ý (dùng Editor)
  const updateGiaiThichContent = (index, content) => {
    // Đảm bảo content luôn là string
    const safeContent = typeof content === 'string' ? content : '';
    setTempQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, giaiThich: safeContent } : q))
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
    const hasEmpty = tempQuestions.some((q) => !isQuestionValid(q));

    if (hasEmpty) {
      message.error("Vui lòng điền nội dung câu hỏi, tất cả đáp án và chọn đáp án đúng!");
      return;
    }

    setSavingQuestions(true);
    try {
      // Save the complete bank in one update so a failed request keeps the old bank intact.
      await updateBaiGiang(tempBaiGiangId, {
        danhSachCauHoi: tempQuestions.map(({ _id, noiDungCauHoi, cacDapAn, giaiThich }) => ({
          ...(_id ? { _id } : {}), noiDungCauHoi, cacDapAn, giaiThich,
        })),
      }, token);

      message.success("Lưu câu hỏi thành công!");
      setDrawerOpen(false);
      setOriginalQuestions([]); // Clear sau khi lưu
      fetchBaiGiang();
    } catch (error) {
      message.error(error.message || "Lưu câu hỏi thất bại");
    } finally {
      setSavingQuestions(false);
    }
  };

  // Import câu hỏi từ Word
  const handleImportWord = async (file) => {
    if (!tempBaiGiangId) {
      message.error("Vui lòng chọn bài giảng trước!");
      return;
    }

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      message.error("Chỉ chấp nhận file .docx hoặc .doc");
      return;
    }

    setImportingWord(true);
    setImportedWordCount(0);
    try {
      // Bước 1: Upload file lên server
      const uploadRes = await uploadAPI.uploadWord(file);
      
      if (!uploadRes.success) {
        throw new Error(uploadRes.message || "Upload file thất bại");
      }

      // Bước 2: Gọi API import với filename
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bai-giang/${tempBaiGiangId}/cau-hoi/import-word`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename: uploadRes.filename }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        message.success(data.message);
        setImportedWordCount(data.soCauHoiThem || 0);
        
        // Refresh câu hỏi trong drawer
        const bgRes = await getBaiGiangById(tempBaiGiangId, token);
        const fullBg = bgRes.data || bgRes;
        const questions = fullBg.danhSachCauHoi || [];
        
        // Merge vào tempQuestions
        setTempQuestions((prev) => [...prev, ...questions.slice(-(data.soCauHoiThem || 0))]);
        setOriginalQuestions(questions);
      } else {
        message.error(data.message || "Import thất bại");
      }
    } catch (error) {
      console.error("Lỗi import Word:", error);
      message.error(error.message || "Import thất bại");
    } finally {
      setImportingWord(false);
    }
  };

  // Toggle expand question
  const toggleExpandQuestion = (index) => {
    setExpandedQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Xem chi tiết câu hỏi
  const openPreviewModal = async (baiGiang) => {
    const request = ++previewRequest.current;
    setPreviewBaiGiang(baiGiang);
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewError(false);
    setPreviewQuestions([]); // Reset trước
    try {
      const res = await getBaiGiangById(baiGiang._id, token);
      
     
      
      const fullBaiGiang = res.data || res;
      if (request !== previewRequest.current) return;
      
      if (!fullBaiGiang) {
        throw new Error("Không lấy được dữ liệu bài giảng");
      }
      
      const questions = fullBaiGiang.danhSachCauHoi || [];
      
      setPreviewQuestions(questions);
      setPreviewBaiGiang(fullBaiGiang);
    } catch (error) {
      if (request !== previewRequest.current) return;
      console.error("Lỗi preview:", error);
      message.error("Không thể tải câu hỏi: " + (error.message || "Lỗi không xác định"));
      setPreviewQuestions([]);
      setPreviewError(true);
    } finally {
      if (request === previewRequest.current) setPreviewLoading(false);
    }
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
  const totalContent = baiGiangList.filter((bg) => bg.noi_dung_bai_hoc?.trim()).length;

  // Kiểm tra câu hỏi hợp lệ (chỉ check không rỗng)
  const isQuestionValid = (q) => {
    const content = q.noiDungCauHoi;
    const hasContent = typeof content === 'string' && content.replace(/<[^>]*>|&nbsp;/g, '').trim().length > 0;
    const hasAnswers = q.cacDapAn.length >= 2 && q.cacDapAn.every((a) => a.noiDungDapAn.trim()) && q.cacDapAn.some((a) => a.laDapAnDung);
    return hasContent && hasAnswers;
  };

  const activeQuestion = tempQuestions[activeQuestionIndex] || null;
  const validQuestionCount = tempQuestions.filter(isQuestionValid).length;
  const questionText = (html) => new DOMParser().parseFromString(String(html || ""), "text/html").body.textContent?.trim() || "";
  const selectQuestion = (index) => {
    setActiveQuestionIndex(index);
    setExpandedQuestions({ [index]: true });
  };
  const ANSWER_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div className={styles.page}>
      <div className={styles.meshBg} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} aria-label="Quay lại danh sách lớp học" onClick={() => navigate("/lop-hoc")}>
            <ChevronLeft size={20} />
          </button>
          <div className={styles.headerInfo}>
            <span className={styles.headerEyebrow}>
              <Layers size={12} />
              Quản lý lớp học
            </span>
            <h1 className={styles.headerTitle}>
              Bài giảng <em>của lớp</em>
            </h1>
            <p className={styles.headerSub}>
              {lopHocInfo?.ten_lop || className?.replaceAll("-", " ") || "Đang tải thông tin lớp…"}
            </p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              aria-label="Tìm kiếm bài giảng theo tên hoặc mã"
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

      {!loading && lopHocInfo && (
        <details className={styles.classMembers}>
          <summary>
            <span className={styles.membersHeadingIcon}><Users size={20} /></span>
            <span className={styles.membersHeading}><strong>Học viên trong lớp</strong><small>Kết nối với các thành viên cùng lớp</small></span>
            <span className={styles.memberCount}>{lopHocInfo.hocVien?.length || 0} học viên</span>
            <ChevronDown size={18} />
          </summary>
          <div className={styles.membersBody}>
            <Input className={styles.memberSearch} prefix={<Search size={17} />} placeholder="Tìm học viên theo tên hoặc mã số..." aria-label="Tìm học viên trong lớp" value={memberSearch} onChange={event => setMemberSearch(event.target.value)} allowClear />
            <div className={styles.membersGrid}>
              {(lopHocInfo.hocVien || []).filter(member => `${member.ho_ten || ''} ${member.ma_so || ''}`.toLocaleLowerCase('vi').includes(memberSearch.trim().toLocaleLowerCase('vi'))).map(member => (
                <div className={styles.memberItem} key={member._id}>
                  <Avatar className={styles.memberAvatar} size={48} src={member.anh_dai_dien ? getPublicUrl(member.anh_dai_dien) : undefined}>{member.ho_ten?.trim()?.charAt(0)?.toLocaleUpperCase('vi') || '?'}</Avatar>
                  <div className={styles.memberInfo}><strong>{member.ho_ten || 'Học viên'}{String(member._id) === String(user?._id || user?.id) && <small> Bạn</small>}</strong><span>{member.ma_so || 'Học viên trong lớp'}</span></div>
                  {String(member._id) !== String(user?._id || user?.id) && (
                    <div className={styles.memberActions} aria-label={`Liên hệ ${member.ho_ten || 'học viên'}`}>
                      <Tooltip title="Nhắn tin">
                        <button type="button" className={styles.memberAction} aria-label={`Nhắn tin với ${member.ho_ten || 'học viên'}`} onClick={() => openChat(lopHocInfo._id, member._id)}><MessageCircle size={16} /></button>
                      </Tooltip>
                      {[{ label: 'Gọi thoại', icon: Phone }, { label: 'Gọi video', icon: VideoCall }].map(({ label, icon: Icon }) => (
                        <Tooltip title={`${label} · Sắp ra mắt`} key={label}>
                          <button type="button" className={styles.memberAction} aria-label={`${label} với ${member.ho_ten || 'học viên'} (sắp ra mắt)`} onClick={() => message.info(`Chức năng ${label.toLocaleLowerCase('vi')} đang được phát triển`)}><Icon size={16} /></button>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!(lopHocInfo.hocVien || []).some(member => `${member.ho_ten || ''} ${member.ma_so || ''}`.toLocaleLowerCase('vi').includes(memberSearch.trim().toLocaleLowerCase('vi'))) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={memberSearch ? 'Không tìm thấy học viên phù hợp' : 'Lớp chưa có học viên'} />}
          </div>
        </details>
      )}

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
            <div className={styles.statNum}>{totalContent}</div>
            <div className={styles.statLabel}>Bài có tài liệu</div>
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
          <p>{searchKey ? "Không tìm thấy bài giảng phù hợp" : isHocSinh ? "Lớp học này chưa có bài giảng nào" : "Chưa có bài giảng nào. Tạo bài giảng đầu tiên ngay!"}</p>
          {searchKey && <button className={styles.btnSecondary} onClick={() => setSearchKey("")}>Xóa tìm kiếm</button>}
          {isManagement && !searchKey && (
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
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600";
                  }}
                />
                <div className={styles.coverOverlay} />
                <span className={styles.lessonNumber}>BÀI {String(index + 1).padStart(2, "0")}</span>
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
                <h3 className={styles.cardTitle}>
                  <button onClick={() => openPreviewModal(baiGiang)}>{baiGiang.ten_bai_giang}</button>
                </h3>
                <p className={styles.cardDesc}>
                  {baiGiang.gioiThieu || "Chưa có mô tả"}
                </p>

                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <Clock size={14} />
                    {baiGiang.thoi_gian_lam_bai || 15} phút
                  </div>
                  <span className={styles.lessonType}><FileText size={14} />Tài liệu học tập</span>
                </div>
              </div>

              {/* Footer */}
              <div className={styles.cardFooter}>
                {isHocSinh ? (
                  <button
                    className={styles.studyBtn}
                    onClick={async () => {
                      if (baiGiang.daSoHuu) {
                        navigate(`/hoc-sinh/lam-bai/${baiGiang._id}`);
                        return;
                      }
                      if (baiGiang.giaBaiGiang > 0) {
                        message.info("Bài giảng này chưa được mở để thêm vào bộ sưu tập.");
                        return;
                      }
                      try {
                        await baiGiangThuongMaiAPI.muaBaiGiang(baiGiang._id, token);
                        setBaiGiangList(previous => previous.map(item => item._id === baiGiang._id ? { ...item, daSoHuu: true } : item));
                        message.success("Đã thêm vào bộ sưu tập!");
                      } catch (error) {
                        message.error(error.response?.data?.message || "Không thể thêm bài giảng vào bộ sưu tập");
                      }
                    }}
                  >
                    {baiGiang.daSoHuu ? <Play size={16} /> : <Plus size={16} />}
                    {baiGiang.daSoHuu ? 'Vào làm bài' : 'Thêm vào Bộ Sưu Tập'}
                  </button>
                ) : (
                  <>
                    <Tooltip title="Đọc bài giảng">
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnPrimary}`}
                        aria-label="Đọc bài giảng"
                        onClick={() => openPreviewModal(baiGiang)}
                      >
                        <EyeIcon size={15} />
                      </button>
                    </Tooltip>
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
              key={`baigiang-editor-${editingBaiGiang?._id || 'new'}`}
              apiKey={TINYMCE_API_KEY}
              onInit={(evt, editor) => {
                editorRef.current = editor;
                // Delay nhẹ để đảm bảo editor ready
                setTimeout(() => {
                  editor.setContent(noiDungBaiHoc || "");
                }, 50);
              }}
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
                content_style: "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap'); body { font-family: 'Nunito', sans-serif; font-size: 14px; direction: ltr; text-align: left; }",
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
        onClose={() => { if (!savingQuestions) setDrawerOpen(false); }}
        width="min(1240px, 100vw)"
        maskClosable={false}
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
        className={`customDrawer ${styles.questionDrawer}`}
        footer={
          <div className={styles.drawerFooter}>
            <span className={styles.footerStatus}><Check size={16} />{validQuestionCount}/{tempQuestions.length} câu hợp lệ</span>
            <Button onClick={() => setDrawerOpen(false)} disabled={savingQuestions}>Đóng</Button>
            <Button
              type="primary"
              onClick={handleSaveQuestions}
              loading={savingQuestions}
              disabled={!tempQuestions.length || validQuestionCount !== tempQuestions.length}
              className={styles.saveBtn}
            >
              <Save size={16} />
              Lưu câu hỏi
            </Button>
          </div>
        }
      >
        {/* Import Word Section */}
        {/* import từ word - tạm đóng vì chưa nâng cấp */}
        {/* <div className={styles.importWordSection}>
          <div className={styles.importWordHeader}>
            <div className={styles.importWordIcon}>
              <FileText size={20} />
            </div>
            <div className={styles.importWordText}>
              <div className={styles.importWordTitle}>Import từ Word</div>
              <div className={styles.importWordSubtitle}>Upload file .docx để thêm nhiều câu hỏi cùng lúc</div>
            </div>
            <Tooltip 
              title={
                <div className={styles.wordGuideTooltip}>
                  <div className={styles.wordGuideTitle}>📝 Hướng dẫn định dạng Word</div>
                  <div className={styles.wordGuideContent}>
                    <p><strong>Cấu trúc mỗi câu hỏi (5-6 dòng):</strong></p>
                    <ol>
                      <li><strong>Dòng 1:</strong> Nội dung câu hỏi</li>
                      <li><strong>Dòng 2:</strong> A. Đáp án 1</li>
                      <li><strong>Dòng 3:</strong> B. Đáp án 2</li>
                      <li><strong>Dòng 4:</strong> C. Đáp án 3</li>
                      <li><strong>Dòng 5:</strong> D. Đáp án 4 <em>(bôi đậm đáp án đúng)</em></li>
                      <li><strong>Dòng 6:</strong> <em>(Tùy chọn) Note: Giải thích...</em></li>
                    </ol>
                    <p><strong>Cách xác định đáp án đúng:</strong></p>
                    <ul>
                      <li>Bôi đậm (Bold) đáp án đúng trong Word</li>
                      <li>Phím tắt: Ctrl+B</li>
                    </ul>
                    <p><strong>Lưu ý:</strong></p>
                    <ul>
                      <li>Mỗi câu hỏi cách nhau 1 dòng trống</li>
                      <li>Có thể thêm giải thích sau mỗi câu</li>
                      <li>File .docx hoặc .doc</li>
                    </ul>
                  </div>
                </div>
              }
              placement="right"
              overlayClassName={styles.wordGuideOverlay}
            >
              <button className={styles.wordGuideBtn}>
                <HelpCircle size={16} />
                Hướng dẫn
              </button>
            </Tooltip>
          </div>
          <Upload
            accept=".docx,.doc"
            showUploadList={false}
            beforeUpload={(file) => {
              handleImportWord(file);
              return false;
            }}
          >
            <Button 
              type="dashed" 
              loading={importingWord}
              icon={<UploadIcon size={16} />}
              className={styles.importWordBtn}
            >
              {importingWord ? "Đang xử lý..." : "Chọn file Word"}
            </Button>
          </Upload>
          {importedWordCount > 0 && (
            <div className={styles.importWordSuccess}>
              ✓ Đã import thành công {importedWordCount} câu hỏi!
            </div>
          )}
        </div> */}

        <div className={styles.questionWorkspace} aria-busy={savingQuestions} style={savingQuestions ? { pointerEvents: "none", opacity: 0.7 } : undefined}>
        <aside className={styles.questionSidebar}>
          <div className={styles.bankHeading}><span>Ngân hàng câu hỏi</span><strong>{tempQuestions.length}</strong></div>
          <p className={styles.bankHint}>Chọn một câu để chỉnh sửa nội dung và đáp án.</p>
        {/* Question Navigator */}
        <div className={styles.questionNav}>
          {tempQuestions.map((q, index) => (
            <button
              type="button"
              key={index}
              ref={(el) => (questionRefs.current[`nav_${index}`] = el)}
              className={`${styles.questionNavItem} ${index === activeQuestionIndex ? styles.questionNavActive : ""}`}
              aria-pressed={index === activeQuestionIndex}
              onClick={() => selectQuestion(index)}
            >
              <span className={styles.questionNavNumber}>{index + 1}</span>
              <span className={styles.questionNavPreview}>{questionText(q.noiDungCauHoi) || "Câu hỏi mới"}</span>
              {isQuestionValid(q) && <Check size={14} className={styles.navValidIcon} />}
            </button>
          ))}
          <button className={styles.addQuestionBtn} onClick={addNewQuestion} title="Thêm câu hỏi">
            <Plus size={16} /> Thêm câu hỏi
          </button>
        </div>
        </aside>

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
            tempQuestions.map((question, index) => index === activeQuestionIndex && (
              <div
                key={index}
                ref={(el) => (questionRefs.current[index] = el)}
                className={`${styles.questionItem} ${index === activeQuestionIndex ? styles.questionItemActive : ""}`}
              >
                <div className={styles.questionItemHeader}>
                  <div className={styles.questionItemLeft}>
                    <span className={styles.questionItemBadge}>{index + 1}</span>
                    <span className={styles.questionItemLabel}>Câu hỏi {index + 1}</span>
                    {isQuestionValid(question) && (
                      <Tag color="success" className={styles.validTag}>Hợp lệ</Tag>
                    )}
                  </div>
                  <div className={styles.questionItemActions}>
                    <Tooltip title="Xóa câu hỏi">
                      <button
                        className={styles.deleteQuestionBtn}
                            aria-label="Xóa câu hỏi"
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
                        initialValue={question.noiDungCauHoi || ""}
                        onEditorChange={(content) => {
                          if (typeof content === 'string') {
                            updateQuestionContent(index, content);
                          }
                        }}
                        init={{
                          height: 300,
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
                          init_instance_callback: (editor) => {
                            editor.on('blur', () => {
                              const content = editor.getContent();
                              updateQuestionContent(index, content);
                            });
                          },
                          media_alt_source: true,
                          media_poster: false,
                          content_style: "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap'); body { font-family: 'Nunito', sans-serif; font-size: 14px; direction: ltr; text-align: left; }",
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
                              aria-label={`Nội dung đáp án ${ANSWER_LETTERS[answerIndex]}`}
                            />
                            <button
                              className={`${styles.correctToggle} ${answer.laDapAnDung ? styles.correctToggleOn : ""}`}
                              onClick={() => toggleCorrectAnswer(index, answerIndex)}
                              title="Đánh dấu đáp án đúng"
                              aria-label={`Chọn ${ANSWER_LETTERS[answerIndex]} là đáp án đúng`}
                              aria-pressed={answer.laDapAnDung}
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

                    {/* Lưu ý với TinyMCE */}
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
                        {question.showGiaiThich ? "Ẩn giải thích đáp án" : "Thêm giải thích đáp án"}
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
                            onEditorChange={(content) => {
                              if (typeof content === 'string') {
                                updateGiaiThichContent(index, content);
                              }
                            }}
                            init={{
                              height: 120,
                              menubar: false,
                              plugins: ["lists", "link", "wordcount", "image"],
                              toolbar: "bold italic | bullist numlist | image",
                              images_upload_handler: handleEditorUpload,
                              init_instance_callback: (editor) => {
                                editor.on('blur', () => {
                                  const content = editor.getContent();
                                  updateGiaiThichContent(index, content);
                                });
                              },
                              content_style: "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap'); body { font-family: 'Nunito', sans-serif; font-size: 14px; direction: ltr; text-align: left; }",
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
        </div>
        {tempQuestions.length > 0 && <div className={styles.questionPager}>
          <Button disabled={activeQuestionIndex === 0} onClick={() => selectQuestion(activeQuestionIndex - 1)}><ChevronLeft size={15} />Câu trước</Button>
          <span>Câu {activeQuestionIndex + 1} / {tempQuestions.length}</span>
          <Button disabled={activeQuestionIndex === tempQuestions.length - 1} onClick={() => selectQuestion(activeQuestionIndex + 1)}>Câu tiếp<ChevronRight size={15} /></Button>
        </div>}
      </Drawer>

      <LessonPreviewDrawer
        open={previewModalOpen}
        onClose={() => { previewRequest.current += 1; setPreviewModalOpen(false); }}
        lesson={previewBaiGiang}
        questions={previewQuestions}
        loading={previewLoading}
        error={previewError}
        onRetry={() => openPreviewModal(previewBaiGiang)}
        canViewAnswers={isManagement}
      />
    </div>
  );
};

export default BaiGiang;
