import React, { useEffect, useState } from "react";
import {
  Tag,
  Button,
  Card,
  Typography,
  Pagination,
  Empty,
  Spin,
  message,
  Modal,
  Avatar,
} from "antd";
import {
  Calendar,
  Clock,
  Award,
  Eye,
  Info,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

import dayjs from "dayjs";
import styles from "./LichSuCaNhanThi.module.css";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  getMyHistory,
  getHistoryDetail,
} from "../../../../services/lichSuThiService";
import { getPublicUrl } from "../../../../utils/formatURL";

const { Title, Text } = Typography;

const LichSuCaNhanThi = () => {
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { token } = useAuth();

  // State cho Modal chi tiết bài làm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchHistory = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await getMyHistory({ page, limit }, token);
      if (res.success) {
        setHistoryData(res.data);
        setPagination({
          current: res.currentPage,
          pageSize: limit,
          total: res.totalRecords,
        });
      }
    } catch (error) {
      message.error("Không thể tải lịch sử thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleShowDetail = async (id) => {
    setIsModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getHistoryDetail(id, token);
      console.log("res: ", res);

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
          <div className={styles.headerSection}>
            <div>
              <Title level={2} className={styles.mainTitle}>
                Lịch sử thi cá nhân
              </Title>
              <Text className={styles.subTitle}>
                Xem lại kết quả và quá trình ôn luyện của bạn
              </Text>
            </div>
            <div className={styles.statsOverview}>
              <div className={styles.statCard}>
                <Award size={20} color="var(--accent)" />
                <span>
                  Tổng bài thi: <b>{pagination.total}</b>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.historyList}>
            {loading ? (
              <div className={styles.loaderBox}>
                <Spin size="large" />
              </div>
            ) : historyData.length > 0 ? (
              <>
                <div className={styles.gridHistory}>
                  {historyData.map((item) => (
                    <Card
                      key={item._id}
                      className={styles.itemCard}
                      bordered={false}
                    >
                      <div className={styles.itemHeader}>
                        <Tag
                          color={
                            item.cheDoThi === "thi_that" ? "volcano" : "cyan"
                          }
                        >
                          {item.cheDoThi === "thi_that"
                            ? "THI THẬT"
                            : "ÔN LUYỆN"}
                        </Tag>
                        <span className={styles.itemDate}>
                          <Calendar size={14} />{" "}
                          {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </div>

                      <div className={styles.examInfoRow}>
                        <div className={styles.imageWrapper}>
                          {item.deThiGoc?.anhDaiDien ? (
                            <img
                              src={getPublicUrl(item.deThiGoc.anhDaiDien)}
                              alt="Thumbnail"
                              className={styles.examThumb}
                            />
                          ) : (
                            <div className={styles.thumbPlaceholder}>
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                        <h3 className={styles.itemTitle}>
                          {item.tieuDeSnapshot}
                        </h3>
                      </div>

                      <div className={styles.itemStats}>
                        <div className={styles.miniStat}>
                          <Text type="secondary" className={styles.statLabel}>
                            Điểm số
                          </Text>
                          <span className={styles.scoreText}>
                            {item.ketQua.diemSo}/10
                          </span>
                        </div>
                        <div className={styles.miniStat}>
                          <Text type="secondary" className={styles.statLabel}>
                            Tỉ lệ
                          </Text>
                          <span className={styles.statVal}>
                            {item.ketQua.soCauDung}/{item.ketQua.tongSoCau}
                          </span>
                        </div>
                        <div className={styles.miniStat}>
                          <Text type="secondary" className={styles.statLabel}>
                            Thời gian
                          </Text>
                          <span className={styles.statVal}>
                            {formatDuration(item.ketQua.thoiGianHoanThanh)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.itemFooter}>
                        <Button
                          type="primary"
                          icon={<Eye size={16} />}
                          block
                          className={styles.viewBtn}
                          onClick={() => handleShowDetail(item._id)}
                        >
                          Xem chi tiết bài làm
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className={styles.paginationBox}>
                  <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    pageSize={pagination.pageSize}
                    onChange={(p, s) => fetchHistory(p, s)}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <Empty description="Bạn chưa thực hiện bài thi nào" />
            )}
          </div>
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
                Chi tiết kết quả bài làm
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
            <Spin size="large" tip="Đang phân tích bài làm..." />
          </div>
        ) : selectedExam ? (
          <div className={styles.modalWrapper}>
            {/* Thẻ tóm tắt kết quả kiểu mới */}
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
                <span className={styles.sumLabel}>Thời gian làm</span>
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

                // Kiểm tra xem câu này user làm đúng hay sai
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

                        // LOGIC MÀU SẮC:
                        // 1. Đúng hoàn toàn (Selected + Correct) -> Xanh lá
                        // 2. Sai (Selected + Not Correct) -> Đỏ
                        // 3. Đáp án đúng bị bỏ lỡ (Not Selected + Correct) -> Xanh lá nhạt/Viền xanh
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

export default LichSuCaNhanThi;
