import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Card,
  Avatar,
  Tooltip,
  message,
  Popconfirm,
  Row,
  Col,
  Upload,
  Drawer,
  Skeleton,
  Tag,
} from "antd";
import {
  Plus,
  RefreshCw,
  Users,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Hash,
  Camera,
  ChevronRight,
  Search,
  BookOpen,
  GraduationCap,
  Layers,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import styles from "./Classes.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getAllLopHoc,
  createLopHoc,
  updateLopHoc,
  deleteLopHoc,
  joinClassByCode,
  approveStudent,
} from "../../../services/apiLopHoc";
import { uploadAPI } from "../../../services/uploadAPI";
import { getPublicUrl, slugify } from "../../../utils/formatURL";

const COVER_FALLBACKS = [
  "https://images.unsplash.com/photo-1501504905953-f8313670f83e?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop",
];

const Classes = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joiningClass, setJoiningClass] = useState(null);
  const [studentListVisible, setStudentListVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [form] = Form.useForm();
  const [joinForm] = Form.useForm();
  const [drawerSearch, setDrawerSearch] = useState("");

  const isManagement = user?.role === "admin" || user?.role === "giaovien";

  useEffect(() => {
    if (token) fetchClasses();
  }, [token]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await getAllLopHoc({}, token);
      setClasses(res);
    } catch {
      message.error("Phiên làm việc hết hạn");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    form.setFieldsValue({ ma_lop_random: code });
    message.success("Đã tạo mã lớp mới!");
  };

  const handleUploadImage = async ({ file }) => {
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      setImageUrl(res.url || res.data.url);
      message.success("Tải ảnh thành công!");
    } catch {
      message.error("Lỗi tải ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = { ...values, anh_lop: imageUrl };
      if (editingClass) {
        await updateLopHoc(editingClass._id, payload, token);
        message.success("Cập nhật lớp thành công!");
      } else {
        await createLopHoc(payload, token);
        message.success("Tạo lớp thành công!");
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch (error) {
      message.error(error.message || "Thao tác thất bại");
    }
  };

  const handleJoinClass = async (values) => {
    try {
      await joinClassByCode(values, token);
      message.success("Đã gửi yêu cầu tham gia! Chờ giáo viên phê duyệt.");
      setIsJoinModalOpen(false);
      setJoiningClass(null);
      joinForm.resetFields();
      await fetchClasses();
    } catch (error) {
      message.error(error.message || "Mã lớp không hợp lệ");
    }
  };

  const openCreate = () => {
    setEditingClass(null);
    setImageUrl("");
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingClass(item);
    setImageUrl(item.anh_lop || "");
    setIsModalOpen(true);
    // Đợi Modal mount xong mới set values, tránh bị clear
    setTimeout(() => {
      form.setFieldsValue({
        ten_lop: item.ten_lop,
        ma_lop_random: item.ma_lop_random,
        si_so_toi_da: item.si_so_toi_da,
        mo_ta_lop: item.mo_ta_lop,
      });
    }, 0);
  };


  const filteredClasses = classes.filter((c) =>
    c.ten_lop?.toLowerCase().includes(searchKey.toLowerCase()),
  );

  const totalStudents = classes.reduce(
    (acc, c) => acc + (c.danh_sach_hoc_vien?.length || 0),
    0,
  );

  // Hàm xử lý phê duyệt hoặc từ chối học viên
  const handleApprove = async (studentId, status) => {
    try {
      const payload = {
        classId: selectedClass._id,
        studentId: studentId,
        status: status, // 'da_tham_gia' hoặc 'bi_tu_choi'
      };

      const res = await approveStudent(payload, token);
      message.success(res.message || "Thao tác thành công! ✨");

      // Cập nhật lại state selectedClass để giao diện Drawer thay đổi ngay
      const updatedMembers = selectedClass.danh_sach_hoc_vien.map((item) => {
        if (item.id_hoc_vien?._id === studentId) {
          return { ...item, trang_thai_phe_duyet: status };
        }
        return item;
      });

      setSelectedClass({
        ...selectedClass,
        danh_sach_hoc_vien: updatedMembers,
      });

      // Gọi lại danh sách tổng để các con số ở card bên ngoài cập nhật theo
      fetchClasses();
    } catch (error) {
      message.error(error.message || "Lỗi khi phê duyệt học viên");
    }
  };

  const xemTrangBaiGiang = (lop) => {
    const id = lop.maKey;
    const tenLop = lop.ten_lop;

    navigate(`/lop-hoc/bai-giang/${id}/${slugify(tenLop)}`);
  };

  return (
    <div className={styles.page}>
      {/* Subtle decorative mesh background */}
      <div className={styles.meshBg} aria-hidden />

      {/* ─── HEADER ─────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerEyebrow}>
            <GraduationCap size={14} />
            <span>Hệ thống đào tạo</span>
          </div>
          <h1 className={styles.headerTitle}>
            Lớp học <em>trực tuyến</em>
          </h1>
          <p className={styles.headerSub}>
            Quản lý và theo dõi tiến độ học tập thời gian thực
          </p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Tìm kiếm lớp học..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>
          <div className={styles.actionBtns}>
            {isManagement && (
              <button className={styles.btnPrimary} onClick={openCreate}>
                <Plus size={16} />
                <span>Tạo lớp học</span>
              </button>
            )}
            {user?.role === "hocsinh" && (
              <button
                className={styles.btnSecondary}
                onClick={() => setIsJoinModalOpen(true)}
              >
                <Hash size={16} />
                <span>Nhập mã lớp</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── STATS ROW ──────────────────────────── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ "--icon-color": "var(--accent-violet)" }}
          >
            <Layers size={18} />
          </div>
          <div>
            <div className={styles.statNum}>{classes.length}</div>
            <div className={styles.statLabel}>Lớp học</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ "--icon-color": "var(--accent-cyan)" }}
          >
            <Users size={18} />
          </div>
          <div>
            <div className={styles.statNum}>{totalStudents}</div>
            <div className={styles.statLabel}>Học viên</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ "--icon-color": "var(--accent-emerald)" }}
          >
            <TrendingUp size={18} />
          </div>
          <div>
            <div className={styles.statNum}>...</div>
            <div className={styles.statLabel}>Hoàn thành</div>
          </div>
        </div>
        {/* <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ "--icon-color": "var(--accent-amber)" }}
          >
            <BookOpen size={18} />
          </div>
          <div>
            <div className={styles.statNum}>
              {new Set(classes.map((c) => c.id_mon_hoc?._id)).size || 0}
            </div>
            <div className={styles.statLabel}>Môn học</div>
          </div>
        </div> */}
      </div>

      {/* ─── SECTION LABEL ──────────────────────── */}
      <div className={styles.sectionLabel}>
        <span>Tất cả lớp học</span>
        <div className={styles.sectionLine} />
        <span className={styles.sectionCount}>
          {filteredClasses.length} lớp
        </span>
      </div>

      {/* ─── GRID ───────────────────────────────── */}
      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen size={48} />
          <p>Không tìm thấy lớp học nào</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredClasses.map((item, idx) => {
            const studentCount =
              item.danh_sach_hoc_vien?.filter(
                (sv) => sv.trang_thai_phe_duyet === "da_tham_gia",
              ).length || 0;
            const pendingCount =
              item.danh_sach_hoc_vien?.filter(
                (sv) => sv.trang_thai_phe_duyet === "cho_phe_duyet",
              ).length || 0;
            const maxStudents = item.si_so_toi_da || 30;
            const fillPct = Math.min(
              100,
              Math.round((studentCount / maxStudents) * 100),
            );
            const isFull = fillPct >= 100;
            const cover =
              getPublicUrl(item.anh_lop) ||
              COVER_FALLBACKS[idx % COVER_FALLBACKS.length];

            // Kiểm tra học sinh đã được duyệt vào lớp chưa
            const myRecord = item.danh_sach_hoc_vien?.find(
              (sv) =>
                sv.id_hoc_vien?._id === user?._id ||
                sv.id_hoc_vien === user?._id,
            );
            const isJoined = myRecord?.trang_thai_phe_duyet === "da_tham_gia";
            const isPending =
              myRecord?.trang_thai_phe_duyet === "cho_phe_duyet";

            return (
              <div
                key={item._id}
                className={styles.classCard}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                {/* Cover image */}
                <div className={styles.cardCover}>
                  <img
                    src={cover}
                    alt={item.ten_lop}
                    className={styles.coverImg}
                  />
                  <div className={styles.coverOverlay} />
                  <div className={styles.coverTopRow}>
                    <span className={styles.subjectTag}>
                      {item.id_mon_hoc?.ten_mon_hoc || "Học phần"}
                    </span>
                    <span
                      className={`${styles.statusDot} ${isFull ? styles.statusFull : styles.statusOpen}`}
                      title={isFull ? "Đã đầy" : "Đang mở"}
                    />
                  </div>
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <h3
                    className={isManagement ? styles.cardTitle : ''}
                    onClick={() => isManagement && xemTrangBaiGiang(item)}
                    style={{ cursor: isManagement ? "pointer" : "default" }}
                    title={isManagement ? "Xem bài giảng của lớp" : ""}
                  >
                    {item.ten_lop}
                  </h3>

                  <div className={styles.teacherRow}>
                    <Avatar
                      size={26}
                      src={getPublicUrl(item.id_giaovien?.anh_dai_dien)}
                      className={styles.teacherAvatar}
                    >
                      {item.id_giaovien?.ho_ten?.[0]}
                    </Avatar>
                    <span className={styles.teacherName}>
                      {item.id_giaovien?.ho_ten || "Giáo viên"}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className={styles.progressSection}>
                    <div className={styles.progressMeta}>
                      <span className={styles.progressText}>
                        <Users size={13} /> {studentCount}/{maxStudents} học
                        viên
                      </span>
                      <span
                        className={`${styles.progressPct} ${isFull ? styles.progressFull : ""}`}
                      >
                        {fillPct}%
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${isFull ? styles.progressFillFull : ""}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    {isManagement && pendingCount > 0 && (
                      <div className={styles.pendingNotice}>
                        <RefreshCw size={11} />
                        <span>{pendingCount} đang chờ phê duyệt</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer actions */}
                <div className={styles.cardFooter}>
                  {isManagement ? (
                    <div className={styles.adminActions}>
                        <Tooltip title="Xem danh sách bài giảng của lớp">
                        <button
                          className={styles.iconBtn}
                          onClick={() => {
                            xemTrangBaiGiang(item);
                          }}
                        >
                          <BookOpen size={15} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Danh sách học viên">
                        <button
                          className={styles.iconBtn}
                          onClick={() => {
                            setSelectedClass(item);
                            setStudentListVisible(true);
                          }}
                        >
                          <Users size={15} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <button
                          className={styles.iconBtn}
                          onClick={() => openEdit(item)}
                        >
                          <Edit3 size={15} />
                        </button>
                      </Tooltip>
                      <Popconfirm
                        title="Xác nhận xóa lớp học này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={() =>
                          deleteLopHoc(item._id, token).then(fetchClasses)
                        }
                      >
                        <Tooltip title="Xóa lớp">
                          <button
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  ) : isJoined ? (
                    <button
                      className={styles.enterBtn}
                      onClick={() => xemTrangBaiGiang(item)}
                    >
                      <BookOpen size={15} />
                      Vào lớp ngay
                    </button>
                  ) : isPending ? (
                    <button className={styles.pendingBtn} disabled>
                      <RefreshCw size={14} />
                      Đang chờ duyệt
                    </button>
                  ) : (
                    <button
                      className={styles.joinBtn}
                      disabled={isFull}
                      onClick={() => {
                        setJoiningClass(item);
                        setIsJoinModalOpen(true);
                      }}
                    >
                      {isFull ? "Đã đầy chỗ" : "Yêu cầu tham gia"}
                      {!isFull && <ChevronRight size={15} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── DRAWER: DANH SÁCH HỌC VIÊN ─────── */}
      <Drawer
        title={
          <div className={styles.drawerTitle}>
            <Users size={18} />
            <span>Danh sách học viên</span>
          </div>
        }
        open={studentListVisible}
        onClose={() => {
          setStudentListVisible(false);
          setDrawerSearch("");
        }}
        width={window.innerWidth > 768 ? 460 : "100%"}
        className={styles.customDrawer}
      >
        <div className={styles.drawerMeta}>
          <span className={styles.drawerClassName}>
            {selectedClass?.ten_lop}
          </span>
          <span className={styles.drawerCount}>
            {selectedClass?.danh_sach_hoc_vien?.length || 0} học viên
          </span>
        </div>

        {/* Search */}
        <div className={styles.drawerSearchBox}>
          <Search size={14} className={styles.drawerSearchIcon} />
          <input
            className={styles.drawerSearchInput}
            placeholder="Tìm theo tên hoặc mã số..."
            value={drawerSearch}
            onChange={(e) => setDrawerSearch(e.target.value)}
          />
          {drawerSearch && (
            <button
              className={styles.drawerSearchClear}
              onClick={() => setDrawerSearch("")}
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.studentList}>
          {(() => {
            const filtered =
              selectedClass?.danh_sach_hoc_vien?.filter((sv) => {
                const name = sv.id_hoc_vien?.ho_ten?.toLowerCase() || "";
                const maso = sv.id_hoc_vien?.ma_so?.toLowerCase() || "";
                const q = drawerSearch.toLowerCase();
                return name.includes(q) || maso.includes(q);
              }) || [];

            if (filtered.length === 0)
              return (
                <div className={styles.drawerEmpty}>
                  <Users size={32} />
                  <p>
                    {drawerSearch
                      ? "Không tìm thấy học viên"
                      : "Chưa có học viên nào"}
                  </p>
                </div>
              );

            return filtered.map((sv, idx) => (
              <div key={idx} className={styles.studentItem}>
                <Avatar
                  size={42}
                  src={getPublicUrl(sv.id_hoc_vien?.anh_dai_dien)}
                  className={styles.studentAvatar}
                >
                  {sv.id_hoc_vien?.ho_ten?.[0]}
                </Avatar>
                <div className={styles.studentInfo}>
                  <div className={styles.studentName}>
                    {sv.id_hoc_vien?.ho_ten}
                  </div>
                  <div className={styles.studentMaso}>
                    {sv.id_hoc_vien?.ma_so}
                  </div>
                </div>

                {/* LOGIC NÚT PHÊ DUYỆT */}
                <div className={styles.studentActions}>
                  {sv.trang_thai_phe_duyet === "cho_phe_duyet" ? (
                    <Space size={8}>
                      <Tooltip title="Duyệt vào lớp">
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<CheckCircle size={16} />}
                          className={styles.btnApprove}
                          onClick={() =>
                            handleApprove(sv.id_hoc_vien?._id, "da_tham_gia")
                          }
                        />
                      </Tooltip>
                      <span
                        className={`${styles.approvalBadge} ${
                          sv.trang_thai_phe_duyet === "da_tham_gia"
                            ? styles.badgeApproved
                            : styles.badgeRejected
                        }`}
                      >
                        {sv.trang_thai_phe_duyet === "da_tham_gia"
                          ? "Đã duyệt"
                          : "Chờ duyệt"}
                      </span>
                    </Space>
                  ) : (
                    <span
                      className={`${styles.approvalBadge} ${
                        sv.trang_thai_phe_duyet === "da_tham_gia"
                          ? styles.badgeApproved
                          : styles.badgeRejected
                      }`}
                    >
                      {sv.trang_thai_phe_duyet === "da_tham_gia"
                        ? "Đã duyệt"
                        : "Bị từ chối"}
                    </span>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
      </Drawer>

      {/* ─── MODAL: TẠO / SỬA LỚP ────────────── */}
      <Modal
        maskClosable={false}
        title={
          <div className={styles.modalTitleRow}>
            <div className={styles.modalTitleIcon}>
              {editingClass ? <Edit3 size={16} /> : <Plus size={16} />}
            </div>
            <span>
              {editingClass ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={620}
        centered
        className={styles.customModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.modalForm}
        >
          {/* Upload ảnh bìa */}
          <div className={styles.uploadArea}>
            <Upload customRequest={handleUploadImage} showUploadList={false}>
              <div className={styles.dropZone}>
                {imageUrl ? (
                  <>
                    <img
                      src={getPublicUrl(imageUrl)}
                      alt="cover"
                      className={styles.previewImg}
                    />
                    <div className={styles.dropZoneOverlay}>
                      <Camera size={18} />
                      <span>Đổi ảnh bìa</span>
                    </div>
                  </>
                ) : (
                  <div className={styles.dropZonePlaceholder}>
                    <ImageIcon size={32} />
                    <p>Nhấn để tải ảnh bìa</p>
                  </div>
                )}
              </div>
            </Upload>
          </div>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="ten_lop"
                label="Tên lớp học"
                rules={[{ required: true, message: "Vui lòng nhập tên lớp" }]}
              >
                <Input placeholder="VD: Thiết kế UI/UX nâng cao" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ma_lop_random"
                label="Mã định danh"
                rules={[{ required: true, message: "Vui lòng nhập mã lớp" }]}
              >
                <Input
                  prefix={
                    <Hash size={14} style={{ color: "var(--text-muted)" }} />
                  }
                  suffix={
                    <Tooltip title="Tạo mã ngẫu nhiên">
                      <RefreshCw
                        size={14}
                        style={{
                          cursor: "pointer",
                          color: "var(--accent-violet)",
                        }}
                        onClick={handleRandomCode}
                      />
                    </Tooltip>
                  }
                  placeholder="ABC123"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="si_so_toi_da" label="Giới hạn học viên">
                <InputNumber
                  min={1}
                  max={1000}
                  placeholder="30"
                  size="large"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="mo_ta_lop" label="Mô tả lớp học">
                <Input.TextArea
                  rows={3}
                  placeholder="Nội dung chính của lớp học..."
                />
              </Form.Item>
            </Col>
          </Row>

          <button type="submit" className={styles.submitBtn}>
            {editingClass ? "Lưu thay đổi" : "Tạo lớp học"}
          </button>
        </Form>
      </Modal>

      {/* ─── MODAL: NHẬP MÃ THAM GIA ─────────── */}
      <Modal
        title={
          <div className={styles.modalTitleRow}>
            <div className={styles.modalTitleIcon}>
              <Hash size={16} />
            </div>
            <span>Tham gia lớp học</span>
          </div>
        }
        open={isJoinModalOpen}
        onCancel={() => {
          setIsJoinModalOpen(false);
          setJoiningClass(null);
          joinForm.resetFields();
        }}
        footer={null}
        centered
        width={400}
        className={styles.customModal}
      >
        <Form form={joinForm} layout="vertical" onFinish={handleJoinClass}>
          {joiningClass && (
            <div className={styles.joiningClassInfo}>
              <div className={styles.joiningClassLabel}>Lớp muốn tham gia</div>
              <div className={styles.joiningClassName}>
                {joiningClass.ten_lop}
              </div>
              {joiningClass.id_giaovien?.ho_ten && (
                <div className={styles.joiningTeacher}>
                  GV: {joiningClass.id_giaovien.ho_ten}
                </div>
              )}
            </div>
          )}
          <p className={styles.joinModalDesc}>
            Nhập mã 6 ký tự do giáo viên cung cấp để gửi yêu cầu tham gia lớp.
          </p>
          <Form.Item
            name="ma_lop_random"
            rules={[
              { required: true, message: "Vui lòng nhập mã lớp" },
              { len: 6, message: "Mã lớp gồm đúng 6 ký tự" },
            ]}
          >
            <Input
              className={styles.codeInput}
              placeholder="A B C X Y Z"
              maxLength={6}
              size="large"
              style={{
                textAlign: "center",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                fontWeight: 700,
                fontSize: "1.25rem",
              }}
            />
          </Form.Item>
          <button type="submit" className={styles.submitBtn}>
            Gửi yêu cầu tham gia
          </button>
        </Form>
      </Modal>
    </div>
  );
};

export default Classes;
