import React, { useState, useEffect, useRef } from "react";
import {
  Select,
  Input,
  Button,
  Tag,
  Avatar,
  message,
  Row,
  Col,
  Statistic,
  Card,
  Spin,
  Empty,
  Pagination,
  Drawer,
} from "antd";
import {
  Search,
  RefreshCw,
  Eye,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";
import styles from "./LichSuThi.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { getPublicUrl } from "../../../utils/formatURL";
import ChiTietBaiThiModal from "./ChiTietBaiThiModal";
import {
  getDanhSachLop,
  getDanhSachBaiGiang,
  getThongKe,
  getDanhSach,
  getChiTietBaiThi,
} from "../../../services/apiLichSuThi";

const { Option } = Select;

const LichSuThi = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const requestId = useRef(0);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterLop, setFilterLop] = useState(null);
  const [filterBaiGiang, setFilterBaiGiang] = useState(null);
  const [danhSachLop, setDanhSachLop] = useState([]);
  const [danhSachBaiGiang, setDanhSachBaiGiang] = useState([]);

  // Modal chi tiết
  const [chiTietModal, setChiTietModal] = useState({ open: false, data: null, loading: false });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptPage, setAttemptPage] = useState(1);
  const [attemptTotal, setAttemptTotal] = useState(0);
  const [attemptLoading, setAttemptLoading] = useState(false);

  // Thống kê
  const [thongKe, setThongKe] = useState(null);
  const [thongKeLoading, setThongKeLoading] = useState(false);

  // Fetch filters
  useEffect(() => {
    if (token) {
      fetchFilters();
      fetchThongKe();
    }
  }, [token]);

  // Fetch data khi filter thay đổi
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, pagination.current, pagination.pageSize, filterLop, filterBaiGiang, searchText]);

  const fetchFilters = async () => {
    try {
      const [lopRes, baiGiangRes] = await Promise.all([
        getDanhSachLop({}, token),
        getDanhSachBaiGiang({}, token),
      ]);

      if (lopRes.success) setDanhSachLop(lopRes.data);
      if (baiGiangRes.success) setDanhSachBaiGiang(baiGiangRes.data);
    } catch (error) {
      console.error("Lỗi fetch filters:", error);
    }
  };

  const fetchThongKe = async () => {
    setThongKeLoading(true);
    try {
      const res = await getThongKe(token);
      if (res.success) setThongKe(res.data);
    } catch (error) {
      console.error("Lỗi fetch thống kê:", error);
    } finally {
      setThongKeLoading(false);
    }
  };

  const fetchData = async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: "ngay_lam_bai",
        sortOrder: "desc",
        group_by: "student",
      };

      if (searchText) params.search = searchText;
      if (filterLop) params.lop_hoc_id = filterLop;
      if (filterBaiGiang) params.bai_giang_id = filterBaiGiang;

      const res = await getDanhSach(params, token);

      if (currentRequest !== requestId.current) return;
      if (res.success) {
        const lastPage = Math.max(1, Math.ceil(res.data.pagination.total / pagination.pageSize));
        if (pagination.current > lastPage) {
          setPagination(prev => ({ ...prev, current: lastPage, total: res.data.pagination.total }));
          return;
        }
        setData(res.data.items);
        setPagination((prev) => ({
          ...prev,
          total: res.data.pagination.total,
        }));
      }
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      console.error("Lỗi fetch data:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedStudent?.studentId) return;
    let active = true;
    setAttemptLoading(true);
    const params = { page: attemptPage, limit: 10, hoc_sinh_id: selectedStudent.studentId, sortBy: 'ngay_lam_bai', sortOrder: 'desc' };
    if (filterLop) params.lop_hoc_id = filterLop;
    if (filterBaiGiang) params.bai_giang_id = filterBaiGiang;
    if (searchText) params.search = searchText;
    getDanhSach(params, token).then(res => {
      if (active && res.success) { setAttempts(res.data.items); setAttemptTotal(res.data.pagination.total); }
    }).catch(() => { if (active) message.error('Không thể tải các lần thi'); })
      .finally(() => { if (active) setAttemptLoading(false); });
    return () => { active = false; };
  }, [selectedStudent, attemptPage, filterLop, filterBaiGiang, searchText, token]);

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleXemChiTiet = async (record) => {
    setChiTietModal({ open: true, data: null, loading: true });
    try {
      const res = await getChiTietBaiThi(record._id, token);
      if (res.success) {
        setChiTietModal({ open: true, data: res.data, loading: false });
      }
    } catch (error) {
      message.error("Không thể tải chi tiết bài thi");
      setChiTietModal({ open: false, data: null, loading: false });
    }
  };

  const handleRefresh = () => {
    fetchData();
    fetchThongKe();
    message.success("Đã làm mới dữ liệu");
  };

  // Helper render điểm
  const renderDiem = (diem) => {
    let color = "#52c41a";
    if (diem < 5) color = "#ff4d4f";
    else if (diem < 7) color = "#faad14";
    else if (diem < 8.5) color = "#1890ff";

    return (
      <Tag color={color} style={{ fontWeight: 600, fontSize: 13 }}>
        {diem.toFixed(1)}
      </Tag>
    );
  };

  // Helper render trạng thái
  const renderTrangThai = (trang_thai) => {
    const config = {
      da_nop_bai: { color: "blue", text: "Đã nộp", icon: <FileText size={12} /> },
      // da_xem_dap_an: { color: "green", text: "Đã xem đáp án", icon: <Eye size={12} /> },
      dang_lam: { color: "orange", text: "Đang làm", icon: <Clock size={12} /> },
    };
    const c = config[trang_thai] || config.da_nop_bai;
    return (
      <Tag color={c.color} icon={c.icon}>
        {c.text}
      </Tag>
    );
  };

  // Format thời gian
  const formatThoiGian = (giay) => {
    if (!giay) return "-";
    const phut = Math.floor(giay / 60);
    const giayLe = giay % 60;
    return `${phut}p ${giayLe}s`;
  };

  // Format ngày
  const formatNgay = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Search handler với debounce
  const [searchTimeout, setSearchTimeout] = useState(null);
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        handleSearch(value);
      }, 500)
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}><BarChart3 size={14} /> TỔNG QUAN HỌC TẬP</span>
          <h1 className={styles.title}>Lịch sử thi</h1>
          <p className={styles.subtitle}>
            Xem lịch sử làm bài thi của học viên
          </p>
        </div>
        <Button icon={<RefreshCw size={16} />} onClick={handleRefresh}>
          Làm mới
        </Button>
      </div>

      {/* Thống kê */}
      <Spin spinning={thongKeLoading}>
        <Row gutter={[16, 16]} className={styles.statsRow}>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card size="small" className={styles.statCard}>
              <Statistic
                title="Tổng bài thi"
                value={thongKe?.tongBaiThi || 0}
                prefix={<FileText size={18} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card size="small" className={styles.statCard}>
              <Statistic
                title="Học viên đã thi"
                value={thongKe?.tongHocVien || 0}
                prefix={<Users size={18} />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card size="small" className={styles.statCard}>
              <Statistic
                title="Điểm TB"
                value={thongKe?.diemTrungBinh?.toFixed(1) || 0}
                prefix={<BarChart3 size={18} />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card size="small" className={styles.statCard}>
              <Statistic
                title="Điểm cao nhất"
                value={thongKe?.diemCaoNhat || 0}
                prefix={<TrendingUp size={18} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card size="small" className={styles.statCard}>
              <Statistic
                title="Điểm thấp nhất"
                value={thongKe?.diemThapNhat || 0}
                prefix={<AlertCircle size={18} />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Bộ lọc */}
      <Card size="small" className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.filterItemSearch}>
            <Input
              placeholder="Tìm tên, MSSV, email học viên..."
              prefix={<Search size={16} />}
              allowClear
              onChange={handleSearchChange}
              onPressEnter={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterItem}>
            <Select
              placeholder="Lọc theo lớp"
              allowClear
              style={{ width: "100%" }}
              value={filterLop}
              onChange={(val) => {
                setFilterLop(val);
                setPagination((p) => ({ ...p, current: 1 }));
              }}
            >
              {danhSachLop.map((lop) => (
                <Option key={lop._id} value={lop._id}>
                  {lop.ten_lop}
                </Option>
              ))}
            </Select>
          </div>
          <div className={styles.filterItem}>
            <Select
              placeholder="Lọc theo bài giảng"
              allowClear
              style={{ width: "100%" }}
              value={filterBaiGiang}
              onChange={(val) => {
                setFilterBaiGiang(val);
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              showSearch
              filterOption={(input, option) =>
                String(option.children)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {danhSachBaiGiang.map((bg) => (
                <Option key={bg._id} value={bg._id}>
                  {bg.ten_bai_giang}
                </Option>
              ))}
            </Select>
          </div>
          <div className={styles.filterInfo}>
            <span>
              Hiển thị <strong>{data.length}</strong> / <strong>{pagination.total}</strong> học viên
            </span>
          </div>
        </div>
      </Card>

      <div className={styles.sectionHeading}>
        <div><h2>Danh sách học viên</h2><p>Chọn học viên để xem chi tiết các lần thi</p></div>
        <span>{pagination.total} học viên</span>
      </div>
      {/* Card Grid View */}
      <div className={styles.cardGrid}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có dữ liệu lịch sử thi"
          />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {data.map((group) => (
                <Col key={group.studentId || group.latest} xs={24} sm={12} lg={8} xl={6}>
                  <button type="button" className={styles.studentCard} onClick={() => { setAttempts([]); setAttemptPage(1); setSelectedStudent(group); }} disabled={!group.studentId}>
                    <div className={styles.studentTop}>
                      <Avatar size={52} src={group.student?.anh_dai_dien ? getPublicUrl(group.student.anh_dai_dien) : null} className={styles.studentAvatar}>{group.student?.ho_ten?.charAt(0) || '?'}</Avatar>
                      <div className={styles.studentIdentity}><strong>{group.student?.ho_ten || 'Học viên không còn tồn tại'}</strong><span>{group.student?.ma_so || 'Chưa có mã học viên'}</span></div>
                      <span className={styles.attemptBadge}>{group.count} lần thi</span>
                    </div>
                    <div className={styles.studentMetrics}>
                      <div><span>Điểm trung bình</span><strong>{group.average.toFixed(1)}<small> / 10</small></strong></div>
                      <div><span>Điểm cao nhất</span><strong>{group.best.toFixed(1)}<small> / 10</small></strong></div>
                    </div>
                    <div className={styles.studentBottom}><span><Clock size={15} /> Gần nhất: {formatNgay(group.latest)}</span><span>Xem lịch sử <span aria-hidden="true">→</span></span></div>
                  </button>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={(page, pageSize) => {
                    setPagination(prev => ({ ...prev, current: pageSize !== prev.pageSize ? 1 : page, pageSize }));
                  }}
                  showSizeChanger
                  pageSizeOptions={["8", "12", "24", "48"]}
                  showTotal={(total, range) => `${range[0]}–${range[1]} trong ${total} học viên`}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Drawer title={selectedStudent?.student?.ho_ten || 'Lịch sử thi'} open={!!selectedStudent} onClose={() => setSelectedStudent(null)} width={640} className={styles.historyDrawer}>
        <div className={styles.drawerIntro}><span>{selectedStudent?.student?.ma_so || 'Học viên'}</span><strong>{attemptTotal} lần thi phù hợp</strong></div>
        <Spin spinning={attemptLoading}>
          <div className={styles.attemptList}>
            {!attemptLoading && attempts.length === 0 && <Empty description="Không có lần thi phù hợp" />}
            {attempts.map(record => <article className={styles.attemptCard} key={record._id}>
              <div className={styles.attemptHeading}><div><span className={styles.attemptClass}>{record.id_lop_hoc?.ten_lop || 'Lớp học'}</span><h3>{record.id_bai_giang?.ten_bai_giang || 'Bài giảng'}</h3></div>{renderDiem(Number(record.diem) || 0)}</div>
              <div className={styles.attemptMeta}><span>Lần {record.lan_thi}</span><span><CheckCircle size={14} /> {record.so_cau_dung}/{record.tong_so_cau} câu đúng</span><span><Clock size={14} /> {formatThoiGian(record.thoi_gian_lam_bai)}</span><span>{formatNgay(record.ngay_lam_bai)}</span></div>
              <div className={styles.attemptFooter}>{renderTrangThai(record.trang_thai)}<Button type="primary" icon={<Eye size={14} />} onClick={() => handleXemChiTiet(record)}>Xem chi tiết</Button></div>
            </article>)}
          </div>
        </Spin>
        {attemptTotal > 10 && <Pagination className={styles.drawerPagination} current={attemptPage} pageSize={10} total={attemptTotal} showSizeChanger={false} onChange={setAttemptPage} />}
      </Drawer>

      {/* Modal chi tiết */}
      <ChiTietBaiThiModal
        open={chiTietModal.open}
        data={chiTietModal.data}
        loading={chiTietModal.loading}
        onClose={() => setChiTietModal({ open: false, data: null, loading: false })}
      />
    </div>
  );
};

export default LichSuThi;
