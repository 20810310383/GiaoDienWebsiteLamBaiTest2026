import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Select,
  Input,
  Button,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Card,
  Spin,
  Empty,
} from "antd";
import {
  Search,
  RefreshCw,
  Eye,
  TrendingUp,
  Users,
  FileText,
  Award,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
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

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
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
      da_xem_dap_an: { color: "green", text: "Đã xem đáp án", icon: <Eye size={12} /> },
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

  // Columns
  const columns = [
    {
      title: "Học viên",
      key: "hoc_sinh",
      width: 200,
      fixed: "left",
      render: (_, record) => {
        const hs = record.id_hoc_sinh;
        return (
          <div className={styles.hocVienCell}>
            <Avatar
              src={hs?.anh_dai_dien ? getPublicUrl(hs.anh_dai_dien) : null}
              size={36}
              style={{ backgroundColor: "#1890ff" }}
            >
              {hs?.ho_ten?.charAt(0)}
            </Avatar>
            <div className={styles.hocVienInfo}>
              <span className={styles.hoTen}>{hs?.ho_ten || "N/A"}</span>
              <span className={styles.maSo}>{hs?.ma_so || "N/A"}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Lớp học",
      key: "lop_hoc",
      width: 150,
      render: (_, record) => record.id_lop_hoc?.ten_lop || "-",
      filteredValue: filterLop ? [filterLop] : null,
    },
    {
      title: "Bài giảng",
      key: "bai_giang",
      width: 180,
      render: (_, record) => (
        <Tooltip title={record.id_bai_giang?.ten_bai_giang}>
          <span className={styles.baiGiangText}>
            {record.id_bai_giang?.ten_bai_giang || "N/A"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Lần thi",
      dataIndex: "lan_thi",
      key: "lan_thi",
      width: 80,
      align: "center",
      render: (lan) => <Tag color="purple">Lần {lan}</Tag>,
    },
    {
      title: "Kết quả",
      key: "ket_qua",
      width: 200,
      render: (_, record) => (
        <div className={styles.ketQuaCell}>
          <div className={styles.diemRow}>
            <span className={styles.label}>Điểm:</span>
            {renderDiem(record.diem)}
          </div>
          <div className={styles.soCauRow}>
            <CheckCircle size={12} style={{ color: "#52c41a" }} />
            <span>{record.so_cau_dung}/{record.tong_so_cau} câu đúng</span>
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "thoi_gian",
      width: 120,
      render: (_, record) => (
        <Tooltip title={`Nộp lúc: ${formatNgay(record.ngay_lam_bai)}`}>
          <div className={styles.thoiGianCell}>
            <Clock size={14} />
            <span>{formatThoiGian(record.thoi_gian_lam_bai)}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      width: 140,
      render: renderTrangThai,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<Eye size={14} />}
              onClick={() => handleXemChiTiet(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

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
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm tên, MSSV, email học viên..."
              prefix={<Search size={16} />}
              allowClear
              onChange={handleSearchChange}
              onPressEnter={(e) => handleSearch(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
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
          </Col>
          <Col xs={12} sm={6} md={5}>
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
          </Col>
          <Col xs={24} sm={6} md={7}>
            <div className={styles.filterInfo}>
              <span>
                Hiển thị <strong>{data.length}</strong> / <strong>{pagination.total}</strong> kết quả
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Bảng dữ liệu */}
      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bài thi`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có dữ liệu lịch sử thi"
              />
            ),
          }}
        />
      </Card>

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
