import React from "react";
import {
  Modal,
  Spin,
  Row,
  Col,
  Tag,
  Avatar,
  Descriptions,
  Table,
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
  User,
  BookOpen,
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

  // Columns cho bảng câu hỏi
  const questionColumns = [
    {
      title: "#",
      key: "index",
      width: 50,
      align: "center",
      render: (_, __, index) => <strong>{index + 1}</strong>,
    },
    {
      title: "Câu hỏi",
      dataIndex: ["id_cau_hoi_obj", "noiDungCauHoi"],
      key: "cau_hoi",
      render: (text, record) => {
        const cauHoi = data?.id_bai_giang?.danhSachCauHoi?.find(
          (c) => c._id?.toString() === record.id_cau_hoi?.toString()
        );
        return cauHoi?.noiDungCauHoi || "Không tìm thấy câu hỏi";
      },
    },
    {
      title: "Đáp án đã chọn",
      key: "dap_an_chon",
      width: 150,
      align: "center",
      render: (_, record) => {
        const color = record.dung_sai ? "#52c41a" : "#ff4d4f";
        const icon = record.dung_sai ? (
          <CheckCircle size={16} />
        ) : (
          <XCircle size={16} />
        );
        return (
          <Tag
            color={record.dap_an_chon ? color : "default"}
            icon={record.dap_an_chon ? icon : null}
            style={{ fontWeight: 600 }}
          >
            {record.dap_an_chon || "Chưa chọn"}
          </Tag>
        );
      },
    },
    {
      title: "Đáp án đúng",
      dataIndex: "dap_an_dung",
      key: "dap_an_dung",
      width: 120,
      align: "center",
      render: (text) => (
        <Tag color="green" style={{ fontWeight: 600 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Kết quả",
      dataIndex: "dung_sai",
      key: "dung_sai",
      width: 100,
      align: "center",
      render: (dung_sai) =>
        dung_sai ? (
          <Tag color="success" icon={<CheckCircle size={12} />}>
            Đúng
          </Tag>
        ) : (
          <Tag color="error" icon={<XCircle size={12} />}>
            Sai
          </Tag>
        ),
    },
  ];

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
              <Table
                columns={questionColumns}
                dataSource={data.chi_tiet_dap_an || []}
                rowKey={(record) => record.id_cau_hoi?.toString()}
                pagination={false}
                size="small"
                scroll={{ y: 400 }}
                locale={{
                  emptyText: (
                    <Empty description="Không có chi tiết câu hỏi" />
                  ),
                }}
              />
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
