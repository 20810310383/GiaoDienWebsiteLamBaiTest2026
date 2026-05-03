import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Play, 
  Trophy, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Search,
  ShoppingCart,
  Star,
  Award,
  TrendingUp,
  BarChart3,
  Eye,
  RotateCcw
} from "lucide-react";
import { message } from "antd";
import styles from "./BoSuuTap.module.css";
import baiGiangThuongMaiAPI from "../../../services/baiGiangThuongMaiAPI";
import { useAuth } from "../../../contexts/AuthContext";
import { getPublicUrl } from "../../../utils/formatURL";

const BoSuuTap = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [danhSachDaMua, setDanhSachDaMua] = useState([]);
  const [lichSuThi, setLichSuThi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("collection");
  const [searchKey, setSearchKey] = useState("");
  const [previewModal, setPreviewModal] = useState(null);
  const [previewBaiGiang, setPreviewBaiGiang] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Lấy danh sách đã mua
  useEffect(() => {
    if (user) {
      fetchDanhSachDaMua();
    }
  }, [user]);

  const fetchDanhSachDaMua = async () => {
    try {
      setLoading(true);
      const res = await baiGiangThuongMaiAPI.getDanhSachDaMua(token);
      if (res.success) {
        setDanhSachDaMua(res.data || []);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đã mua:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy lịch sử thi
  const fetchLichSuThi = async () => {
    try {
      setLoading(true);
      const res = await baiGiangThuongMaiAPI.getLichSuThi(token);
      if (res.success) {
        setLichSuThi(res.data || []);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử thi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Đổi tab
  useEffect(() => {
    if (activeTab === "history") {
      fetchLichSuThi();
    }
  }, [activeTab]);

  // Lọc theo search
  const filteredItems = danhSachDaMua.filter(item => {
    const tenBG = item.id_bai_giang?.ten_bai_giang?.toLowerCase() || "";
    const tenLop = item.id_bai_giang?.id_lop_hoc?.ten_lop?.toLowerCase() || "";
    const key = searchKey.toLowerCase();
    return tenBG.includes(key) || tenLop.includes(key);
  });

  // Thống kê
  const thongKe = {
    soBaiDaMua: danhSachDaMua.length,
    soBaiHoanThanh: danhSachDaMua.filter(i => i.trang_thai === 'da_hoan_thanh').length,
    soBaiDangHoc: danhSachDaMua.filter(i => i.trang_thai === 'dang_hoc').length,
    tongDiem: 0,
    soLanThi: lichSuThi.length
  };

  // Xem preview bài giảng
  const xemPreview = async (baiGiangId) => {
    setPreviewBaiGiang({ _id: baiGiangId });
    setPreviewModal(true);
    
    try {
      setLoadingPreview(true);
      const res = await baiGiangThuongMaiAPI.getBaiThi(baiGiangId, token);
      if (res.success) {
        setPreviewBaiGiang(res.data);
      }
    } catch (error) {
      console.error("Lỗi load preview:", error);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Bắt đầu làm bài
  const batDauLamBai = (baiGiangId) => {
    navigate(`/hoc-sinh/lam-bai/${baiGiangId}`);
  };

  // Xem lại đáp án
  const xemDapAn = async (baiGiangId) => {
    try {
      const res = await baiGiangThuongMaiAPI.xemDapAn(baiGiangId, token);
      if (res.success) {
        setPreviewBaiGiang(res.data);
        setPreviewModal(true);
      }
    } catch (error) {
      message.error("Chưa có kết quả thi nào");
    }
  };

  // Format điểm
  const getDiemColor = (diem) => {
    if (diem >= 8) return "#15803d";
    if (diem >= 6) return "#b45309";
    if (diem >= 4) return "#ea580c";
    return "#dc2626";
  };

  const getDiemLabel = (diem) => {
    if (diem >= 8) return "Xuất sắc";
    if (diem >= 6) return "Khá";
    if (diem >= 4) return "Trung bình";
    return "Yếu";
  };

  return (
    <div className={styles.page}>
      <div className={styles.meshBg} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {user?.ho_ten?.charAt(0)?.toUpperCase() || "H"}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.eyebrow}>
                <BookOpen size={12} />
                Bộ sưu tập của tôi
              </span>
              <h1 className={styles.title}>
                Xin chào, <em>{user?.ho_ten || "Học sinh"}</em>
              </h1>
              <p className={styles.subtitle}>Tiếp tục hành trình học tập của bạn</p>
            </div>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          {user?.soDu !== undefined && (
            <div className={styles.soDuCard}>
              <div className={styles.soDuIcon}>
                <Star size={20} />
              </div>
              <div className={styles.soDuInfo}>
                <span className={styles.soDuLabel}>Số dư</span>
                <span className={styles.soDuValue}>{user.soDu.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ "--icon-color": "#185fa5" }}>
            <BookOpen size={22} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNum}>{thongKe.soBaiDaMua}</span>
            <span className={styles.statLabel}>Bài đã mua</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ "--icon-color": "#15803d" }}>
            <TrendingUp size={22} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNum}>{thongKe.soBaiDangHoc}</span>
            <span className={styles.statLabel}>Đang học</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ "--icon-color": "#b45309" }}>
            <Award size={22} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNum}>{thongKe.soBaiHoanThanh}</span>
            <span className={styles.statLabel}>Hoàn thành</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ "--icon-color": "#0891b2" }}>
            <RotateCcw size={22} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNum}>{thongKe.soLanThi}</span>
            <span className={styles.statLabel}>Lần thi</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsSection}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === "collection" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("collection")}
          >
            <BookOpen size={18} />
            Bộ sưu tập
            <span className={styles.tabBadge}>{danhSachDaMua.length}</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "history" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Clock size={18} />
            Lịch sử thi
          </button>
        </div>

        {activeTab === "collection" && danhSachDaMua.length > 0 && (
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm bài giảng..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : activeTab === "collection" ? (
          filteredItems.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <BookOpen size={48} />
              </div>
              <h3>Bộ sưu tập trống</h3>
              <p>Bạn chưa mua bài giảng nào. Hãy khám phá và mua bài giảng để bắt đầu học tập!</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredItems.map((item, index) => (
                <div 
                  key={item._id} 
                  className={styles.card}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Cover */}
                  <div className={styles.cardCover}>
                    {item.id_bai_giang?.anhDaiDien ? (
                      <img 
                        src={getPublicUrl(item.id_bai_giang.anhDaiDien)} 
                        alt={item.id_bai_giang.ten_bai_giang}
                        className={styles.coverImg}
                      />
                    ) : (
                      <div className={styles.coverPlaceholder}>
                        <BookOpen size={40} />
                      </div>
                    )}
                    <div className={styles.coverOverlay} />
                    
                    <div className={styles.coverTopRow}>
                      <span className={styles.lopTag}>
                        {item.id_bai_giang?.id_lop_hoc?.ten_lop || "Không có lớp"}
                      </span>
                      <span className={`${styles.statusTag} ${styles[item.trang_thai]}`}>
                        {item.trang_thai === 'da_hoan_thanh' ? 'Hoàn thành' : 
                         item.trang_thai === 'dang_hoc' ? 'Đang học' : 'Đã mua'}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>
                      {item.id_bai_giang?.ten_bai_giang || "Không có tiêu đề"}
                    </h3>
                    
                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <Clock size={14} />
                        <span>{item.id_bai_giang?.thoi_gian_lam_bai || 15} phút</span>
                      </div>
                      <div className={styles.metaItem}>
                        <CheckCircle size={14} />
                        <span>{item.id_bai_giang?.danhSachCauHoi?.length || 0} câu</span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <button 
                        className={styles.btnXem}
                        onClick={() => xemPreview(item.id_bai_giang?._id)}
                      >
                        <Eye size={16} />
                        Xem
                      </button>
                      <button 
                        className={styles.btnLamBai}
                        onClick={() => batDauLamBai(item.id_bai_giang?._id)}
                      >
                        <Play size={16} />
                        Làm bài
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Lịch sử thi
          lichSuThi.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Clock size={48} />
              </div>
              <h3>Chưa có lịch sử thi</h3>
              <p>Bạn chưa làm bài thi nào. Hãy bắt đầu làm bài để xem lịch sử tại đây!</p>
            </div>
          ) : (
            <div className={styles.historyList}>
              {lichSuThi.map((item, index) => (
                <div key={item._id} className={styles.historyCard} style={{ animationDelay: `${index * 0.03}s` }}>
                  <div className={styles.historyLeft}>
                    <div 
                      className={styles.diemCircle}
                      style={{ "--diem-color": getDiemColor(item.diem) }}
                    >
                      <span className={styles.diemValue}>{item.diem}</span>
                      <span className={styles.diemMax}>/10</span>
                    </div>
                  </div>
                  
                  <div className={styles.historyCenter}>
                    <h4 className={styles.historyTitle}>
                      {item.id_bai_giang?.ten_bai_giang || "Bài thi"}
                    </h4>
                    <div className={styles.historyMeta}>
                      <span>
                        <Clock size={14} />
                        Lần {item.lan_thi} • {new Date(item.ngay_lam_bai).toLocaleDateString("vi-VN")}
                      </span>
                      <span>
                        <CheckCircle size={14} />
                        {item.so_cau_dung}/{item.tong_so_cau} câu đúng
                      </span>
                    </div>
                    <div className={styles.historyLabel} style={{ color: getDiemColor(item.diem) }}>
                      {getDiemLabel(item.diem)}
                    </div>
                  </div>
                  
                  <div className={styles.historyRight}>
                    <button 
                      className={styles.btnXemDapAn}
                      onClick={() => xemDapAn(item.id_bai_giang?._id)}
                    >
                      <BarChart3 size={16} />
                      Xem đáp án
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Preview Modal */}
      {previewModal && previewBaiGiang && (
        <div className={styles.modalOverlay} onClick={() => setPreviewModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <div className={styles.modalIcon}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3>{previewBaiGiang.ten_bai_giang || "Bài giảng"}</h3>
                  <p>{previewBaiGiang.ten_lop}</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setPreviewModal(false)}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {loadingPreview ? (
                <div className={styles.loadingPreview}>
                  <div className={styles.spinner}></div>
                </div>
              ) : (
                <>
                  <div className={styles.previewStats}>
                    <div className={styles.previewStat}>
                      <Trophy size={18} />
                      <span>{previewBaiGiang.tongSoCau || 0} câu hỏi</span>
                    </div>
                    <div className={styles.previewStat}>
                      <Clock size={18} />
                      <span>{previewBaiGiang.thoi_gian_lam_bai || 15} phút</span>
                    </div>
                    <div className={styles.previewStat}>
                      <TrendingUp size={18} />
                      <span>Lần thi #{previewBaiGiang.soLanThi || 1}</span>
                    </div>
                  </div>

                  {previewBaiGiang.diemCaoNhat !== null && (
                    <div className={styles.bestScore}>
                      <span className={styles.bestScoreLabel}>Điểm cao nhất:</span>
                      <span 
                        className={styles.bestScoreValue}
                        style={{ color: getDiemColor(previewBaiGiang.diemCaoNhat) }}
                      >
                        {previewBaiGiang.diemCaoNhat}/10
                      </span>
                    </div>
                  )}

                  {/* {previewBaiGiang.cauHoi && (
                    <div className={styles.questionPreview}>
                      <h4>Preview câu hỏi</h4>
                      <div className={styles.questionList}>
                        {previewBaiGiang.cauHoi.slice(0, 3).map((q, idx) => (
                          <div key={idx} className={styles.questionItem}>
                            <span className={styles.questionNum}>{q.stt}</span>
                            <span 
                              className={styles.questionText}
                              dangerouslySetInnerHTML={{ 
                                __html: (q.noiDungCauHoi || "").substring(0, 80) + "..."
                              }}
                            />
                          </div>
                        ))}
                        {previewBaiGiang.cauHoi.length > 3 && (
                          <div className={styles.moreQuestions}>
                            +{previewBaiGiang.cauHoi.length - 3} câu hỏi khác
                          </div>
                        )}
                      </div>
                    </div>
                  )} */}
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnDong} onClick={() => setPreviewModal(false)}>
                Đóng
              </button>
              <button 
                className={styles.btnBatDau}
                onClick={() => {
                  setPreviewModal(false);
                  batDauLamBai(previewBaiGiang?.baiGiang?._id);
                }}
              >
                <Play size={18} />
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoSuuTap;
