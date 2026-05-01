import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { message, Spin, Avatar, Typography, Empty } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // Import plugin
import "dayjs/locale/vi"; // Nếu bạn muốn hiển thị tiếng Việt (ví dụ: "vài giây trước")

dayjs.extend(relativeTime); // Kích hoạt plugin
dayjs.locale("vi"); // Sử dụng ngôn ngữ tiếng Việt

import styles from "./DashboardPage.module.css";
import { getAllUsers } from "../../services/nguoiDungService";
import { getAllDeThi } from "../../services/boDeService";
import { getStudentHistory } from "../../services/lichSuThiService";
import { useAuth } from "../../contexts/AuthContext";
import { getPublicUrl } from "../../utils/formatURL";
import { decryptData } from "../../utils/cryptoHelper";

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Xác định vai trò người dùng từ AuthContext
      const isAdmin = user?.role === "admin";

      // Thiết lập tham số bộ đề:
      // Nếu không phải admin, truyền thêm nguoiDangId là ID của chính mình
      const deThiParams = {
        limit: 20,
        ...{ nguoiDangId: user._id },
      };

      // 1. Gọi đồng thời các API dựa trên quyền hạn
      const [usersRes, deThiRes, historyRes] = await Promise.all([
        isAdmin ? getAllUsers({ limit: 1 }, token) : Promise.resolve(null), // Chỉ admin mới gọi User
        getAllDeThi(deThiParams, token),
        getStudentHistory({ limit: 100 }, token), // Lấy lịch sử học viên đã thi các đề của mình
      ]);
      const decryptedQuiz = decryptData(deThiRes);

      // 2. Xử lý số liệu thống kê (Stats)
      const totalUsers = usersRes?.totalUsers || 0;
      const totalExams = decryptedQuiz?.totalItems || 0; // Lấy từ totalItems của Backend trả về
      const totalAttempts = historyRes?.totalRecords || 0;

      // Tính tỷ lệ đạt (điểm >= 5) từ dữ liệu lịch sử
      const passRate =
        historyRes.data?.length > 0
          ? (
              (historyRes.data.filter((h) => h.ketQua.diemSo >= 5).length /
                historyRes.data.length) *
              100
            ).toFixed(1)
          : 0;

      // Khởi tạo mảng thống kê cơ bản
      const newStats = [
        // {
        //   label: "Bộ đề thi",
        //   value: totalExams.toLocaleString(),
        //   icon: <FileTextOutlined />,
        //   color: "#10b981",
        // },
        {
          label: "Lượt thi học viên",
          value: totalAttempts.toLocaleString(),
          icon: <ThunderboltOutlined />,
          color: "#f59e0b",
        },
        {
          label: "Tỷ lệ đạt (>=5đ)",
          value: `${passRate}%`,
          icon: <CheckCircleOutlined />,
          color: "#8b5cf6",
        },
      ];

      // Nếu là Admin thì chèn thêm thống kê Người dùng vào đầu mảng
      if (isAdmin) {
        newStats.unshift({
          label: "Tổng người dùng",
          value: totalUsers.toLocaleString(),
          icon: <UserOutlined />,
          color: "#3b82f6",
        });
      }

      setStats(newStats);

      // 3. Cập nhật danh sách hoạt động mới nhất
      setActivities(historyRes.data || []);

      // 4. Xử lý dữ liệu biểu đồ xu hướng (7 ngày gần nhất)
      const last7Days = [...Array(7)]
        .map((_, i) => {
          const dateStr = dayjs().subtract(i, "day").format("DD/MM");
          // Đếm số lượt thi khớp với ngày tương ứng trong lịch sử
          const count =
            historyRes.data?.filter(
              (h) => dayjs(h.createdAt).format("DD/MM") === dateStr,
            ).length || 0;
          return { name: dateStr, luotThi: count };
        })
        .reverse();

      setChartData(last7Days);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      message.error("Không thể đồng bộ dữ liệu từ hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  if (loading)
    return (
      <div className={styles.loadingCenter}>
        <Spin size="large" tip="Đang lấy dữ liệu thực tế..." />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={styles.dashboardContainer}
    >
      <header className={styles.header}>
        <Title level={2} className={styles.welcomeText}>
          Bảng điều khiển hệ thống
        </Title>
        <Text className={styles.subText}>
          Dữ liệu được cập nhật trực tiếp theo thời gian thực.
        </Text>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((item, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.cardHeader}>
              <div
                className={styles.iconBox}
                style={{
                  color: item.color,
                  backgroundColor: `${item.color}15`,
                }}
              >
                {item.icon}
              </div>
              <RiseOutlined style={{ color: "#10b981" }} />
            </div>
            <div className={styles.statValue}>{item.value}</div>
            <div className={styles.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Biểu đồ xu hướng */}
        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            Xu hướng lượt thi (7 ngày gần nhất)
          </h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="luotThi"
                  stroke="#10b981"
                  fill="url(#colorWave)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Danh sách hoạt động động */}
        <div className={styles.recentSection}>
          <h3 className={styles.sectionTitle}>Hoạt động mới nhất</h3>
          <div className={styles.activityList}>
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act._id} className={styles.activityItem}>
                  <Avatar
                    src={getPublicUrl(act.nguoiThi?.avatar)}
                    icon={<UserOutlined />}
                  />
                  <div className={styles.actInfo}>
                    <Text strong className={styles.actUser}>
                      {act.nguoiThi?.hoTen}
                    </Text>
                    <Text className={styles.actText}>
                      {" "}
                      hoàn thành <b>{act.tieuDeSnapshot}</b>
                    </Text>
                    <div className={styles.actTime}>
                      {dayjs(act.createdAt).fromNow()}
                    </div>
                  </div>
                  <div
                    className={styles.actScore}
                    style={{
                      color: act.ketQua.diemSo >= 5 ? "#10b981" : "#ef4444",
                    }}
                  >
                    {act.ketQua.diemSo}đ
                  </div>
                </div>
              ))
            ) : (
              <Empty description="Chưa có lượt thi nào" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
