import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Play, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronRight, 
  Search,
  Star,
  Award,
  TrendingUp,
  BarChart3,
  Eye,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Check,
  X,
  ChevronLeft,
  ChevronFirst,
  ChevronLast,
  Filter
} from "lucide-react";
import { message, Drawer } from "antd";
import styles from "./BoSuuTap.module.css";
import baiGiangThuongMaiAPI from "../../../services/baiGiangThuongMaiAPI";
import { useAuth } from "../../../contexts/AuthContext";
import { getPublicUrl } from "../../../utils/formatURL";

const PAGE_SIZE = 10;

const BoSuuTap = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Collection state
  const [danhSachDaMua, setDanhSachDaMua] = useState([]);
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionTotal, setCollectionTotal] = useState(0);
  const [collectionSearch, setCollectionSearch] = useState("");

  // History state
  const [lichSuThi, setLichSuThi] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historySearch, setHistorySearch] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("collection");
  const [previewModal, setPreviewModal] = useState(null);
  const [previewBaiGiang, setPreviewBaiGiang] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Answer detail Drawer
  const [answerDrawer, setAnswerDrawer] = useState(false);
  const [dapAnChiTiet, setDapAnChiTiet] = useState(null);
  const [loadingDapAn, setLoadingDapAn] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Toggle question expand
  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
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

  // Fetch collection with pagination & search
  const fetchDanhSachDaMua = useCallback(async () => {
    try {
      setLoading(true);
      const res = await baiGiangThuongMaiAPI.getDanhSachDaMua(token, {
        page: collectionPage,
        limit: PAGE_SIZE,
        search: collectionSearch
      });
      if (res.success) {
        setDanhSachDaMua(res.data?.items || []);
        setCollectionTotal(res.data?.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đã mua:", error);
    } finally {
      setLoading(false);
    }
  }, [token, collectionPage, collectionSearch]);

  // Fetch history with pagination & search
  const fetchLichSuThi = useCallback(async () => {
    try {
      setLoading(true);
      const res = await baiGiangThuongMaiAPI.getLichSuThi(token, {
        page: historyPage,
        limit: PAGE_SIZE,
        search: historySearch
      });
      if (res.success) {
        setLichSuThi(res.data?.items || []);
        setHistoryTotal(res.data?.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử thi:", error);
    } finally {
      setLoading(false);
    }
  }, [token, historyPage, historySearch]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchDanhSachDaMua();
    }
  }, [user, fetchDanhSachDaMua]);

  // Tab change
  useEffect(() => {
    
    fetchLichSuThi();
  }, [activeTab, fetchLichSuThi]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "collection") {
        setCollectionPage(1);
        fetchDanhSachDaMua();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [collectionSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "history") {
        setHistoryPage(1);
        fetchLichSuThi();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [historySearch]);

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

  // Xem đáp án - mở Drawer
  const xemDapAn = async (baiGiangId, lanThi) => {
    try {
      setLoadingDapAn(true);
      setAnswerDrawer(true);
      setExpandedQuestion(0);
      
      const res = await baiGiangThuongMaiAPI.xemDapAn(baiGiangId, token, lanThi);
      if (res.success) {
        setDapAnChiTiet(res.data);
      }
    } catch (error) {
      message.error("Chưa có kết quả thi nào");
      setAnswerDrawer(false);
    } finally {
      setLoadingDapAn(false);
    }
  };

  // Thống kê
  const thongKe = {
    soBaiDaMua: collectionTotal,
    soLanThi: historyTotal
  };

  const totalCollectionPages = Math.ceil(collectionTotal / PAGE_SIZE);
  const totalHistoryPages = Math.ceil(historyTotal / PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.meshBg} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {user?.anh_dai_dien ? (
                <img
                  src={getPublicUrl(user.anh_dai_dien)}
                  alt={user?.ho_ten || "Avatar"}
                  className={styles.avatarImg}
                />
              ) : (
                user?.ho_ten?.charAt(0)?.toUpperCase() || "H"
              )}
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
            <span className={styles.tabBadge}>{collectionTotal}</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "history" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Clock size={18} />
            Lịch sử thi
            <span className={styles.tabBadge}>{historyTotal}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={activeTab === "collection" ? "Tìm kiếm bài giảng..." : "Tìm kiếm lịch sử thi..."}
            value={activeTab === "collection" ? collectionSearch : historySearch}
            onChange={(e) => {
              if (activeTab === "collection") {
                setCollectionSearch(e.target.value);
              } else {
                setHistorySearch(e.target.value);
              }
            }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : activeTab === "collection" ? (
          danhSachDaMua.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <BookOpen size={48} />
              </div>
              <h3>Bộ sưu tập trống</h3>
              <p>Bạn chưa mua bài giảng nào. Hãy khám phá và mua bài giảng để bắt đầu học tập!</p>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {danhSachDaMua.map((item, index) => (
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

              {/* Pagination */}
              {totalCollectionPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    className={styles.pageBtn}
                    onClick={() => setCollectionPage(1)}
                    disabled={collectionPage === 1}
                  >
                    <ChevronFirst size={18} />
                  </button>
                  <button 
                    className={styles.pageBtn}
                    onClick={() => setCollectionPage(p => Math.max(1, p - 1))}
                    disabled={collectionPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalCollectionPages) }, (_, i) => {
                      let pageNum;
                      if (totalCollectionPages <= 5) {
                        pageNum = i + 1;
                      } else if (collectionPage <= 3) {
                        pageNum = i + 1;
                      } else if (collectionPage >= totalCollectionPages - 2) {
                        pageNum = totalCollectionPages - 4 + i;
                      } else {
                        pageNum = collectionPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`${styles.pageNum} ${collectionPage === pageNum ? styles.pageNumActive : ""}`}
                          onClick={() => setCollectionPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    className={styles.pageBtn}
                    onClick={() => setCollectionPage(p => Math.min(totalCollectionPages, p + 1))}
                    disabled={collectionPage === totalCollectionPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button 
                    className={styles.pageBtn}
                    onClick={() => setCollectionPage(totalCollectionPages)}
                    disabled={collectionPage === totalCollectionPages}
                  >
                    <ChevronLast size={18} />
                  </button>
                </div>
              )}
            </>
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
            <>
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
                        onClick={() => xemDapAn(item.id_bai_giang?._id, item.lan_thi)}
                      >
                        <BarChart3 size={16} />
                        Xem đáp án
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalHistoryPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    className={styles.pageBtn}
                    onClick={() => setHistoryPage(1)}
                    disabled={historyPage === 1}
                  >
                    <ChevronFirst size={18} />
                  </button>
                  <button 
                    className={styles.pageBtn}
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalHistoryPages) }, (_, i) => {
                      let pageNum;
                      if (totalHistoryPages <= 5) {
                        pageNum = i + 1;
                      } else if (historyPage <= 3) {
                        pageNum = i + 1;
                      } else if (historyPage >= totalHistoryPages - 2) {
                        pageNum = totalHistoryPages - 4 + i;
                      } else {
                        pageNum = historyPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`${styles.pageNum} ${historyPage === pageNum ? styles.pageNumActive : ""}`}
                          onClick={() => setHistoryPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    className={styles.pageBtn}
                    onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                    disabled={historyPage === totalHistoryPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button 
                    className={styles.pageBtn}
                    onClick={() => setHistoryPage(totalHistoryPages)}
                    disabled={historyPage === totalHistoryPages}
                  >
                    <ChevronLast size={18} />
                  </button>
                </div>
              )}
            </>
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
                  <h3>{previewBaiGiang.baiGiang?.ten_bai_giang || previewBaiGiang.ten_bai_giang || "Bài giảng"}</h3>
                  <p>{previewBaiGiang.baiGiang?.ten_lop || previewBaiGiang.ten_lop}</p>
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
                      <span>{previewBaiGiang.baiGiang?.thoi_gian_lam_bai || previewBaiGiang.thoi_gian_lam_bai || 15} phút</span>
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
                  batDauLamBai(previewBaiGiang.baiGiang?._id);
                }}
              >
                <Play size={18} />
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Đáp án chi tiết - DRAWNER */}
      <Drawer
        title={null}
        placement="right"
        width={600}
        open={answerDrawer}
        onClose={() => {
          setAnswerDrawer(false);
          setDapAnChiTiet(null);
          setExpandedQuestion(null);
        }}
        className={styles.answerDrawer}
        closeIcon={<span className={styles.drawerCloseBtn}>✕</span>}
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitleSection}>
            <div className={styles.drawerIcon}>
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className={styles.drawerTitle}>Đáp án chi tiết</h2>
              <p className={styles.drawerSubtitle}>{dapAnChiTiet?.ketQua?.tenBaiGiang || "Bài thi"}</p>
            </div>
          </div>
          <div className={styles.drawerScoreBadge} style={{ color: getDiemColor(dapAnChiTiet?.ketQua?.diem) }}>
            {dapAnChiTiet?.ketQua?.diem}/10
          </div>
        </div>

        {/* Question Navigator */}
        <div className={styles.drawerQuestionNav}>
          {dapAnChiTiet?.dapAnChiTiet?.map((item, index) => {
            const isCorrect = item.cacDapAn.some(a => a.laDapAnDung && a.daChon);
            return (
              <button
                key={index}
                className={`${styles.drawerNavDot} ${
                  expandedQuestion === index ? styles.drawerNavDotActive : ""
                } ${isCorrect ? styles.drawerNavDotCorrect : styles.drawerNavDotWrong}`}
                onClick={() => toggleQuestion(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Question Content */}
        <div className={styles.drawerContent}>
          {loadingDapAn ? (
            <div className={styles.loadingDapAn}>
              <div className={styles.spinner}></div>
              <p>Đang tải đáp án...</p>
            </div>
          ) : dapAnChiTiet?.dapAnChiTiet?.map((item, index) => (
            <div key={index} className={styles.drawerQuestionCard} style={{ display: expandedQuestion === index ? 'block' : 'none' }}>
              {/* Question Header */}
              <div className={styles.drawerQuestionHeader}>
                <span className={styles.drawerQuestionBadge}>Câu {index + 1}</span>
              </div>

              {/* Question Text */}
              <div className={styles.drawerQuestionText}>
                <p dangerouslySetInnerHTML={{ __html: item.noiDungCauHoi }} />
              </div>

              {/* Answers */}
              <div className={styles.drawerAnswersList}>
                {item.cacDapAn.map((answer, idx) => (
                  <div 
                    key={idx}
                    className={`${styles.drawerAnswerOption} ${
                      answer.laDapAnDung ? styles.drawerAnswerCorrect :
                      answer.daChon ? styles.drawerAnswerWrong : ''
                    }`}
                  >
                    <span className={`${styles.drawerAnswerLabel} ${
                      answer.laDapAnDung ? styles.drawerAnswerLabelCorrect :
                      answer.daChon ? styles.drawerAnswerLabelWrong : ''
                    }`}>
                      {answer.label}
                    </span>
                    <span className={styles.drawerAnswerText}>
                      <span dangerouslySetInnerHTML={{ __html: answer.noiDung }} />
                      {answer.laDapAnDung && <span className={styles.dapAnDungTag}>Đáp án đúng</span>}
                      {answer.daChon && !answer.laDapAnDung && <span className={styles.daChonTag}>Bạn chọn</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {item.giaiThich && (
                <div className={styles.drawerExplanation}>
                  <div className={styles.drawerExplanationHeader}>
                    <AlertCircle size={16} />
                    <span>Giải thích</span>
                  </div>
                  <div className={styles.drawerExplanationContent}>
                    <p dangerouslySetInnerHTML={{ __html: item.giaiThich }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className={styles.drawerNavigation}>
          <button 
            className={styles.drawerNavBtn}
            onClick={() => {
              const current = expandedQuestion ?? 0;
              if (current > 0) toggleQuestion(current - 1);
            }}
          >
            <ChevronLeft size={18} />
            Câu trước
          </button>
          <span className={styles.drawerNavInfo}>
            {(expandedQuestion ?? 0) + 1} / {dapAnChiTiet?.dapAnChiTiet?.length || 0}
          </span>
          <button 
            className={styles.drawerNavBtn}
            onClick={() => {
              const current = expandedQuestion ?? 0;
              const total = dapAnChiTiet?.dapAnChiTiet?.length ?? 0;
              if (current < total - 1) toggleQuestion(current + 1);
            }}
          >
            Câu sau
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Footer */}
        <div className={styles.drawerFooter}>
          <button 
            className={styles.drawerBtnLamLai}
            onClick={() => {
              const baiGiangId = dapAnChiTiet?.ketQua?.idBaiGiang;
              setAnswerDrawer(false);
              if (baiGiangId) batDauLamBai(baiGiangId);
            }}
          >
            <RotateCcw size={16} />
            Làm lại
          </button>
        </div>
      </Drawer>
    </div>
  );
};

export default BoSuuTap;
