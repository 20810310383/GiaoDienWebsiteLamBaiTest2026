import React, { useState, useEffect } from "react";
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
    pageSize: 10,
    total: 0,
  });

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterLop, setFilterLop] = useState(null);
  const [filterBaiGiang, setFilterBaiGiang] = useState(null);
  const [danhSachLop, setDanhSachLop] = useState([]);
  const [danhSachBaiGiang, setDanhSachBaiGiang] = useState([]);

  // Modal chi tiết
  const [chiTietModal, setChiTietModal] = useState({ open: false, data: null, loading: false });

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
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: "ngay_lam_bai",
        sortOrder: "desc",
      };

      if (searchText) params.search = searchText;
      if (filterLop) params.lop_hoc_id = filterLop;
      if (filterBaiGiang) params.bai_giang_id = filterBaiGiang;

      const res = await getDanhSach(params, token);

      if (res.success) {
        setData(res.data.items);
        setPagination((prev) => ({
          ...prev,
          total: res.data.pagination.total,
        }));
      }
    } catch (error) {
      console.error("Lỗi fetch data:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

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
                option.children.props.children[1]
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
              Hiển thị <strong>{data.length}</strong> / <strong>{pagination.total}</strong> kết quả
            </span>
          </div>
        </div>
      </Card>

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
              {data.map((record) => (
                <Col key={record._id} xs={24} sm={12} lg={8} xl={6}>
                  <div className={styles.historyCard}>
                    {/* Card Header */}
                    <div className={styles.cardHeader}>
                      <div className={styles.cardUser}>
                        <Avatar
                          src={record.id_hoc_sinh?.anh_dai_dien ? getPublicUrl(record.id_hoc_sinh.anh_dai_dien) : null}
                          size={44}
                          style={{ backgroundColor: "#1890ff" }}
                        >
                          {record.id_hoc_sinh?.ho_ten?.charAt(0)}
                        </Avatar>
                        <div className={styles.cardUserInfo}>
                          <span className={styles.cardUserName}>
                            {record.id_hoc_sinh?.ho_ten || "N/A"}
                          </span>
                          <span className={styles.cardUserCode}>
                            {record.id_hoc_sinh?.ma_so || "N/A"}
                          </span>
                          <span className={styles.cardUserCode}>
                            {record.id_hoc_sinh?.ten_lop_sinh_hoat || "N/A"}
                          </span>
                        </div>
                      </div>
                      {renderDiem(record.diem)}
                    </div>

                    {/* Card Body */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardInfoItem}>
                        <span className={styles.cardLabel}>Bài giảng</span>
                        <span className={styles.cardValue}>
                          {record.id_bai_giang?.ten_bai_giang || "N/A"}
                        </span>
                      </div>
                      <div className={styles.cardInfoItem}>
                        <span className={styles.cardLabel}>Lớp học</span>
                        <span className={styles.cardValue}>
                          {record.id_lop_hoc?.ten_lop || "-"}
                        </span>
                      </div>
                      <div className={styles.cardInfoItem}>
                        <span className={styles.cardLabel}>Lần thi</span>
                        <span className={styles.cardValue}>Lần {record.lan_thi}</span>
                      </div>
                      <div className={styles.cardInfoItem}>
                        <span className={styles.cardLabel}>Kết quả</span>
                        <span className={styles.cardValue}>
                          <CheckCircle size={14} style={{ color: "#52c41a", marginRight: 4 }} />
                          {record.so_cau_dung}/{record.tong_so_cau} câu đúng
                        </span>
                      </div>
                      <div className={styles.cardInfoItem}>
                        <span className={styles.cardLabel}>Thời gian</span>
                        <span className={styles.cardValue}>
                          <Clock size={14} style={{ marginRight: 4, color: "#666" }} />
                          {formatThoiGian(record.thoi_gian_lam_bai)}
                        </span>
                      </div>
                      <div className={styles.cardInfoItem}>
                        <span className={styles.cardLabel}>Ngày thi</span>
                        <span className={styles.cardValue}>
                          {record.ngay_lam_bai ? new Date(record.ngay_lam_bai).toLocaleDateString("vi-VN") : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className={styles.cardFooter}>
                      {renderTrangThai(record.trang_thai)}
                      <Button
                        type="primary"
                        size="small"
                        icon={<Eye size={14} />}
                        onClick={() => handleXemChiTiet(record)}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {pagination.total > pagination.pageSize && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={(page, pageSize) => {
                    setPagination({ ...pagination, current: page, pageSize });
                  }}
                  showSizeChanger
                  pageSizeOptions={["8", "12", "24", "48"]}
                  showTotal={(total) => `Tổng ${total} bài thi`}
                />
              </div>
            )}
          </>
        )}
      </div>

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
