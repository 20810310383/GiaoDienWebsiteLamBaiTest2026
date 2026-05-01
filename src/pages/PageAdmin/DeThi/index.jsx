import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Drawer,
  Form,
  Modal,
  Tooltip,
  Popconfirm,
  Avatar,
  message,
  Select,
  Input,
  Button,
  Dropdown,
  Upload,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  BookOutlined,
  TrophyOutlined,
  UserOutlined,
  FireOutlined,
  StarOutlined,
  PictureOutlined,
  MinusCircleOutlined,
  CalendarOutlined,
  FileExcelOutlined,
  UploadOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Editor } from "@tinymce/tinymce-react";
import { getPublicUrl } from "../../../utils/formatURL";
import { uploadAPI } from "../../../services/uploadAPI";
import {
  getAllDeThi,
  createDeThi,
  updateDeThi,
  deleteDeThi,
  toggleDuyetDeThi,
  getDeThiById,
  importDeThiWord,
} from "../../../services/boDeService";
import styles from "./DeThi.module.css";
import { createTheLoai, getAllTheLoai } from "../../../services/theLoaiDeThi";
import { useAuth } from "../../../contexts/AuthContext";
import { decryptData } from "../../../utils/cryptoHelper";
import { getAllUsers } from "../../../services/nguoiDungService";

const handleEditorUpload1 = async (blobInfo) => {
  const res = await uploadAPI.uploadImage(blobInfo.blob());
  return getPublicUrl(res.data?.url || res.url);
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

const CHE_DO_MAP = {
  on_thi: { label: "Ôn Thi", color: "#3b82f6", icon: <BookOutlined /> },
  thi_that: { label: "Thi Thật", color: "#ef4444", icon: <TrophyOutlined /> },
  ca_hai: {
    label: "Ôn thi & Thi thật",
    color: "#10b981",
    icon: <FireOutlined />,
  },
};

const DA_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// ─── Card Đề Thi ─────────────────────────────────────────────────────────────
const DeThiCard = ({
  deThi,
  onEdit,
  onDelete,
  onToggleDuyet,
  onView,
  isAdmin,
}) => {
  const cheDoInfo = CHE_DO_MAP[deThi.cheDo] || CHE_DO_MAP.ca_hai;
  const img = deThi.anhDaiDien ? getPublicUrl(deThi.anhDaiDien) : null;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN"); // Trả về dạng: 25/02/2026
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardThumb}>
        {img ? (
          <img src={img} alt={deThi.tieuDe} className={styles.cardImg} />
        ) : (
          <div className={styles.cardImgPlaceholder}>
            <BookOutlined style={{ fontSize: 36 }} />
          </div>
        )}
        <div
          className={styles.cardBadge}
          style={{ background: cheDoInfo.color }}
        >
          {cheDoInfo.icon}&nbsp;{cheDoInfo.label}
        </div>
        <div
          className={`${styles.cardStatus} ${deThi.trangThaiDuyet ? styles.statusActive : styles.statusPending}`}
        >
          {deThi.trangThaiDuyet ? "✓ Đã duyệt" : "⏳ Chờ duyệt"}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.cardCode}>{deThi.maDeThi}</span>
          {/* Chỉ hiện icon khóa nếu trạng thái KHÔNG PHẢI công khai VÀ có mật khẩu */}
          {deThi.trangThai !== "cong_khai" && (
            <Tooltip title={`Đề thi có mật khẩu`} color="orange">
              <span
                style={{
                  color: "#f59e0b",
                  marginLeft: "8px",
                  cursor: "pointer",
                }}
              >
                <LockOutlined />
              </span>
            </Tooltip>
          )}

          <span className={styles.cardTime}>
            <ClockCircleOutlined /> {deThi.thoiGianLamBai} phút
          </span>
        </div>
        <h3 className={styles.cardTitle}>{deThi.tieuDe}</h3>
        <div className={styles.cardInfo}>
          <span className={styles.infoChip}>
            <QuestionCircleOutlined /> {deThi.soCauHoi || 0} câu
          </span>
          <span className={styles.infoChip}>
            <PlayCircleOutlined /> {deThi.soLuotThi || 0} lượt
          </span>
          {deThi.theLoai?.tenTheLoai && (
            <span className={styles.infoChip}>
              <StarOutlined /> {deThi.theLoai.tenTheLoai}
            </span>
          )}
        </div>
        {deThi.nguoiDang && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className={styles.cardAuthor}>
              <Avatar
                src={getPublicUrl(deThi.nguoiDang.avatar)}
                size={18}
                icon={<UserOutlined />}
                style={{ background: "#10b981" }}
              />
              <span>
                {deThi.nguoiDang?.hoTen || deThi.nguoiDang?.email || "Ẩn danh"}
              </span>
            </div>
            <span className={styles.cardDate}>
              <CalendarOutlined /> {formatDate(deThi.createdAt)}
            </span>{" "}
          </div>
        )}
      </div>

      <div className={styles.cardActions}>
        <Tooltip title="Xem chi tiết">
          <button
            className={`${styles.actionBtn} ${styles.btnView}`}
            onClick={() => onView(deThi)}
          >
            <EyeOutlined />
          </button>
        </Tooltip>
        <Tooltip title="Chỉnh sửa">
          <button
            className={`${styles.actionBtn} ${styles.btnEdit}`}
            onClick={() => onEdit(deThi)}
          >
            <EditOutlined />
          </button>
        </Tooltip>
        {isAdmin && (
          <Tooltip title={deThi.trangThaiDuyet ? "Ẩn đề thi" : "Duyệt đề thi"}>
            <button
              className={`${styles.actionBtn} ${deThi.trangThaiDuyet ? styles.btnHide : styles.btnApprove}`}
              onClick={() => onToggleDuyet(deThi._id)}
            >
              {deThi.trangThaiDuyet ? (
                <StopOutlined />
              ) : (
                <CheckCircleOutlined />
              )}
            </button>
          </Tooltip>
        )}
        <Popconfirm
          title="Xóa đề thi này?"
          description="Hành động không thể hoàn tác!"
          onConfirm={() => onDelete(deThi._id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Xóa vĩnh viễn">
            <button className={`${styles.actionBtn} ${styles.btnDelete}`}>
              <DeleteOutlined />
            </button>
          </Tooltip>
        </Popconfirm>
      </div>
    </div>
  );
};

// ─── Component Giải Thích (toggle ẩn/hiện Editor) ────────────────────────────
const GiaiThichEditor = ({ index, form }) => {
  const initialValRef = useRef(
    form.getFieldValue(["danhSachCauHoi", index, "giaiThich"]) || "",
  );
  const [open, setOpen] = useState(!!initialValRef.current);

  const handleRemove = () => {
    const all = form.getFieldValue("danhSachCauHoi") || [];
    if (all[index]) {
      all[index].giaiThich = "";
      form.setFieldValue("danhSachCauHoi", [...all]);
    }
    setOpen(false);
  };

  return (
    <div className={styles.giaiThichWrap}>
      {!open ? (
        <button
          type="button"
          className={styles.giaiThichToggleBtn}
          onClick={() => setOpen(true)}
        >
          <span className={styles.giaiThichToggleIcon}>💡</span>
          Thêm giải thích đáp án
        </button>
      ) : (
        <div className={styles.giaiThichBox}>
          <div className={styles.giaiThichBoxHeader}>
            <span className={styles.giaiThichBoxTitle}>
              <span>💡</span> Giải thích đáp án
            </span>
            <button
              type="button"
              className={styles.giaiThichBoxClose}
              onClick={handleRemove}
            >
              ✕ Xóa giải thích
            </button>
          </div>
          <div className={styles.editorWrap}>
            <Editor
              initialValue={initialValRef.current} // ✅ đúng field
              apiKey="zjpcag3mx26mkofp78l7t8bmqyehvp1yqtapi5t9smj030pj"
              onEditorChange={(val) => {
                const all = form.getFieldValue("danhSachCauHoi") || [];
                if (all[index]) {
                  all[index].giaiThich = val;
                  form.setFieldValue("danhSachCauHoi", [...all]);
                }
              }}
              //   initialValue={existing}
              init={{
                height: 300,
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
                file_picker_types: "image",
                file_picker_callback: (callback, value, meta) => {
                  const input = document.createElement("input");
                  input.setAttribute("type", "file");
                  input.setAttribute("accept", "image/*");
                  input.onchange = async function () {
                    try {
                      const res = await uploadAPI.uploadImage(this.files[0]);
                      callback(getPublicUrl(res.data?.url || res.url));
                    } catch {
                      message.error("Lỗi upload ảnh");
                    }
                  };
                  input.click();
                },
                placeholder: "Nhập giải thích cho đáp án đúng...",
                // skin: "oxide-dark",
                // content_css: "dark",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Component Câu Hỏi ───────────────────────────────────────────────────────
const CauHoiForm = ({ index, form, onRemove }) => {
  const editorRef = useRef(null);
  // local state để re-render khi checkbox thay đổi
  const [dapAnState, setDapAnState] = useState(
    () => form.getFieldValue(["danhSachCauHoi", index, "cacDapAn"]) || [],
  );

  const updateDapAn = (list) => {
    const all = form.getFieldValue("danhSachCauHoi") || [];
    if (all[index]) {
      all[index].cacDapAn = list;
      form.setFieldValue("danhSachCauHoi", [...all]);
    }
    setDapAnState([...list]);
  };

  const initialNoiDungRef = useRef(
    // ← đặt ngay sau editorRef
    form.getFieldValue(["danhSachCauHoi", index, "noiDungText"]) || "",
  );

  return (
    <div className={styles.cauHoiBlock}>
      {/* ── Header ── */}
      <div className={styles.cauHoiHeader}>
        <div className={styles.cauHoiIndexWrap}>
          <span className={styles.cauHoiIndex}>{index + 1}</span>
          <span className={styles.cauHoiLabel}>Câu {index + 1}</span>
        </div>
        <button
          type="button"
          className={styles.removeCauHoiBtn}
          onClick={onRemove}
        >
          <MinusCircleOutlined /> Xóa câu
        </button>
      </div>

      {/* ── Nội dung câu hỏi ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Nội dung câu hỏi <span className={styles.required}>*</span>
        </label>
        <div className={styles.editorWrap}>
          <Editor
            apiKey="zjpcag3mx26mkofp78l7t8bmqyehvp1yqtapi5t9smj030pj"
            onInit={(evt, editor) => {
              editorRef.current = editor;
            }}
            // onEditorChange={(val) => {
            //   const all = form.getFieldValue("danhSachCauHoi") || [];
            //   if (all[index]) {
            //     all[index].noiDungText = val;
            //     form.setFieldValue("danhSachCauHoi", [...all]);
            //   }
            // }}
            onEditorChange={(val) => {
              const all = form.getFieldValue("danhSachCauHoi") || [];
              if (all[index]) {
                all[index].noiDungText = val;
                form.setFieldValue("danhSachCauHoi", [...all]);
              }
            }}
            // initialValue={initialNoiDungRef.current}
            value={
              form.getFieldValue(["danhSachCauHoi", index, "noiDungText"]) || ""
            }
            init={{
              height: 350,
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
                "code",
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
                // input.setAttribute(
                //   "accept",
                //   meta.filetype === "image" ? "image/*" : "video/*",
                // );
                if (meta.filetype === "image") {
                  input.setAttribute("accept", "image/*");
                } else if (meta.filetype === "media") {
                  // Cho phép cả video và audio khi mở công cụ media
                  input.setAttribute("accept", "video/*,audio/*");
                }
                input.onchange = async function () {
                  try {
                    // const file = this.files[0];
                    // const res = file.type.startsWith("video/")
                    //   ? await uploadAPI.uploadVideo(file)
                    //   : await uploadAPI.uploadImage(file);
                    // callback(getPublicUrl(res.data?.url || res.url));

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
                    const finalUrl = getPublicUrl(res.data?.url || res.url);
                    callback(finalUrl);
                  } catch {
                    message.error("Lỗi upload");
                  }
                };
                input.click();
              },
              //   skin: "oxide-dark",
              //   content_css: "dark",
            }}
          />
        </div>
      </div>

      {/* ── Đáp án ── */}
      <div className={styles.dapAnSection}>
        <div className={styles.dapAnHeader}>
          <label className={styles.fieldLabel}>
            Đáp án <span className={styles.required}>*</span>
          </label>
          <span className={styles.dapAnHint}>
            Tick <strong>✓</strong> để đánh dấu đáp án đúng
          </span>
        </div>

        <div className={styles.dapAnList}>
          {dapAnState.map((da, daIdx) => (
            <div
              key={daIdx}
              className={`${styles.dapAnRow} ${da.laDapAnDung ? styles.dapAnRowDung : ""}`}
            >
              {/* Letter badge */}
              <span
                className={`${styles.dapAnLetter} ${da.laDapAnDung ? styles.dapAnLetterDung : ""}`}
              >
                {DA_LETTERS[daIdx] || daIdx + 1}
              </span>

              {/* Input đáp án */}
              <Input
                // className={styles.dapAnInput}
                placeholder={`Nội dung đáp án ${DA_LETTERS[daIdx] || daIdx + 1}...`}
                value={da.noiDungDapAn}
                onChange={(e) => {
                  const next = [...dapAnState];
                  next[daIdx] = {
                    ...next[daIdx],
                    noiDungDapAn: e.target.value,
                  };
                  updateDapAn(next);
                }}
              />

              {/* Toggle đúng/sai */}
              <Button
                type="button"
                className={`${styles.correctToggle} ${da.laDapAnDung ? styles.correctToggleOn : ""}`}
                onClick={() => {
                  const next = [...dapAnState];
                  next[daIdx] = {
                    ...next[daIdx],
                    laDapAnDung: !next[daIdx].laDapAnDung,
                  };
                  updateDapAn(next);
                }}
                title="Đáp án đúng"
              >
                {da.laDapAnDung ? (
                  <CheckCircleOutlined />
                ) : (
                  <span className={styles.correctCircle}>○</span>
                )}
              </Button>

              {/* Xóa đáp án */}
              {dapAnState.length > 2 && (
                <Button
                  type="button"
                  className={styles.removeDapAnBtn}
                  onClick={() => {
                    const next = dapAnState.filter((_, i) => i !== daIdx);
                    updateDapAn(next);
                  }}
                >
                  <MinusCircleOutlined />
                </Button>
              )}
            </div>
          ))}

          <button
            type="button"
            className={styles.addDapAnBtn}
            onClick={() =>
              updateDapAn([
                ...dapAnState,
                { noiDungDapAn: "", laDapAnDung: false },
              ])
            }
          >
            <PlusOutlined /> Thêm đáp án
          </button>
        </div>
      </div>

      {/* ── Giải thích ── */}
      <GiaiThichEditor index={index} form={form} />
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DeThi() {
  const [deThiList, setDeThiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [filters, setFilters] = useState({
    search: "",
    theLoai: "",
    cheDo: "",
    trangThaiDuyet: "",
    nguoiDangId: "",
  });
  const [showFilter, setShowFilter] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [thumbUrl, setThumbUrl] = useState("");
  const [thumbUploading, setThumbUploading] = useState(false);
  const [cheDoValue, setCheDoValue] = useState("ca_hai");

  // ── Thể loại ──
  const [theLoaiList, setTheLoaiList] = useState([]);
  const [theLoaiLoading, setTheLoaiLoading] = useState(false);

  const [form] = Form.useForm();
  const { token, user } = useAuth();

  const [newTheLoai, setNewTheLoai] = useState("");
  const [addingTl, setAddingTl] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const [questionMode, setQuestionMode] = useState("manual");
  // manual | import

  const [importLoading, setImportLoading] = useState(false);
  const [dataNguoiDung, setDataNguoiDung] = useState([]);
  const findNguoiDung = async () => {
    try {
      const res = await getAllUsers(
        "page=1&limit=200&filterAuthors=true",
        token,
      );

      setDataNguoiDung(res.users);
    } catch (error) {}
  };

  useEffect(() => {
    findNguoiDung();
  }, [token]);

  const handleImportWord = async (file) => {
    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await importDeThiWord(formData, token);

      if (!res.success) {
        message.error(res.message || "Import thất bại");
        return false;
      }

      const importedQuestions = res.data?.danhSachCauHoi || [];

      if (!importedQuestions.length) {
        message.warning("Không tìm thấy câu hỏi nào");
        return false;
      }

      // 🔥 LẤY CÂU CŨ
      const existing = form.getFieldValue("danhSachCauHoi") || [];

      // 🔥 GHÉP LẠI
      const merged = [...existing, ...importedQuestions];

      // 🔥 SET LẠI FORM
      form.setFieldValue("danhSachCauHoi", merged);

      // Nhảy đến câu đầu tiên vừa import
      setActiveQuestionIndex(existing.length);

      message.success(`Đã thêm ${importedQuestions.length} câu`);

      setQuestionMode("manual");
    } catch (err) {
      message.error("Lỗi import");
    } finally {
      setImportLoading(false);
    }

    return false;
  };

  // Hàm xử lý thêm nhanh thể loại
  const onAddTheLoai = async (e) => {
    e.preventDefault();
    if (!newTheLoai.trim()) return;

    setAddingTl(true);
    try {
      // 1. Gọi API tạo thể loại mới
      const defaultImage = "/uploads/images/default-theloai.png";
      const res = await createTheLoai(
        { tenTheLoai: newTheLoai, anhDaiDien: defaultImage },
        token,
      );
      const createdTl = res.data || res;

      // 2. Cập nhật danh sách local để Select hiển thị thêm option mới này
      setTheLoaiList((prev) => [...prev, createdTl]);

      // 3. QUAN TRỌNG: Gán giá trị vừa tạo vào Form để "chọn luôn"
      form.setFieldValue("theLoai", createdTl._id);

      message.success(`Đã thêm và chọn: ${newTheLoai}`);
      setNewTheLoai("");
    } catch (err) {
      message.error("Lỗi khi thêm thể loại mới");
    } finally {
      setAddingTl(false);
    }
  };

  // ── Fetch thể loại (1 lần duy nhất) ──
  useEffect(() => {
    const fetchTheLoai = async () => {
      setTheLoaiLoading(true);
      try {
        const res = await getAllTheLoai({ limit: 999 });
        setTheLoaiList(res.theLoais || res.data || []);
      } catch {
        message.error("Lỗi tải danh sách thể loại");
      } finally {
        setTheLoaiLoading(false);
      }
    };
    fetchTheLoai();
  }, []);

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      // Nếu không phải admin, ta ép tham số nguoiDang là ID của user hiện tại
      // Điều này giúp user thường chỉ thấy đề của họ trong trang quản lý
      if (user && user.role !== "admin") {
        params.nguoiDangId = user._id;
        // Xóa trangThaiDuyet nếu muốn user thấy cả đề đang chờ duyệt của họ
        // delete params.trangThaiDuyet;
      }

      Object.keys(params).forEach((k) => {
        if (!params[k] && params[k] !== 0) delete params[k];
      });
      const res = await getAllDeThi(params, token);
      const decryptedQuiz = decryptData(res);
      setDeThiList(decryptedQuiz.deThis || []);
      setTotal(decryptedQuiz.totalItems || 0);
    } catch {
      message.error("Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const TRANG_THAI_MAP = {
    cong_khai: {
      label: "Công khai",
      color: "#10b981",
      icon: <CheckCircleOutlined />,
    },
    rieng_tu: { label: "Riêng tư", color: "#f59e0b", icon: <EyeOutlined /> },
  };

  // ── Open Create ──
  const openCreate = () => {
    setEditingId(null);
    setThumbUrl("");
    setCheDoValue("ca_hai");
    setActiveQuestionIndex(0);
    form.resetFields();
    form.setFieldsValue({
      cheDo: "ca_hai",
      thoiGianLamBai: 45,
      matKhauDeThi: "",
      danhSachCauHoi: [
        {
          noiDungText: "",
          cacDapAn: [
            { noiDungDapAn: "", laDapAnDung: false },
            { noiDungDapAn: "", laDapAnDung: false },
          ],
        },
      ],
    });
    setDrawerOpen(true);
  };

  // ── Open Edit ──
  const openEdit = async (deThi) => {
    setEditingId(deThi._id);
    setThumbUrl(deThi.anhDaiDien);
    const cd = deThi.cheDo || "ca_hai";
    setCheDoValue(cd);
    try {
      const detail = await getDeThiById(deThi._id);
      form.setFieldsValue({
        ...detail,
        theLoai: detail.theLoai?._id || detail.theLoai,
        cheDo: cd,
      });
    } catch {
      form.setFieldsValue({
        ...deThi,
        theLoai: deThi.theLoai?._id || deThi.theLoai,
        cheDo: cd,
      });
    }
    setDrawerOpen(true);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const values = form.getFieldsValue(true);
    if (!values.tieuDe?.trim()) {
      message.error("Nhập tiêu đề!");
      return;
    }
    if (!values.theLoai) {
      message.error("Chọn thể loại!");
      return;
    }
    const chs = values.danhSachCauHoi || [];
    if (!chs.length) {
      message.error("Phải có ít nhất 1 câu hỏi!");
      return;
    }
    for (let i = 0; i < chs.length; i++) {
      const da = chs[i].cacDapAn || [];
      if (da.length < 2) {
        message.error(`Câu ${i + 1}: Cần ít nhất 2 đáp án!`);
        return;
      }
      if (!da.some((d) => d.laDapAnDung)) {
        message.error(`Câu ${i + 1}: Chưa chọn đáp án đúng!`);
        return;
      }
    }
    setSaving(true);
    try {
      values.cheDo = cheDoValue;

      if (thumbUrl) values.anhDaiDien = thumbUrl;

      // Đảm bảo mật khẩu là null nếu trống để đúng định dạng schema
      if (!values.matKhauDeThi?.trim()) {
        values.matKhauDeThi = null;
      }

      if (editingId) {
        await updateDeThi(editingId, values, token);
        message.success("Cập nhật thành công!");
      } else {
        await createDeThi(values, token);
        message.success("Tạo đề thi thành công!");
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      message.error(err?.message || "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDeThi(id, token);
      message.success("Đã xóa");
      fetchData();
    } catch {
      message.error("Lỗi xóa");
    }
  };
  const handleToggle = async (id) => {
    try {
      const r = await toggleDuyetDeThi(id, token);
      message.success(r.message || "Đã cập nhật");
      fetchData();
    } catch {
      message.error("Lỗi");
    }
  };
  const handleView = async (deThi) => {
    try {
      setViewData(await getDeThiById(deThi._id));
    } catch {
      setViewData(deThi);
    }
    setViewOpen(true);
  };
  const handleThumbUpload = async (file) => {
    setThumbUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      const url = res.data?.url || res.url;
      setThumbUrl(url);
      form.setFieldValue("anhDaiDien", url);
      message.success("Upload thành công!");
    } catch {
      message.error("Lỗi upload");
    } finally {
      setThumbUploading(false);
    }
  };

  const handleFilterChange = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters({
      search: "",
      theLoai: "",
      cheDo: "",
      trangThaiDuyet: "",
      nguoiDangId: "",
    });
    setPage(1);
  };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const totalPages = Math.ceil(total / limit);

  const isAdmin = user?.role === "admin";

  const questions = form.getFieldValue("danhSachCauHoi") || [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const getPaginationRange = () => {
    const delta = 1; // Số trang hiển thị 2 bên trang hiện tại
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  return (
    <div className={styles.pageRoot}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <TrophyOutlined />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Quản Lý Đề Thi</h1>
            <p className={styles.pageSubtitle}>
              {total} bộ đề · Trang {page}/{totalPages || 1}
            </p>
          </div>
        </div>
        <button className={styles.createBtn} onClick={openCreate}>
          <PlusOutlined /> Tạo Đề Thi
        </button>
        {/* <Dropdown menu={createMenu} trigger={["click"]} placement="bottomRight">
          <button className={styles.createBtn}>
            <PlusOutlined /> Tạo Đề Thi{" "}
            <span style={{ fontSize: "10px", marginLeft: "4px" }}>▼</span>
          </button>
        </Dropdown> */}
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <SearchOutlined className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Tìm kiếm theo tiêu đề..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className={styles.toolbarRight}>
          <button
            className={`${styles.filterToggleBtn} ${activeFilterCount > 0 ? styles.filterActive : ""}`}
            onClick={() => setShowFilter((v) => !v)}
          >
            <FilterOutlined /> Bộ lọc{" "}
            {activeFilterCount > 0 && (
              <span className={styles.filterBadge}>{activeFilterCount}</span>
            )}
          </button>
          <button className={styles.refreshBtn} onClick={fetchData}>
            <ReloadOutlined />
          </button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div
        className={`${styles.filterPanel} ${showFilter ? styles.filterPanelOpen : ""}`}
      >
        <div className={styles.filterGrid}>
          {/* Chỉ hiển thị khi là Admin */}
          {user?.role === "admin" && (
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>Tác giả đề thi</label>
              <Select
                showSearch
                className={styles.darkSelectAntd}
                placeholder="Tìm theo tác giả"
                optionFilterProp="label"
                value={filters.nguoiDangId || undefined}
                onChange={(value) => handleFilterChange("nguoiDangId", value)}
                // theLoaiList ở đây thay bằng list User ông truyền từ server về (ví dụ: dataNguoiDung)
                options={[
                  { value: "", label: "Tất cả người đăng" },
                  ...(dataNguoiDung || []).map((u) => ({
                    value: u._id,
                    label: (
                      <>
                        <img
                          src={getPublicUrl(u.avatar)}
                          alt={u.hoTen}
                          style={{
                            width: 25,
                            height: 25,
                            marginRight: 10,
                            borderRadius: "50%",
                          }}
                        />
                        <span>{u.hoTen}</span>
                      </>
                    ),
                  })),
                ]}
              />
            </div>
          )}

          {/* 1. Thể loại (Có Search) */}
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Thể loại</label>
            <Select
              showSearch
              className={styles.darkSelectAntd}
              placeholder="Chọn thể loại"
              optionFilterProp="label"
              value={filters.theLoai || undefined}
              onChange={(value) => handleFilterChange("theLoai", value)}
              options={[
                { value: "", label: "Tất cả thể loại" },
                ...theLoaiList.map((tl) => ({
                  value: tl._id,
                  label: tl.tenTheLoai,
                })),
              ]}
            />
          </div>

          {/* 2. Chế độ */}
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Chế độ</label>
            <Select
              className={styles.darkSelectAntd}
              value={filters.cheDo || undefined}
              placeholder="Chọn chế độ"
              onChange={(value) => handleFilterChange("cheDo", value)}
              options={[
                { value: "", label: "Tất cả chế độ" },
                { value: "on_thi", label: "Ôn Thi" },
                { value: "thi_that", label: "Thi Thật" },
                { value: "ca_hai", label: "Cả Hai" },
              ]}
            />
          </div>

          {/* 3. Trạng thái */}
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Trạng thái</label>
            <Select
              className={styles.darkSelectAntd}
              value={
                filters.trangThaiDuyet !== ""
                  ? String(filters.trangThaiDuyet)
                  : undefined
              }
              placeholder="Chọn trạng thái"
              onChange={(value) => handleFilterChange("trangThaiDuyet", value)}
              options={[
                { value: "", label: "Tất cả trạng thái" },
                { value: "true", label: "Đã duyệt" },
                { value: "false", label: "Chờ duyệt" },
              ]}
            />
          </div>

          {/* 4. Nút Reset */}
          <div
            className={styles.filterItem}
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <Button
              type="primary"
              danger
              ghost
              icon={<ReloadOutlined />}
              onClick={resetFilters}
              className={styles.resetBtnAntd}
            >
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      {/* ── Card Grid ── */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Đang tải...</p>
        </div>
      ) : deThiList.length === 0 ? (
        <div className={styles.emptyWrap}>
          <div className={styles.emptyIcon}>
            <BookOutlined />
          </div>
          <p>Không có đề thi nào</p>
          <button
            className={styles.createBtn}
            onClick={openCreate}
            style={{ marginTop: 16 }}
          >
            <PlusOutlined /> Tạo ngay
          </button>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {deThiList.map((dt) => (
            <DeThiCard
              key={dt._id}
              deThi={dt}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleDuyet={handleToggle}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <div className={styles.paginationWrap}>
        <button
          className={styles.pageBtn}
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ←
        </button>

        {getPaginationRange().map((p, index) => (
          <button
            key={index}
            className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""} ${p === "..." ? styles.dots : ""}`}
            onClick={() => typeof p === "number" && setPage(p)}
            disabled={p === "..."}
          >
            {p}
          </button>
        ))}

        <button
          className={styles.pageBtn}
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          →
        </button>
      </div>
      {/* {totalPages > 1 && (
        <div className={styles.paginationWrap}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            →
          </button>
        </div>
      )} */}

      {/* ══ DRAWER TẠO / SỬA ══ */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={1100}
        className={styles.lightDrawer}
        title={
          <div className={styles.drawerHeader}>
            <div className={styles.drawerTitleLeft}>
              {editingId ? (
                <>
                  <EditOutlined />
                  <span>Chỉnh sửa đề thi</span>
                </>
              ) : (
                <>
                  <PlusOutlined />
                  <span>Tạo đề thi mới</span>
                </>
              )}
            </div>
          </div>
        }
        footer={
          <div className={styles.drawerFooter}>
            <button
              className={styles.cancelBtn}
              onClick={() => setDrawerOpen(false)}
            >
              Hủy
            </button>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo đề thi"}
            </button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className={styles.lightForm}>
          {/* ================= INFO BOX ================= */}
          <div className={styles.cardBox}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconBlue}>
                <BookOutlined />
              </div>
              <span>Thông tin đề thi</span>
            </div>

            <div className={styles.cardBody}>
              <Form.Item name="tieuDe" label="Tiêu đề đề thi" required>
                <Input size="large" placeholder="Nhập tiêu đề..." />
              </Form.Item>

              <div className={styles.twoCol}>
                <Form.Item
                  name="theLoai"
                  label="Thể loại"
                  rules={[
                    { required: true, message: "Vui lòng chọn thể loại" },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn hoặc thêm thể loại..."
                    loading={theLoaiLoading}
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={theLoaiList.map((tl) => ({
                      value: tl._id,
                      label: tl.tenTheLoai,
                    }))}
                    dropdownRender={(menu) => (
                      <div className={styles.dropdownWrapper}>
                        <div className={styles.dropdownScroll}>{menu}</div>

                        <div className={styles.dropdownDivider} />

                        <div className={styles.addCategoryBox}>
                          <Input
                            size="middle"
                            placeholder="Nhập tên thể loại mới..."
                            value={newTheLoai}
                            onChange={(e) => setNewTheLoai(e.target.value)}
                            onPressEnter={onAddTheLoai}
                          />

                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            loading={addingTl}
                            onClick={onAddTheLoai}
                          >
                            Thêm
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                </Form.Item>

                <Form.Item
                  name="thoiGianLamBai"
                  label="Thời gian (phút)"
                  required
                >
                  <Input type="number" size="large" min={1} max={300} />
                </Form.Item>
              </div>

              {/* Chế độ thi */}
              <div>
                <label className={styles.labelLight}>Chế độ thi</label>
                <div className={styles.radioRow}>
                  {Object.entries(CHE_DO_MAP).map(([val, info]) => (
                    <button
                      key={val}
                      type="button"
                      className={`${styles.radioLight} ${
                        cheDoValue === val ? styles.radioActive : ""
                      }`}
                      onClick={() => {
                        setCheDoValue(val);
                        form.setFieldValue("cheDo", val);
                      }}
                    >
                      {info.icon}
                      <span>{info.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hàng mới cho Trạng thái và Mật khẩu */}
              <div className={styles.twoCol} style={{ marginTop: "20px" }}>
                <Form.Item
                  name="trangThai"
                  label={<strong>Trạng thái hiển thị</strong>}
                  initialValue="cong_khai"
                >
                  <Select
                    size="large"
                    onChange={(val) => {
                      if (val === "cong_khai") {
                        // Tự động xoá giá trị mật khẩu khi chọn công khai
                        form.setFieldValue("matKhauDeThi", null);
                      }
                    }}
                  >
                    {Object.entries(TRANG_THAI_MAP).map(([val, info]) => (
                      <Select.Option key={val} value={val}>
                        <span style={{ color: info.color }}>
                          {info.icon} &nbsp; {info.label}
                        </span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Chỉ hiện mật khẩu nếu không phải 'cong_khai' (hoặc luôn hiện để user tùy chọn) */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.trangThai !== currentValues.trangThai
                  }
                >
                  {({ getFieldValue }) => (
                    <Form.Item
                      name="matKhauDeThi"
                      label={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <strong>Mật khẩu đề thi</strong>
                          <Tooltip title="Để trống nếu không muốn đặt mật khẩu">
                            <QuestionCircleOutlined
                              style={{ color: "#94a3b8" }}
                            />
                          </Tooltip>
                        </div>
                      }
                    >
                      <Input.Password
                        size="large"
                        placeholder="Nhập mật khẩu (nếu có)..."
                        disabled={getFieldValue("trangThai") === "cong_khai"} // Tự động disable nếu là công khai cho logic chặt chẽ
                      />
                    </Form.Item>
                  )}
                </Form.Item>
              </div>

              {/* Media */}
              <div className={styles.mediaRow}>
                <Form.Item required label={<strong>Ảnh đại diện</strong>}>
                  <Upload
                    name="thumb"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleThumbUpload(file);
                      return false; // chặn auto upload của antd
                    }}
                  >
                    {thumbUrl ? (
                      <div className={styles.thumbWrapper}>
                        <img
                          src={getPublicUrl(thumbUrl)}
                          alt="thumb"
                          className={styles.thumbLight}
                        />
                        <div className={styles.overlayEdit}>
                          <UploadOutlined />
                          <span>Đổi ảnh</span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.uploadCard}>
                        <PictureOutlined style={{ fontSize: 22 }} />
                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
                <Form.Item name="videoGioiThieu" label="Giới thiệu">
                  <Input size="large" placeholder="Nội dung giới thiệu..." />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ================= QUESTION BOX ================= */}
          <div className={styles.cardBox}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconPurple}>
                <QuestionCircleOutlined />
              </div>
              <span>Danh sách câu hỏi</span>
            </div>

            {/* Toggle Mode */}
            <div className={styles.questionModeToggle}>
              <button
                type="button"
                className={`${styles.modeBtn} ${
                  questionMode === "manual" ? styles.modeActive : ""
                }`}
                onClick={() => setQuestionMode("manual")}
              >
                <EditOutlined className={styles.modeIcon} />
                <div className={styles.modeText}>
                  <span className={styles.modeTitle}>Thêm thủ công</span>
                  <span className={styles.modeDesc}>
                    Soạn câu hỏi trực tiếp trong hệ thống
                  </span>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.modeBtn} ${
                  questionMode === "import" ? styles.modeActive : ""
                }`}
                onClick={() => setQuestionMode("import")}
              >
                <UploadOutlined className={styles.modeIcon} />
                <div className={styles.modeText}>
                  <span className={styles.modeTitle}>Import từ Word</span>
                  <span className={styles.modeDesc}>
                    Tải file để tạo nhiều câu hỏi nhanh
                  </span>
                </div>
              </button>
            </div>

            <div className={styles.cardBody}>
              {questionMode === "import" ? (
                <div className={styles.importArea}>
                  <Upload.Dragger
                    accept=".doc,.docx"
                    showUploadList={false}
                    beforeUpload={handleImportWord}
                    className={styles.importDragger}
                  >
                    {importLoading ? (
                      <div className={styles.importLoading}>
                        <div className={styles.spinnerModern}></div>
                        <h3>Đang phân tích file Word...</h3>
                        <p>Vui lòng chờ trong giây lát</p>
                      </div>
                    ) : (
                      <div className={styles.importContent}>
                        <div className={styles.importIconBox}>📄</div>

                        <h3>Kéo thả file Word vào đây</h3>
                        <p className={styles.importSub}>
                          Hoặc click để chọn file từ máy tính
                        </p>

                        <div className={styles.importDivider}></div>

                        <div className={styles.importActions}>
                          <Button
                            type="default"
                            size="large"
                            className={styles.downloadSampleBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement("a");
                              link.href = "/bandemo.docx"; // Đường dẫn file trong thư mục public
                              link.download = "Ban_Demo_On_Thi.docx"; // Tên file khi tải về máy người dùng
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <UploadOutlined className={styles.modeIcon} /> Tải
                            file mẫu đơn giản
                          </Button>

                          <Button
                            type="default"
                            size="large"
                            className={styles.downloadSampleBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement("a");
                              link.href = "/bandemo2.docx"; // Đường dẫn file trong thư mục public
                              link.download = "Ban_DemoPhuc_Tap_On_Thi.docx"; // Tên file khi tải về máy người dùng
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <UploadOutlined className={styles.modeIcon} /> Tải
                            file mẫu phức tạp
                          </Button>

                          <span className={styles.importHint}>
                            Chỉ hỗ trợ .doc / .docx
                          </span>
                        </div>
                      </div>
                    )}
                  </Upload.Dragger>

                  <div className={styles.importGuideBox}>
                    <h3 className={styles.importGuideTitle}>
                      📌 Hướng dẫn định dạng file Word
                    </h3>

                    <div className={styles.importSection}>
                      <h4>1️⃣ Cách viết câu hỏi</h4>
                      <ul>
                        <li>
                          Bắt đầu bằng: <strong>Câu 1:</strong>
                        </li>
                        <li>Viết nội dung câu hỏi trên cùng dòng</li>
                      </ul>

                      <div className={styles.codeBlock}>
                        {`Câu 1: React hook nào dùng để quản lý state?`}
                      </div>
                    </div>

                    <div className={styles.importSection}>
                      <h4>2️⃣ Cách viết đáp án (QUAN TRỌNG)</h4>

                      <div className={styles.warningBox}>
                        ⚠️ ĐÁP ÁN BẮT BUỘC phải được tạo bằng chức năng
                        <strong> Numbering Library hoặc Bulleted List </strong>
                        trong Word.
                        <br />❌ Không được gõ tay A. B. C. hoặc chỉ xuống dòng
                        bằng Enter.
                      </div>

                      <ul>
                        <li>Chọn các đáp án</li>
                        <li>
                          Nhấn vào biểu tượng <strong>Numbering Library</strong>{" "}
                          trên thanh công cụ Word
                        </li>
                        <li>
                          Mỗi đáp án phải là một tiểu mục (một dòng trong danh
                          sách)
                        </li>
                      </ul>

                      <div className={styles.codeBlock}>
                        {`Câu 1: 1+1=?

(Chọn tất cả đáp án → nhấn Numbering Library)

A. 3
B. 5
C. 2
D. 6`}
                      </div>
                    </div>

                    <div className={styles.importSection}>
                      <h4>3️⃣ Đánh dấu đáp án đúng</h4>
                      <ul>
                        <li>
                          <strong>Bôi đậm (Bold)</strong> đáp án đúng
                        </li>
                        <li>Không cần thêm ký hiệu ✔</li>
                      </ul>

                      <div
                        className={styles.codeBlock}
                        dangerouslySetInnerHTML={{
                          __html: `
      A. 3
      B. 5
      <strong>C. 2</strong>   <---- Bôi đậm cả dòng này
      D. 6
    `,
                        }}
                      />
                    </div>

                    <div className={styles.importSection}>
                      <h4>4️⃣ Thêm giải thích (không bắt buộc)</h4>
                      <ul>
                        <li>
                          Viết bắt đầu bằng: <strong>Giải thích:</strong>
                        </li>
                        <li>Viết sau danh sách đáp án</li>
                      </ul>

                      <div className={styles.codeBlock}>
                        {`Giải thích: 1 + 1 bằng 2 theo toán học cơ bản.`}
                      </div>
                    </div>

                    <div className={styles.successBox}>
                      ✅ Nếu file đúng định dạng:
                      <ul>
                        <li>Câu hỏi sẽ tự động được tách riêng</li>
                        <li>Đáp án sẽ được sinh đúng vị trí</li>
                        <li>Đáp án bôi đậm sẽ được đánh dấu chính xác</li>
                        <li>Giải thích sẽ tự động fill vào hệ thống</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <Form.List name="danhSachCauHoi">
                  {(fields, { add, remove }) => (
                    <>
                      <div className={styles.questionNavLight}>
                        {fields.map((field, index) => (
                          <button
                            key={field.key}
                            className={`${styles.navItemLight} ${
                              index === activeQuestionIndex
                                ? styles.navItemActive
                                : ""
                            }`}
                            onClick={() => setActiveQuestionIndex(index)}
                          >
                            {index + 1}
                          </button>
                        ))}

                        <button
                          className={styles.navAdd}
                          onClick={() => {
                            add({
                              noiDungText: "",
                              cacDapAn: [
                                { noiDungDapAn: "", laDapAnDung: false },
                                { noiDungDapAn: "", laDapAnDung: false },
                              ],
                            });
                            setActiveQuestionIndex(fields.length);
                          }}
                        >
                          +
                        </button>
                      </div>

                      {fields[activeQuestionIndex] && (
                        <CauHoiForm
                          key={fields[activeQuestionIndex].key}
                          index={activeQuestionIndex}
                          form={form}
                          onRemove={() => {
                            remove(fields[activeQuestionIndex].name);
                            setActiveQuestionIndex((prev) =>
                              prev > 0 ? prev - 1 : 0,
                            );
                          }}
                        />
                      )}
                    </>
                  )}
                </Form.List>
              )}
            </div>
          </div>
        </Form>
      </Drawer>

      {/* ══ MODAL XEM CHI TIẾT ══ */}
      <Modal
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={700}
        className={styles.viewModal}
        title={
          <div className={styles.drawerTitle}>
            <EyeOutlined /> Chi tiết đề thi
          </div>
        }
      >
        {viewData && (
          <div className={styles.viewContent}>
            {viewData.anhDaiDien && (
              <img
                src={getPublicUrl(viewData.anhDaiDien)}
                alt=""
                className={styles.viewThumb}
              />
            )}
            <div className={styles.viewMeta}>
              {/* <span className={styles.viewCode}>{viewData.maDeThi}</span> */}
              <span
                className={styles.viewCheDo}
                style={{ background: CHE_DO_MAP[viewData.cheDo]?.color }}
              >
                {CHE_DO_MAP[viewData.cheDo]?.label}
              </span>
              <span
                className={`${styles.viewStatus} ${viewData.trangThaiDuyet ? styles.statusActive : styles.statusPending}`}
              >
                {viewData.trangThaiDuyet ? "Đã duyệt" : "Chờ duyệt"}
              </span>
            </div>
            <h2 className={styles.viewTitle}>{viewData.tieuDe}</h2>
            <div className={styles.viewStats}>
              <div className={styles.viewStat}>
                <ClockCircleOutlined />{" "}
                <span>{viewData.thoiGianLamBai} phút</span>
              </div>
              <div className={styles.viewStat}>
                <QuestionCircleOutlined />{" "}
                <span>{viewData.danhSachCauHoi?.length} câu</span>
              </div>
              <div className={styles.viewStat}>
                <PlayCircleOutlined /> <span>{viewData.soLuotThi} lượt</span>
              </div>
            </div>
            <div className={styles.viewDivider} />
            <div className={styles.viewCauHoiList}>
              {viewData.danhSachCauHoi?.map((cq, i) => (
                <div key={i} className={styles.viewCauHoi}>
                  <div className={styles.viewCauHoiNum}>Câu {i + 1}</div>
                  <div
                    className={styles.viewCauHoiND}
                    dangerouslySetInnerHTML={{ __html: cq.noiDungText }}
                  />
                  <div className={styles.viewDapAnList}>
                    {cq.cacDapAn?.map((da, j) => (
                      <div
                        key={j}
                        className={`${styles.viewDapAn} ${da.laDapAnDung ? styles.viewDapAnDung : ""}`}
                      >
                        <span className={styles.viewDapAnLetter}>
                          {DA_LETTERS[j] || j + 1}
                        </span>
                        <span>{da.noiDungDapAn}</span>
                        {da.laDapAnDung && (
                          <span className={styles.viewDapAnCheck}>
                            <CheckCircleOutlined />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {cq.giaiThich && (
                    <>
                      <div className={styles.viewGiaiThich}>
                        <span style={{ marginRight: "8px" }}>💡</span>
                        <span
                          dangerouslySetInnerHTML={{ __html: cq.giaiThich }}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
