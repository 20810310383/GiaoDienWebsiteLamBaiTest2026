import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Avatar,
  Space,
  Typography,
  Card,
  Input,
  Pagination,
  Spin,
  message,
  Tooltip,
  Button,
  Image,
  Modal,
} from "antd";
import {
  Search,
  User,
  BookOpen,
  Clock,
  Calendar,
  ChevronRight,
  FileText,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import dayjs from "dayjs";
import styles from "./LichSuHocVienThi.module.css";
import {
  getHistoryDetail,
  getStudentHistory,
} from "../../../../services/lichSuThiService";
import { useAuth } from "../../../../contexts/AuthContext";
import { getPublicUrl } from "../../../../utils/formatURL";

const { Title, Text } = Typography;

const LichSuHocVienThi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const { token } = useAuth();

  // States cho Modal chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchHistory = async (p = 1, search = "") => {
    setLoading(true);
    try {
      const res = await getStudentHistory(
        { page: p, limit: 10, search },
        token,
      );
      if (res.success) {
        setData(res.data);
        setTotal(res.totalRecords);
      }
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu học viên");
    } finally {
      setLoading(false);
    }
  };

  // Effect xử lý Debounce Tìm kiếm
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); // Reset về trang 1 khi tìm kiếm mới
      fetchHistory(1, searchText);
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  useEffect(() => {
    if (page !== 1 || searchText === "") {
      // Tránh gọi trùng lặp với effect trên
      fetchHistory(page, searchText);
    }
  }, [page]);

  const columns = [
    {
      title: "Học viên",
      dataIndex: "nguoiThi",
      key: "nguoiThi",
      width: 250,
      render: (user) => (
        <div className={styles.userInfo}>
          <Avatar
            src={getPublicUrl(user?.avatar)}
            icon={<User size={16} />}
            className={styles.avatar}
          />
          <div className={styles.userMeta}>
            <Text strong className={styles.userName}>
              {user?.hoTen || "Học viên ẩn danh"}
            </Text>
            <Text className={styles.userEmail}>{user?.email}</Text> <br />
            <Text className={styles.userEmail}>{user?.soDienThoai}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Đề thi",
      dataIndex: "deThiGoc",
      key: "deThiGoc",
      render: (quiz, record) => (
        <Space className={styles.userInfo}>
          <Image
            src={getPublicUrl(quiz?.anhDaiDien)}
            fallback="https://via.placeholder.com/50?text=No+Image" // Ảnh thay thế nếu lỗi
            className={styles.avatar}
            preview={false} // Tắt chế độ nhấn vào xem ảnh to nếu không cần
          />
          <div className={styles.userMeta}>
            <Text strong className={styles.userName}>
              {record.tieuDeSnapshot}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Kết quả",
      dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
      render: (res) => (
        <div className={styles.scoreContainer}>
          <div
            className={`${styles.scorePill} ${res.diemSo >= 5 ? styles.pass : styles.fail}`}
          >
            {res.diemSo}/10
          </div>
          <Text className={styles.correctRatio}>
            Đúng {res.soCauDung}/{res.tongSoCau} câu
          </Text>
        </div>
      ),
    },
    {
      title: "Thời gian làm",
      dataIndex: ["ketQua", "thoiGianHoanThanh"],
      key: "thoiGian",
      render: (seconds) => (
        <Space className={styles.timeInfo}>
          <Clock size={14} />
          <span>
            {Math.floor(seconds / 60)}p {seconds % 60}s
          </span>
        </Space>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Space className={styles.dateInfo}>
          <Calendar size={14} />
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </Space>
      ),
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết bài làm">
          <Button
            type="text"
            icon={<ChevronRight size={20} />}
            className={styles.actionBtn}
            onClick={() => handleShowDetail(record._id)}
          />
        </Tooltip>
      ),
    },
  ];

  const handleShowDetail = async (id) => {
    setIsModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getHistoryDetail(id, token);
      if (res.success) {
        setSelectedExam(res.data);
      }
    } catch (error) {
      message.error("Không thể lấy chi tiết bài thi");
      setIsModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}p ${secs}s`;
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.mainContent}>
        <div className={styles.pageBody}>
          <div className={styles.headerBox}>
            <div className={styles.headerLeft}>
              <Title level={2} className={styles.pageTitle}>
                Kết quả học viên
              </Title>
              <Text className={styles.pageSubtitle}>
                Theo dõi và quản lý điểm số của các học viên đã tham gia đề thi
                của bạn
              </Text>
            </div>
            <Input
              prefix={<Search size={18} className={styles.searchIcon} />}
              placeholder="Tìm tên học viên, email hoặc đề thi..."
              className={styles.searchBar}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear // Cho phép xóa nhanh nội dung tìm kiếm
            />
          </div>

          <Card className={styles.tableCard} bordered={false}>
            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              rowKey="_id"
              pagination={false}
              className={styles.customTable}
            />

            <div className={styles.footerTable}>
              <Text type="secondary" style={{ color: "white" }}>
                Hiển thị {data.length} trên tổng số {total} bản ghi
              </Text>
              <Pagination
                current={page}
                total={total}
                onChange={(p) => setPage(p)}
                pageSize={10}
                showSizeChanger={false}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL CHI TIẾT BÀI LÀM */}
      <Modal
        title={
          <div className={styles.modalHeaderCustom}>
            <div className={styles.modalTitleIcon}>
              <FileText size={20} />
            </div>
            <div>
              <div className={styles.modalMainTitle}>
                Chi tiết bài làm học viên
              </div>
              <div className={styles.modalSubTitle}>
                {selectedExam?.tieuDeSnapshot}
              </div>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            size="large"
            className={styles.closeBtn}
            onClick={() => setIsModalOpen(false)}
          >
            Đóng cửa sổ
          </Button>,
        ]}
        width={950}
        centered
        className={styles.detailModal}
      >
        {detailLoading ? (
          <div className={styles.modalLoader}>
            <Spin size="large" tip="Đang tải bài làm..." />
          </div>
        ) : selectedExam ? (
          <div className={styles.modalWrapper}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.sumLabel}>Điểm số</span>
                <span className={`${styles.sumValue} ${styles.scoreColor}`}>
                  {selectedExam.ketQua.diemSo}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.sumLabel}>Đúng / Tổng</span>
                <span className={styles.sumValue}>
                  {selectedExam.ketQua.soCauDung} /{" "}
                  {selectedExam.ketQua.tongSoCau}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.sumLabel}>Thời gian</span>
                <span className={styles.sumValue}>
                  {formatDuration(selectedExam.ketQua.thoiGianHoanThanh)}
                </span>
              </div>
            </div>

            <div className={styles.reviewScrollArea}>
              {selectedExam.duLieuCauHoiSnapshot.map((question, qIdx) => {
                const userResponse = selectedExam.traLoiCuaUser.find(
                  (u) => u.cauHoiId === question._id,
                );
                const selectedIdxs = userResponse?.dapAnDaChon || [];
                const correctIdxs = question.cacDapAn
                  .map((a, i) => (a.laDapAnDung ? i : null))
                  .filter((i) => i !== null);
                const isUserCorrect =
                  selectedIdxs.length === correctIdxs.length &&
                  selectedIdxs.every((val) => correctIdxs.includes(val));

                return (
                  <div
                    key={qIdx}
                    className={`${styles.reviewCard} ${isUserCorrect ? styles.borderSuccess : styles.borderError}`}
                  >
                    <div className={styles.qTopRow}>
                      <span
                        className={`${styles.qBadge} ${isUserCorrect ? styles.bgSuccess : styles.bgError}`}
                      >
                        Câu {qIdx + 1}
                      </span>
                      <span
                        className={
                          isUserCorrect ? styles.txtSuccess : styles.txtError
                        }
                      >
                        {isUserCorrect ? "Chính xác" : "Chưa chính xác"}
                      </span>
                    </div>
                    <div
                      className={styles.questionText}
                      dangerouslySetInnerHTML={{ __html: question.noiDungText }}
                    />
                    <div className={styles.ansGrid}>
                      {question.cacDapAn.map((ans, aIdx) => {
                        const isCorrect = ans.laDapAnDung;
                        const isSelected = selectedIdxs.includes(aIdx);
                        let ansStateClass = "";
                        if (isSelected && isCorrect)
                          ansStateClass = styles.ansSelectedCorrect;
                        else if (isSelected && !isCorrect)
                          ansStateClass = styles.ansSelectedWrong;
                        else if (!isSelected && isCorrect)
                          ansStateClass = styles.ansShowCorrect;

                        return (
                          <div
                            key={aIdx}
                            className={`${styles.ansItem} ${ansStateClass}`}
                          >
                            <div className={styles.ansCheckArea}>
                              <span className={styles.ansLetter}>
                                {String.fromCharCode(65 + aIdx)}
                              </span>
                            </div>
                            <div
                              className={styles.ansContent}
                              dangerouslySetInnerHTML={{
                                __html: ans.noiDungDapAn,
                              }}
                            />
                            <div className={styles.ansIconStatus}>
                              {isSelected && isCorrect && (
                                <CheckCircle2 size={18} color="#10b981" />
                              )}
                              {isSelected && !isCorrect && (
                                <XCircle size={18} color="#ef4444" />
                              )}
                              {!isSelected && isCorrect && (
                                <CheckCircle2
                                  size={18}
                                  color="#10b981"
                                  style={{ opacity: 0.6 }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {question.giaiThich && (
                      <div className={styles.explanationBox}>
                        <div className={styles.exTitle}>
                          <Info size={16} /> Giải thích đáp án
                        </div>
                        <div
                          className={styles.exContent}
                          dangerouslySetInnerHTML={{
                            __html: question.giaiThich,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default LichSuHocVienThi;
