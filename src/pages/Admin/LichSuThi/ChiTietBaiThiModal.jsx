import React from "react";
import {
  Modal,
  Spin,
  Row,
  Col,
  Tag,
  Avatar,
  Descriptions,
  Card,
  Divider,
  Empty,
} from "antd";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText,
  BookOpen,
  Lightbulb,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import styles from "./ChiTietBaiThi.module.css";
import { getPublicUrl } from "../../../utils/formatURL";

const ChiTietBaiThiModal = ({ open, data, loading, onClose }) => {
  if (!data && !loading) return null;

  const renderDiem = (diem) => {
    let color = "#52c41a";
    if (diem < 5) color = "#ff4d4f";
    else if (diem < 7) color = "#faad14";
    else if (diem < 8.5) color = "#1890ff";
    return (
      <span style={{ color, fontWeight: 700, fontSize: 24 }}>
        {diem.toFixed(1)}
      </span>
    );
  };

  const formatThoiGian = (giay) => {
    if (!giay) return "-";
    const phut = Math.floor(giay / 60);
    const giayLe = giay % 60;
    return `${phut}p ${giayLe}s`;
  };

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

  // Render một câu hỏi chi tiết
  const renderCauHoiChiTiet = (record, index) => {
    const cauHoi = data?.id_bai_giang?.danhSachCauHoi?.find(
      (c) => c._id?.toString() === record.id_cau_hoi?.toString()
    );

    if (!cauHoi) {
      return (
        <div key={record.id_cau_hoi?.toString()} className={styles.questionCard}>
          <AlertCircle size={16} />
          Không tìm thấy câu hỏi
        </div>
      );
    }

    const isCorrect = record.dung_sai;
    const answers = cauHoi.cacDapAn || [];

    // Chuyển đổi "A", "B", "C", "D" thành index 0, 1, 2, 3
    const selectedIndex = ["A", "B", "C", "D"].indexOf(
      record.dap_an_chon?.trim().toUpperCase()
    );

    return (
      <div
        key={record.id_cau_hoi?.toString()}
        className={`${styles.questionCard} ${isCorrect ? styles.correct : styles.incorrect}`}
      >
        {/* Header: Số câu & Kết quả */}
        <div className={styles.questionHeader}>
          <div className={styles.questionNumber}>
            <HelpCircle size={16} />
            <span>Câu {index + 1}</span>
          </div>
          <Tag
            color={isCorrect ? "success" : "error"}
            icon={isCorrect ? <CheckCircle size={12} /> : <XCircle size={12} />}
            className={styles.resultTag}
          >
            {isCorrect ? "Đúng" : "Sai"}
          </Tag>
        </div>

        {/* Nội dung câu hỏi */}
        <div className={styles.questionContent}>
          <div
            className={styles.questionText}
            dangerouslySetInnerHTML={{ __html: cauHoi.noiDungCauHoi }}
          />
        </div>

        {/* Các đáp án */}
        <div className={styles.answersList}>
          {answers.map((answer, ansIndex) => {
            const label = String.fromCharCode(65 + ansIndex); // A, B, C, D
            const isAnswerCorrect = answer.laDapAnDung === true;
            const isAnswerSelected = selectedIndex === ansIndex;

            let answerClass = styles.answerItem;
            if (isAnswerSelected && isAnswerCorrect) {
              answerClass += ` ${styles.answerSelectedCorrect}`;
            } else if (isAnswerSelected && !isAnswerCorrect) {
              answerClass += ` ${styles.answerSelectedWrong}`;
            } else if (isAnswerCorrect) {
              answerClass += ` ${styles.answerCorrect}`;
            }

            return (
              <div key={ansIndex} className={answerClass}>
                <span className={styles.answerLabel}>{label}.</span>
                <span
                  className={styles.answerText}
                  dangerouslySetInnerHTML={{ __html: answer.noiDungDapAn }}
                />
                <span className={styles.answerIcons}>
                  {isAnswerSelected && !isAnswerCorrect && (
                    <XCircle size={18} className={styles.iconWrong} />
                  )}
                  {isAnswerSelected && isAnswerCorrect && (
                    <CheckCircle size={18} className={styles.iconCorrect} />
                  )}
                  {!isAnswerSelected && isAnswerCorrect && (
                    <CheckCircle size={18} className={styles.iconCorrect} />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Đáp án của học viên */}
        <div className={styles.selectedAnswer}>
          <span className={styles.selectedLabel}>Đáp án của bạn:</span>
          <Tag
            color={isCorrect ? "success" : "error"}
            icon={isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
          >
            {record.dap_an_chon
              ? `${record.dap_an_chon.toUpperCase()}. ${
                  answers[selectedIndex]?.noiDungDapAn || ""
                }`
              : "Chưa chọn"}
          </Tag>
        </div>

        {/* Giải thích (nếu có) */}
        {cauHoi.giaiThich && (
          <div className={styles.explanation}>
            <div className={styles.explanationHeader}>
              <Lightbulb size={16} />
              <span>Giải thích</span>
            </div>
            <div
              className={styles.explanationContent}
              dangerouslySetInnerHTML={{ __html: cauHoi.giaiThich }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title={
        <div className={styles.modalTitle}>
          <FileText size={20} />
          <span>Chi tiết bài thi</span>
        </div>
      }
      className={styles.modal}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {data ? (
          <>
            {/* Thông tin học viên & kết quả */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" className={styles.infoCard}>
                  <div className={styles.hocVienHeader}>
                    <Avatar
                      src={
                        data.id_hoc_sinh?.anh_dai_dien
                          ? getPublicUrl(data.id_hoc_sinh.anh_dai_dien)
                          : null
                      }
                      size={64}
                      style={{ backgroundColor: "#1890ff" }}
                    >
                      {data.id_hoc_sinh?.ho_ten?.charAt(0)}
                    </Avatar>
                    <div className={styles.hocVienText}>
                      <strong>{data.id_hoc_sinh?.ho_ten || "N/A"}</strong>
                      <span>@{data.id_hoc_sinh?.ma_so || "N/A"}</span>
                      <span>{data.id_hoc_sinh?.email || "N/A"}</span>
                      <span>{data.id_hoc_sinh?.so_dien_thoai || "N/A"}</span>
                      <span>{data.id_hoc_sinh?.ten_lop_sinh_hoat || ""}</span>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={16}>
                <Card size="small" className={styles.resultCard}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Điểm số</span>
                        {renderDiem(data.diem)}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Số câu đúng</span>
                        <span className={styles.statValue}>
                          {data.so_cau_dung}/{data.tong_so_cau}
                        </span>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Thời gian</span>
                        <span className={styles.statValue}>
                          {formatThoiGian(data.thoi_gian_lam_bai)}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* Thông tin bài thi */}
            <Descriptions
              title="Thông tin bài thi"
              size="small"
              column={2}
              className={styles.descriptions}
            >
              <Descriptions.Item label="Bài giảng">
                {data.id_bai_giang?.ten_bai_giang || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mã bài">
                {data.id_bai_giang?.maBaiGiang || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp học">
                {data.id_lop_hoc?.ten_lop || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Lần thi">
                <Tag color="purple">Lần {data.lan_thi}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày làm bài">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={14} />
                  {formatNgay(data.ngay_lam_bai)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={data.trang_thai === "da_nop_bai" ? "blue" : "green"}>
                  {data.trang_thai === "da_nop_bai"
                    ? "Đã nộp bài"
                    : "Đã xem đáp án"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Chi tiết câu hỏi */}
            <div className={styles.questionsSection}>
              <h3 className={styles.sectionTitle}>
                <BookOpen size={18} />
                Chi tiết câu hỏi
              </h3>
              {data.chi_tiet_dap_an && data.chi_tiet_dap_an.length > 0 ? (
                <div className={styles.questionsList}>
                  {data.chi_tiet_dap_an.map((record, index) =>
                    renderCauHoiChiTiet(record, index)
                  )}
                </div>
              ) : (
                <Empty description="Không có chi tiết câu hỏi" />
              )}
            </div>

            {/* Nội dung bài học (nếu có) */}
            {data.id_bai_giang?.noi_dung_bai_hoc && (
              <>
                <Divider />
                <div className={styles.contentSection}>
                  <h3 className={styles.sectionTitle}>
                    <FileText size={18} />
                    Nội dung bài học
                  </h3>
                  <div
                    className={styles.contentBody}
                    dangerouslySetInnerHTML={{
                      __html: data.id_bai_giang.noi_dung_bai_hoc,
                    }}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" />
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default ChiTietBaiThiModal;
