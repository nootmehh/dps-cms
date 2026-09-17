"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import AuthGuard from "@/components/layout/authGuard";
import EmptyState from "@/components/common/emptyState";
import LordIcon from "@/components/common/lordIcon";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import Dropdown, { type DropdownOption } from "@/components/ui/dropdown";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import Notification, { type NotificationType } from "@/components/ui/notification";
import { getAuthSession, clearAuthSession, type AuthSession } from "@/services/authApi";
import type { AnalyticsData, DailyTrendItem } from "@/app/api/analytics/route";

const SORT_OPTIONS: DropdownOption[] = [
  { value: "views-desc", label: "Tayangan Terbanyak" },
  { value: "views-asc", label: "Tayangan Tersedikit" },
  { value: "users-desc", label: "Pengunjung Terbanyak" },
  { value: "users-asc", label: "Pengunjung Tersedikit" },
  { value: "a-z", label: "Judul (A - Z)" },
  { value: "z-a", label: "Judul (Z - A)" },
];

type ContentCategory = "all" | "produk" | "layanan" | "artikel" | "lainnya";

// Helper identifikasi kategori konten dari URL path
const getPageCategory = (path: string): { key: ContentCategory; label: string; badgeVariant: "blue" | "green" | "yellow" | "gray" } => {
  const p = path.toLowerCase();
  if (p.startsWith("/produk")) {
    return { key: "produk", label: "Produk", badgeVariant: "blue" };
  }
  if (p.startsWith("/layanan")) {
    return { key: "layanan", label: "Layanan", badgeVariant: "green" };
  }
  if (p.startsWith("/artikel") || p.startsWith("/berita")) {
    return { key: "artikel", label: "Artikel", badgeVariant: "yellow" };
  }
  return { key: "lainnya", label: "Halaman Web", badgeVariant: "gray" };
};

// ==========================================
// Sub-Komponen: SVG Bar Chart (Tren Pengunjung)
// ==========================================
function VisitorsBarChart({
  trends,
}: {
  trends: DailyTrendItem[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!trends || trends.length === 0) {
    return (
      <div className="w-full h-44 flex flex-col items-center justify-center gap-1 text-dark/40 text-xs font-sans">
        <span>Belum ada riwayat kunjungan harian.</span>
      </div>
    );
  }

  const chartData = trends;

  const maxVal = Math.max(5, ...chartData.map((d) => d.users));
  const svgWidth = 500;
  const svgHeight = 150;
  const paddingBottom = 26;
  const paddingTop = 15;
  const chartHeight = svgHeight - paddingBottom - paddingTop;
  const barWidth = Math.min(26, Math.max(12, (svgWidth - 60) / (chartData.length * 1.6)));

  return (
    <div className="w-full flex flex-col justify-start items-start gap-2 select-none">
      <div className="w-full relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid horizontal lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={`grid-line-${idx}`}>
                <line
                  x1={30}
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="#E9E9E9"
                  strokeDasharray={ratio === 0 ? "none" : "3 3"}
                  strokeWidth="1"
                />
                <text
                  x={24}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-dark/40 text-[9px] font-sans font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {chartData.map((d, i) => {
            const count = chartData.length;
            const availableWidth = svgWidth - 45;
            const step = availableWidth / (count > 1 ? count : 1);
            const x = 38 + i * step + (step - barWidth) / 2;
            const barH = Math.max(3, (d.users / maxVal) * chartHeight);
            const y = paddingTop + (chartHeight - barH);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={`bar-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity"
              >
                {/* Invisible hover hotspot */}
                <rect
                  x={x - 4}
                  y={paddingTop}
                  width={barWidth + 8}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {/* Actual Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={3}
                  fill="#0A9863"
                  className={`transition-all duration-200 ${
                    isHovered ? "opacity-80" : "opacity-100"
                  }`}
                />

                {/* Date Label */}
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className={`text-[9.5px] font-sans transition-colors ${
                    isHovered ? "fill-g1 font-bold" : "fill-dark/45 font-medium"
                  }`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && chartData[hoveredIdx] && (
          <div className="absolute top-2 right-3 bg-dark/95 backdrop-blur-xs text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none flex items-center gap-2 animate-fade-in font-sans">
            <span className="font-medium text-white/70">{chartData[hoveredIdx].label}:</span>
            <span className="font-bold text-g2">{chartData[hoveredIdx].users} Pengunjung</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Sub-Komponen: SVG Area/Line Chart (Tayangan Halaman)
// ==========================================
function PageViewsAreaChart({
  trends,
}: {
  trends: DailyTrendItem[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!trends || trends.length === 0) {
    return (
      <div className="w-full h-44 flex flex-col items-center justify-center gap-1 text-dark/40 text-xs font-sans">
        <span>Belum ada riwayat tayangan harian.</span>
      </div>
    );
  }

  const chartData = trends;

  const maxVal = Math.max(5, ...chartData.map((d) => d.views));
  const svgWidth = 500;
  const svgHeight = 150;
  const paddingBottom = 26;
  const paddingTop = 15;
  const chartHeight = svgHeight - paddingBottom - paddingTop;
  const count = chartData.length;

  // Calculate (x, y) coordinates
  const points = chartData.map((d, i) => {
    const availableWidth = svgWidth - 55;
    const step = count > 1 ? availableWidth / (count - 1) : availableWidth;
    const x = 38 + i * step;
    const y = paddingTop + chartHeight - Math.max(3, (d.views / maxVal) * chartHeight);
    return { x, y, data: d };
  });

  // SVG Line path string
  const linePath = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  // SVG Area path string
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${paddingTop + chartHeight} L ${points[0].x},${paddingTop + chartHeight} Z`
      : "";

  return (
    <div className="w-full flex flex-col justify-start items-start gap-2 select-none">
      <div className="w-full relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="viewAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4C94F9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4C94F9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid horizontal lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={`views-grid-${idx}`}>
                <line
                  x1={30}
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="#E9E9E9"
                  strokeDasharray={ratio === 0 ? "none" : "3 3"}
                  strokeWidth="1"
                />
                <text
                  x={24}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-dark/40 text-[9px] font-sans font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#viewAreaGradient)" />}

          {/* Main stroke line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#4C94F9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points and Hotspots */}
          {points.map((pt, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={`point-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Hotspot */}
                <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />

                {/* Point ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#ffffff"
                  stroke="#4C94F9"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-200"
                />

                {/* Date Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className={`text-[9.5px] font-sans transition-colors ${
                    isHovered ? "fill-blue-state font-bold" : "fill-dark/45 font-medium"
                  }`}
                >
                  {pt.data.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && chartData[hoveredIdx] && (
          <div className="absolute top-2 right-3 bg-dark/95 backdrop-blur-xs text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none flex items-center gap-2 animate-fade-in font-sans">
            <span className="font-medium text-white/70">{chartData[hoveredIdx].label}:</span>
            <span className="font-bold text-blue-300">{chartData[hoveredIdx].views} Tayangan</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Halaman Utama Dashboard
// ==========================================
export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [periodLabel, setPeriodLabel] = useState<string>("Bulan Ini");
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrendItem[]>([]);
  const [todayStats, setTodayStats] = useState<{ users: number; views: number }>({ users: 0, views: 0 });
  const [realtimeUsers, setRealtimeUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("views-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [summary, setSummary] = useState<{ totalUsers: number; totalViews: number } | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: NotificationType;
  }>({
    isOpen: false,
    message: "",
    type: "default",
  });

  const triggerNotif = useCallback((message: string, type: NotificationType = "default") => {
    setNotification({ isOpen: true, message, type });
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (showSuccessToast = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics", { cache: "no-store" });
      const resData = await res.json();
      if (resData.success) {
        if (resData.periodLabel) setPeriodLabel(resData.periodLabel);
        if (Array.isArray(resData.data)) setData(resData.data);
        if (Array.isArray(resData.dailyTrends)) setDailyTrends(resData.dailyTrends);
        if (resData.today) setTodayStats(resData.today);
        if (typeof resData.realtimeUsers === "number") setRealtimeUsers(resData.realtimeUsers);
        if (resData.summary) setSummary(resData.summary);

        if (showSuccessToast) {
          triggerNotif("Data analitik berhasil diperbarui!", "success");
        }
      } else {
        const errorMsg = resData.error || "Gagal memuat data dari Google Analytics.";
        triggerNotif(errorMsg, "error");
      }
    } catch (err: unknown) {
      console.error("Fetch analytics error:", err);
      triggerNotif("Terjadi kesalahan jaringan saat mengambil analitik.", "error");
    } finally {
      setLoading(false);
    }
  }, [triggerNotif]);

  useEffect(() => {
    const current = getAuthSession();
    if (current) {
      setSession(current);
    }
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/");
  };

  // Metrics calculation (Deduplicated summary dari GA4)
  const totalUsers = useMemo(() => {
    if (summary && typeof summary.totalUsers === "number") {
      return summary.totalUsers;
    }
    return data.reduce((acc, curr) => acc + (curr.users || 0), 0);
  }, [data, summary]);

  const totalViews = useMemo(() => {
    if (summary && typeof summary.totalViews === "number") {
      return summary.totalViews;
    }
    return data.reduce((acc, curr) => acc + (curr.views || 0), 0);
  }, [data, summary]);

  const avgViewsPerUser = useMemo(() => {
    if (!totalUsers || totalUsers === 0) return "0.0";
    return (totalViews / totalUsers).toFixed(1);
  }, [totalUsers, totalViews]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: data.length, produk: 0, layanan: 0, artikel: 0, lainnya: 0 };
    data.forEach((item) => {
      const cat = getPageCategory(item.path).key;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [data]);

  // Filter & Sort table data
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result = data.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "all" || getPageCategory(item.path).key === selectedCategory;

      return matchesSearch && matchesCat;
    });

    result.sort((a, b) => {
      if (selectedSort === "views-desc") return b.views - a.views;
      if (selectedSort === "views-asc") return a.views - b.views;
      if (selectedSort === "users-desc") return b.users - a.users;
      if (selectedSort === "users-asc") return a.users - b.users;
      if (selectedSort === "a-z") return a.title.localeCompare(b.title);
      if (selectedSort === "z-a") return b.title.localeCompare(a.title);
      return 0;
    });

    return result;
  }, [data, searchQuery, selectedCategory, selectedSort]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <AuthGuard>
      <div className="min-h-screen lg:h-screen lg:max-h-screen bg-white-90 flex flex-col items-center lg:overflow-hidden select-none font-sans">
        {/* Toast Notification */}
        <Notification
          isOpen={notification.isOpen}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Navbar */}
        <Navbar
          brandTitle="Dua Putra Srikandi"
          userName={session?.user.username || "Super Admin"}
          userRole={session?.user.role || "Super Admin"}
          onLogout={handleLogout}
          logoutText="Logout Sistem"
        />

        {/* Main Body */}
        <main className="w-full max-w-360 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 flex-1 flex flex-col md:flex-row justify-center items-start gap-4 sm:gap-6 min-h-0 lg:overflow-hidden lg:h-full">
          {/* Sidebar */}
          <Sidebar activeId="dashboard" className="shrink-0 h-fit" />

          {/* Content Card (Scrollable internally) */}
          <div className="flex-1 w-full p-4 sm:p-6 md:p-8 bg-white rounded-3xl sm:rounded-4xl border border-white-80 hover:border-g1 transition-colors flex flex-col justify-start items-start gap-5 sm:gap-6 overflow-y-auto min-h-0 lg:h-full pr-2">
            
            {/* Header Row */}
            <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex-1 flex flex-col justify-start items-start gap-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-g1 text-xl sm:text-2xl md:text-3xl font-bold font-sans">
                    Dashboard Performa Website
                  </h1>
                  <Badge text={periodLabel} variant="blue" />
                  {realtimeUsers > 0 && (
                    <div className="h-7 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full inline-flex items-center gap-1.5 animate-pulse">
                      <div className="size-2 bg-emerald-500 rounded-full" />
                      <span className="text-xs font-semibold text-emerald-700 font-sans">
                        {realtimeUsers} Online Sekarang
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-dark/70 text-xs sm:text-sm font-normal font-sans">
                  Statistik dan performa kunjungan website
                </p>
              </div>

              {/* Refresh Action */}
              <div className="shrink-0">
                <Button
                  type="button"
                  text={loading ? "Memuat..." : "Muat Ulang"}
                  variant="unique-stroke"
                  disabled={loading}
                  onClick={() => fetchAnalytics(true)}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="self-stretch h-px bg-g1/10 shrink-0" aria-hidden="true" />

            {/* ==============================================================
                #TOP SECTION: 3 KPI CARDS
               ============================================================== */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 shrink-0">
              {/* KPI 1: Active Users */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-white-80 hover:border-g1/40 transition-colors shadow-2xs flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-dark/70 font-sans">
                    Total Pengunjung ({periodLabel.split(" ")[0]})
                  </span>
                  <div className="size-8 rounded-full bg-g1/10 flex items-center justify-center shrink-0">
                    <LordIcon name="User" size={18} primaryColor="#0a9863" secondaryColor="#06d07a" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-g1 font-sans tracking-tight">
                    {loading ? "..." : totalUsers.toLocaleString("id-ID")}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] font-semibold text-g1 font-sans">
                      Hari ini: +{todayStats.users}
                    </span>
                    <span className="text-[11px] text-dark/45 font-sans">• Pengunjung bulan ini</span>
                  </div>
                </div>
              </div>

              {/* KPI 2: Page Views */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-white-80 hover:border-blue-state/40 transition-colors shadow-2xs flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-dark/70 font-sans">
                    Total Halaman Dilihat ({periodLabel.split(" ")[0]})
                  </span>
                  <div className="size-8 rounded-full bg-blue-state/10 flex items-center justify-center shrink-0">
                    <LordIcon name="Eye" size={18} primaryColor="#4c94f9" secondaryColor="#0a9863" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-state font-sans tracking-tight">
                    {loading ? "..." : totalViews.toLocaleString("id-ID")}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] font-semibold text-blue-state font-sans">
                      Hari ini: +{todayStats.views}
                    </span>
                    <span className="text-[11px] text-dark/45 font-sans">• Tayangan bulan ini</span>
                  </div>
                </div>
              </div>

              {/* KPI 3: Engagement Ratio */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-white-80 hover:border-orange-500/40 transition-colors shadow-2xs flex flex-col justify-between gap-3 col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-dark/70 font-sans">
                    Rasio Tayangan / User
                  </span>
                  <div className="size-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <LordIcon name="Dashboard" size={18} primaryColor="#ea580c" secondaryColor="#f97316" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 font-sans tracking-tight">
                    {loading ? "..." : avgViewsPerUser}
                    <span className="text-xs font-normal text-dark/50 ml-1.5 font-sans">views / user</span>
                  </div>
                  <p className="text-[11px] text-dark/50 mt-1 font-sans">
                    Rata-rata tayangan per pengunjung
                  </p>
                </div>
              </div>
            </div>

            {/* ==============================================================
                #MIDDLE SECTION: 2 DIAGRAMS (VISITORS & PAGE VIEWS)
               ============================================================== */}
            <div className="self-stretch grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
              {/* Diagram 1: Tren Pengunjung */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-white-80 hover:border-g1/40 transition-colors shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white-90 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-dark font-sans">
                      Tren Pengunjung Harian
                    </h3>
                    <p className="text-[11px] text-dark/50 font-sans">
                      Tren jumlah pengunjung harian
                    </p>
                  </div>
                  <Badge text="Pengunjung" variant="green" showDot={true} />
                </div>

                <VisitorsBarChart trends={dailyTrends} />
              </div>

              {/* Diagram 2: Tren Tayangan Halaman */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-white-80 hover:border-blue-state/40 transition-colors shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white-90 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-dark font-sans">
                      Tren Tayangan Halaman
                    </h3>
                    <p className="text-[11px] text-dark/50 font-sans">
                      Tren jumlah tayangan harian
                    </p>
                  </div>
                  <Badge text="Tayangan" variant="blue" showDot={true} />
                </div>

                <PageViewsAreaChart trends={dailyTrends} />
              </div>
            </div>

            {/* ==============================================================
                #BOTTOM SECTION: TABEL KONTEN & PRODUK / LAYANAN TERPOPULER
               ============================================================== */}
            <div className="self-stretch flex flex-col gap-4 shrink-0 pt-2">
              {/* Section Header with Category Tabs */}
              <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-dark font-sans">
                    Konten Terpopuler
                  </h2>
                  <p className="text-xs text-dark/50 font-sans">
                    Daftar halaman dengan kunjungan terbanyak
                  </p>
                </div>

                {/* Filter Category Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white-90 rounded-full border border-white-80">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("all");
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans transition-all cursor-pointer ${
                      selectedCategory === "all"
                        ? "bg-white text-g1 shadow-xs"
                        : "text-dark/60 hover:text-dark"
                    }`}
                  >
                    Semua ({categoryCounts.all})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("produk");
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans transition-all cursor-pointer ${
                      selectedCategory === "produk"
                        ? "bg-white text-blue-state shadow-xs"
                        : "text-dark/60 hover:text-dark"
                    }`}
                  >
                    Produk ({categoryCounts.produk})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("layanan");
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans transition-all cursor-pointer ${
                      selectedCategory === "layanan"
                        ? "bg-white text-g1 shadow-xs"
                        : "text-dark/60 hover:text-dark"
                    }`}
                  >
                    Layanan ({categoryCounts.layanan})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("artikel");
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans transition-all cursor-pointer ${
                      selectedCategory === "artikel"
                        ? "bg-white text-yellow-700 shadow-xs"
                        : "text-dark/60 hover:text-dark"
                    }`}
                  >
                    Artikel ({categoryCounts.artikel})
                  </button>
                </div>
              </div>

              {/* Search & Sort Controls */}
              <div className="self-stretch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                <div className="w-full sm:max-w-xs">
                  <InputBox
                    placeholder="Cari nama halaman atau URL..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    leftIcon="Search"
                  />
                </div>
                <div className="w-full sm:w-56">
                  <Dropdown
                    options={SORT_OPTIONS}
                    value={selectedSort}
                    onChange={(val) => {
                      setSelectedSort(val);
                      setCurrentPage(1);
                    }}
                    placeholder="Urutkan"
                    searchPlaceholder="Cari opsi..."
                  />
                </div>
              </div>

              {/* Table Container */}
              <div className="self-stretch flex-1 bg-white flex flex-col justify-start items-start gap-2 overflow-x-auto min-h-0 w-full pr-1">
                {/* Table Header */}
                <div className="self-stretch min-w-210 h-11 bg-white-90 rounded-xl flex items-center px-4 overflow-hidden select-none sticky top-0 z-10 shrink-0">
                  <div className="w-14 text-g1 text-xs font-semibold font-sans">No.</div>
                  <div className="flex-1 text-g1 text-xs font-semibold font-sans">Judul & URL Halaman</div>
                  <div className="w-40 text-g1 text-xs font-semibold font-sans">Kategori</div>
                  <div className="w-32 text-right pr-4 text-g1 text-xs font-semibold font-sans">Pengunjung</div>
                  <div className="w-32 text-right pr-4 text-g1 text-xs font-semibold font-sans">Tayangan</div>
                  <div className="w-36 text-right pr-2 text-g1 text-xs font-semibold font-sans">Popularitas</div>
                </div>

                {/* Table Body */}
                {loading ? (
                  <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-g1">
                    <div className="w-8 h-8 border-3 border-g1 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-dark/60 font-sans">
                      Memuat data performa...
                    </span>
                  </div>
                ) : filteredData.length === 0 ? (
                  <EmptyState
                    text={
                      searchQuery || selectedCategory !== "all"
                        ? "Tidak ada konten yang sesuai dengan pencarian."
                        : "Belum ada data kunjungan yang tersedia."
                    }
                  >
                    {!searchQuery && selectedCategory === "all" && (
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <Button
                          type="button"
                          text="Muat Ulang Data"
                          variant="unique-stroke"
                          onClick={() => fetchAnalytics(true)}
                        />
                        <Button
                          type="button"
                          text="Pengaturan SEO"
                          variant="fill"
                          rightIcon="ArrowRight"
                          onClick={() => router.push("/kelola-seo")}
                        />
                      </div>
                    )}
                  </EmptyState>
                ) : (
                  paginatedData.map((item, index) => {
                    const rankNum = (currentPage - 1) * itemsPerPage + index + 1;
                    const catInfo = getPageCategory(item.path);
                    const viewPercentage =
                      totalViews > 0 ? ((item.views / totalViews) * 100).toFixed(1) : "0.0";

                    return (
                      <div
                        key={`${item.path}-${index}`}
                        className="self-stretch min-w-210 min-h-13.5 border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                      >
                        {/* No. */}
                        <div className="w-14 text-dark/90 text-xs font-normal font-sans">
                          {rankNum}.
                        </div>

                        {/* Title & Path */}
                        <div className="flex-1 flex flex-col justify-center pr-4 min-w-0">
                          <span className="text-dark/90 text-xs font-semibold font-sans line-clamp-1">
                            {item.title || "Tanpa Judul"}
                          </span>
                          <span className="text-[11px] text-dark/50 font-mono truncate mt-0.5">
                            {item.path}
                          </span>
                        </div>

                        {/* Category Badge */}
                        <div className="w-40 flex items-center pr-2">
                          <Badge
                            text={catInfo.label}
                            variant={catInfo.badgeVariant}
                            showDot={true}
                          />
                        </div>

                        {/* Users */}
                        <div className="w-32 text-right pr-4">
                          <span className="text-dark/75 text-xs font-normal font-sans">
                            {item.users.toLocaleString("id-ID")}
                          </span>
                        </div>

                        {/* Views */}
                        <div className="w-32 text-right pr-4">
                          <span className="text-g1 text-xs font-semibold font-sans">
                            {item.views.toLocaleString("id-ID")}
                          </span>
                        </div>

                        {/* Popularity Bar */}
                        <div className="w-36 flex items-center justify-end gap-2.5 pr-2">
                          <div className="w-16 bg-white-80 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-g1 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(0, Number(viewPercentage)))}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-dark/70 font-sans min-w-9 text-right">
                            {viewPercentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Divider */}
              <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

              {/* Pagination */}
              {!loading && filteredData.length > 0 && (
                <div className="self-stretch shrink-0">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                    itemLabel="Konten"
                    prevText="Sebelumnya"
                    nextText="Selanjutnya"
                  />
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
