"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import Dropdown, { type DropdownOption } from "@/components/ui/dropdown";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import Notification, { type NotificationType } from "@/components/ui/notification";
import DeleteConfirmationModal from "@/components/ui/modal/deleteConfirmation";
import LordIcon from "@/components/common/lordIcon";
import { getArticles } from "@/services/articleApi";
import { type ArticlePayload } from "@/shared/api/article";

export interface DashboardArticleItem {
  id: string | number;
  title: string;
  category: string;
  categoryVariant: BadgeVariant;
  createdAt: string;
  views: number;
  excerpt?: string;
}

const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: "all", label: "Semua Kategori" },
  { value: "Keselamatan Jalan", label: "Keselamatan Jalan" },
  { value: "Inovasi Marka", label: "Inovasi Marka" },
  { value: "Teknologi Hijau", label: "Teknologi Hijau" },
  { value: "Konstruksi", label: "Konstruksi" },
  { value: "Perlengkapan Jalan", label: "Perlengkapan Jalan" },
  { value: "Penerangan", label: "Penerangan" },
];

const CATEGORY_VARIANT_MAP: Record<string, BadgeVariant> = {
  "Keselamatan Jalan": "green",
  "Inovasi Marka": "blue",
  "Teknologi Hijau": "yellow",
  Konstruksi: "blue",
  "Perlengkapan Jalan": "orange",
  Penerangan: "yellow",
};

interface WeeklyTraffic {
  day: string;
  views: number;
  percentage: number;
  isPeak?: boolean;
}

const WEEKLY_DATA: Record<string, { summary: string; peak: string; data: WeeklyTraffic[] }> = {
  "7hari": {
    summary: "Rata-rata: 2.630 views / hari",
    peak: "Puncak: Kamis (3.420 views)",
    data: [
      { day: "Sen", views: 2150, percentage: 62 },
      { day: "Sel", views: 2480, percentage: 72 },
      { day: "Rab", views: 2890, percentage: 84 },
      { day: "Kam", views: 3420, percentage: 100, isPeak: true },
      { day: "Jum", views: 3100, percentage: 90 },
      { day: "Sab", views: 1950, percentage: 57 },
      { day: "Min", views: 1840, percentage: 53 },
    ],
  },
  "30hari": {
    summary: "Rata-rata: 18.400 views / bulan",
    peak: "Puncak: Minggu ke-3 (5.820 views)",
    data: [
      { day: "Mgg 1", views: 3900, percentage: 67 },
      { day: "Mgg 2", views: 4650, percentage: 80 },
      { day: "Mgg 3", views: 5820, percentage: 100, isPeak: true },
      { day: "Mgg 4", views: 4030, percentage: 69 },
    ],
  },
};

export default function DashboardPage() {
  const [articles, setArticles] = useState<DashboardArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7hari" | "30hari">("7hari");
  const [hoveredBar, setHoveredBar] = useState<WeeklyTraffic | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    article?: DashboardArticleItem;
  }>({
    isOpen: false,
  });

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

  const triggerNotif = (message: string, type: NotificationType = "default") => {
    setNotification({ isOpen: true, message, type });
  };

  // Load articles from Supabase / localStorage on mount
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const rows = await getArticles();
        if (rows && rows.length > 0) {
          const mapped: DashboardArticleItem[] = rows.map((item, idx) => {
            const mainCat = item.category || "Umum";
            const dummyViews = [3420, 2890, 2150, 1780, 1420, 980][idx % 6] || 1200;
            return {
              id: item.id,
              title: item.title,
              category: mainCat,
              categoryVariant: CATEGORY_VARIANT_MAP[mainCat] || "green",
              createdAt: item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : "Baru saja",
              views: dummyViews,
              excerpt: item.content ? item.content.replace(/<[^>]*>?/gm, "").slice(0, 80) : "",
            };
          });
          setArticles(mapped);
          return;
        }
      } catch (e) {
        console.error("Error loading articles for dashboard from Supabase:", e);
      }

      try {
        const raw = localStorage.getItem("dps_articles_data");
        if (raw) {
          const parsed: ArticlePayload[] = JSON.parse(raw);
          const mapped: DashboardArticleItem[] = parsed.map((item, idx) => {
            const mainCat = Array.isArray(item.category)
              ? item.category[0] || "Umum"
              : item.category || "Umum";
            const dummyViews = [3420, 2890, 2150, 1780, 1420, 980][idx % 6] || 1200;
            return {
              id: item.id || Date.now() + idx,
              title: item.title,
              category: mainCat,
              categoryVariant: CATEGORY_VARIANT_MAP[mainCat] || "green",
              createdAt: item.createdAt || "Baru saja",
              views: dummyViews,
              excerpt: item.content ? item.content.replace(/<[^>]*>?/gm, "").slice(0, 80) : "",
            };
          });
          setArticles(mapped);
          return;
        }
      } catch (e) {
        console.error(e);
      }

      setArticles([]);
    };

    loadArticles();
  }, []);

  // Delete Action
  const handleConfirmDelete = () => {
    if (!deleteModal.article) return;
    const target = deleteModal.article;
    const nextList = articles.filter((a) => a.id !== target.id);
    setArticles(nextList);

    // Sync with storage
    try {
      const raw = localStorage.getItem("dps_articles_data");
      if (raw) {
        const parsed: ArticlePayload[] = JSON.parse(raw);
        const filtered = parsed.filter((p) => String(p.id) !== String(target.id));
        localStorage.setItem("dps_articles_data", JSON.stringify(filtered));
      }
    } catch (e) {
      console.error(e);
    }

    setDeleteModal({ isOpen: false });
    triggerNotif(`Artikel "${target.title}" berhasil dihapus dari daftar!`, "error");
  };

  // Filter & Search Logic
  const filteredArticles = articles.filter((article) => {
    const matchCategory =
      selectedCategoryFilter === "all" || article.category === selectedCategoryFilter;
    const matchSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const trafficData = WEEKLY_DATA[selectedTimeRange];

  return (
    <div className="min-h-screen bg-white-90 flex flex-col items-center">
      {/* Top Navbar */}
      <Navbar
        brandTitle="Dua Putra Srikandi"
        userName="Super Admin"
        userRole="Administrator"
        onLogout={() => triggerNotif("Anda telah logout dari sistem CMS", "error")}
      />

      {/* Main Body */}
      <main className="w-full max-w-360 px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Sidebar Navigation */}
        <Sidebar activeId="dashboard" className="shrink-0 h-fit" />

        {/* Content Card Container */}
        <div className="flex-1 p-6 md:p-8 bg-white rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-g1 text-2xl md:text-3xl font-bold font-sans">
                  Dashboard
                </h1>
                <Badge text="Live CMS" variant="green" showDot={true} />
              </div>
              <p className="text-dark text-sm font-normal font-sans">
                Ringkasan statistik performa konten, aktivitas terkini, dan metrik operasional CMS{" "}
                <span className="text-g1 font-semibold">Dua Putra Srikandi</span>.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Button
                type="button"
                text="Perbarui Data"
                variant="ghost-green"
                onClick={() => triggerNotif("Statistik dashboard berhasil diperbarui!", "success")}
                className="cursor-pointer text-xs md:text-sm"
              />
              <Link href="/kelola-artikel/tambah">
                <Button
                  type="button"
                  text="Tambah Artikel"
                  variant="fill"
                  rightIcon="Add"
                  className="cursor-pointer text-xs md:text-sm"
                />
              </Link>
            </div>
          </div>

          {/* Top Divider */}
          <div className="w-full h-px bg-g1/10" aria-hidden="true" />

          {/* Key Metric Cards (4 Cards Grid) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Total Artikel */}
            <Link
              href="/kelola-artikel"
              className="p-5 bg-brand-background/40 hover:bg-brand-background/80 rounded-3xl border border-white-80 transition-all flex flex-col justify-between gap-4 group cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-g1 border border-white-80 shadow-2xs group-hover:scale-105 transition-transform">
                  <LordIcon name="Paper" size={24} primaryColor="#0A9863" />
                </div>
                <Badge text="+12% bln ini" variant="green" showDot={true} />
              </div>
              <div>
                <div className="text-dark/60 text-xs font-semibold uppercase tracking-wider font-sans">
                  Total Artikel
                </div>
                <div className="text-dark text-3xl font-bold font-sans mt-0.5">
                  {Math.max(articles.length, 28)}
                </div>
                <p className="text-dark/50 text-xs mt-1 font-sans">
                  3 draft menunggu review publikasi
                </p>
              </div>
            </Link>

            {/* Card 2: Total Layanan */}
            <Link
              href="/kelola-layanan"
              className="p-5 bg-brand-background/40 hover:bg-brand-background/80 rounded-3xl border border-white-80 transition-all flex flex-col justify-between gap-4 group cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 border border-white-80 shadow-2xs group-hover:scale-105 transition-transform">
                  <LordIcon name="Setting" size={24} primaryColor="#4C94F9" />
                </div>
                <Badge text="5 Kategori" variant="blue" />
              </div>
              <div>
                <div className="text-dark/60 text-xs font-semibold uppercase tracking-wider font-sans">
                  Total Layanan
                </div>
                <div className="text-dark text-3xl font-bold font-sans mt-0.5">14</div>
                <p className="text-dark/50 text-xs mt-1 font-sans">
                  Semua layanan aktif operasional
                </p>
              </div>
            </Link>

            {/* Card 3: Total Produk */}
            <Link
              href="/kelola-produk"
              className="p-5 bg-brand-background/40 hover:bg-brand-background/80 rounded-3xl border border-white-80 transition-all flex flex-col justify-between gap-4 group cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-orange-500 border border-white-80 shadow-2xs group-hover:scale-105 transition-transform">
                  <LordIcon name="Box" size={24} primaryColor="#F97316" />
                </div>
                <Badge text="Katalog Siap" variant="orange" />
              </div>
              <div>
                <div className="text-dark/60 text-xs font-semibold uppercase tracking-wider font-sans">
                  Katalog Produk
                </div>
                <div className="text-dark text-3xl font-bold font-sans mt-0.5">42</div>
                <p className="text-dark/50 text-xs mt-1 font-sans">
                  8 produk unggulan jalan raya
                </p>
              </div>
            </Link>

            {/* Card 4: Total Pembaca */}
            <div className="p-5 bg-brand-background/40 rounded-3xl border border-white-80 transition-all flex flex-col justify-between gap-4 group shadow-2xs">
              <div className="flex justify-between items-start">
                <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-g1 border border-white-80 shadow-2xs group-hover:scale-105 transition-transform">
                  <LordIcon name="Global" size={24} primaryColor="#0A9863" />
                </div>
                <Badge text="+24.8% tren" variant="green" showDot={true} />
              </div>
              <div>
                <div className="text-dark/60 text-xs font-semibold uppercase tracking-wider font-sans">
                  Total Pembaca
                </div>
                <div className="text-dark text-3xl font-bold font-sans mt-0.5">18.4K</div>
                <p className="text-dark/50 text-xs mt-1 font-sans">
                  Kunjungan akumulatif 30 hari terakhir
                </p>
              </div>
            </div>
          </div>

          {/* Middle Row: Analytics Chart & Category Breakdown */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart Widget (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl border border-white-80 bg-white shadow-2xs flex flex-col justify-between gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-dark text-lg font-bold font-sans">
                    Statistik Kunjungan & Pembaca
                  </h2>
                  <p className="text-dark/60 text-xs font-sans mt-0.5">
                    {trafficData.summary}
                  </p>
                </div>

                {/* Range Toggle */}
                <div className="flex items-center gap-1 bg-white-90 p-1 rounded-xl border border-white-80">
                  <button
                    type="button"
                    onClick={() => setSelectedTimeRange("7hari")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold font-sans transition-colors cursor-pointer ${
                      selectedTimeRange === "7hari"
                        ? "bg-g1 text-white shadow-xs"
                        : "text-dark/60 hover:text-dark"
                    }`}
                  >
                    7 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTimeRange("30hari")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold font-sans transition-colors cursor-pointer ${
                      selectedTimeRange === "30hari"
                        ? "bg-g1 text-white shadow-xs"
                        : "text-dark/60 hover:text-dark"
                    }`}
                  >
                    30 Hari
                  </button>
                </div>
              </div>

              {/* Interactive Bar Chart Visualization */}
              <div className="flex flex-col gap-3">
                <div className="h-44 flex items-end justify-between gap-3 px-2 pt-6 pb-2 bg-brand-background/30 rounded-2xl border border-white-80/60 relative">
                  {/* Peak info tag */}
                  <div className="absolute top-3 left-4 text-xs font-medium text-g1 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-g1 animate-pulse" />
                    {trafficData.peak}
                  </div>

                  {trafficData.data.map((bar) => (
                    <div
                      key={bar.day}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative cursor-pointer"
                      onMouseEnter={() => setHoveredBar(bar)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-dark text-white text-[11px] font-semibold rounded-md pointer-events-none whitespace-nowrap shadow-md z-10">
                        {bar.views.toLocaleString()} views
                      </div>

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[36px] bg-white-80 rounded-t-xl overflow-hidden h-full flex items-end">
                        <div
                          style={{ height: `${bar.percentage}%` }}
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            bar.isPeak
                              ? "bg-g1 shadow-xs group-hover:opacity-90"
                              : "bg-g1/40 group-hover:bg-g1/70"
                          }`}
                        />
                      </div>

                      {/* Day Label */}
                      <span
                        className={`text-xs font-sans transition-colors ${
                          bar.isPeak ? "text-g1 font-bold" : "text-dark/60 group-hover:text-dark"
                        }`}
                      >
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs text-dark/50 font-sans px-1">
                  <span>Data diperbarui secara realtime</span>
                  <span>Target bulanan: 20.000 views</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown & Status Widget (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl border border-white-80 bg-white shadow-2xs flex flex-col justify-between gap-5">
              <div>
                <h2 className="text-dark text-lg font-bold font-sans">
                  Distribusi Kategori Artikel
                </h2>
                <p className="text-dark/60 text-xs font-sans mt-0.5">
                  Persentase konten artikel per kategori topik
                </p>
              </div>

              {/* Progress Bars */}
              <div className="flex flex-col gap-3.5">
                {/* Item 1 */}
                <div>
                  <div className="flex justify-between text-xs font-sans mb-1">
                    <span className="font-semibold text-dark flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-g1" />
                      Keselamatan Jalan
                    </span>
                    <span className="font-bold text-g1">42% (12 artikel)</span>
                  </div>
                  <div className="w-full h-2.5 bg-white-80 rounded-full overflow-hidden">
                    <div className="h-full bg-g1 rounded-full" style={{ width: "42%" }} />
                  </div>
                </div>

                {/* Item 2 */}
                <div>
                  <div className="flex justify-between text-xs font-sans mb-1">
                    <span className="font-semibold text-dark flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-blue-500" />
                      Inovasi Marka Jalan
                    </span>
                    <span className="font-bold text-blue-600">28% (8 artikel)</span>
                  </div>
                  <div className="w-full h-2.5 bg-white-80 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "28%" }} />
                  </div>
                </div>

                {/* Item 3 */}
                <div>
                  <div className="flex justify-between text-xs font-sans mb-1">
                    <span className="font-semibold text-dark flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-400" />
                      Teknologi Hijau (Solar)
                    </span>
                    <span className="font-bold text-amber-600">18% (5 artikel)</span>
                  </div>
                  <div className="w-full h-2.5 bg-white-80 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "18%" }} />
                  </div>
                </div>

                {/* Item 4 */}
                <div>
                  <div className="flex justify-between text-xs font-sans mb-1">
                    <span className="font-semibold text-dark flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-orange-500" />
                      Konstruksi & Perlengkapan
                    </span>
                    <span className="font-bold text-orange-600">12% (3 artikel)</span>
                  </div>
                  <div className="w-full h-2.5 bg-white-80 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: "12%" }} />
                  </div>
                </div>
              </div>

              {/* Status Pills */}
              <div className="pt-4 border-t border-white-80 flex items-center justify-between gap-2">
                <div className="text-center flex-1">
                  <div className="text-xs text-dark/50 font-sans">Terbit</div>
                  <div className="text-sm font-bold text-g1 font-sans">24</div>
                </div>
                <div className="w-px h-6 bg-white-80" />
                <div className="text-center flex-1">
                  <div className="text-xs text-dark/50 font-sans">Draft</div>
                  <div className="text-sm font-bold text-amber-500 font-sans">3</div>
                </div>
                <div className="w-px h-6 bg-white-80" />
                <div className="text-center flex-1">
                  <div className="text-xs text-dark/50 font-sans">Arsip</div>
                  <div className="text-sm font-bold text-dark/40 font-sans">1</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Top Articles Table (Matches kelola-artikel exactly) */}
          <div className="self-stretch flex flex-col gap-4 mt-2">
            <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-g1 text-xl font-bold font-sans">
                  Artikel Terpopuler & Terbaru
                </h2>
                <p className="text-dark/60 text-xs md:text-sm font-sans">
                  Pantau artikel dengan pembaca terbanyak dan status publikasi terkini.
                </p>
              </div>

              <Link href="/kelola-artikel">
                <Button
                  type="button"
                  text="Kelola Semua Artikel"
                  variant="ghost-green"
                  rightIcon="Right 1"
                  className="cursor-pointer text-xs md:text-sm"
                />
              </Link>
            </div>

            {/* Filter and Search Row */}
            <div className="self-stretch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
              <div className="w-full sm:max-w-xs">
                <InputBox
                  placeholder="Cari judul artikel..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  leftIcon="Global"
                />
              </div>
              <div className="w-full sm:w-64">
                <Dropdown
                  options={CATEGORY_OPTIONS}
                  value={selectedCategoryFilter}
                  onChange={(val) => {
                    setSelectedCategoryFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter Kategori"
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="self-stretch bg-white flex flex-col justify-start items-start gap-2 overflow-x-auto w-full">
              {/* Table Header */}
              <div className="self-stretch min-w-[760px] h-11 bg-white-90 rounded-xl flex items-center px-4 overflow-hidden select-none">
                <div className="w-14 text-g1 text-sm font-semibold font-sans">No.</div>
                <div className="flex-1 text-g1 text-sm font-semibold font-sans">Nama Artikel</div>
                <div className="w-44 text-g1 text-sm font-semibold font-sans">Kategori</div>
                <div className="w-36 text-g1 text-sm font-semibold font-sans">Total Pembaca</div>
                <div className="w-44 text-g1 text-sm font-semibold font-sans">Waktu Dibuat</div>
                <div className="w-24 text-left text-g1 text-sm font-semibold font-sans">Aksi</div>
              </div>

              {/* Table Rows */}
              {paginatedArticles.length === 0 ? (
                <div className="self-stretch py-10 text-center text-slate-400 text-sm font-sans">
                  Tidak ada artikel yang sesuai dengan pencarian atau filter.
                </div>
              ) : (
                paginatedArticles.map((article, idx) => (
                  <div
                    key={article.id}
                    className="self-stretch min-w-[760px] min-h-[58px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                  >
                    {/* No. */}
                    <div className="w-14 text-dark/90 text-sm font-normal font-sans">
                      {(currentPage - 1) * itemsPerPage + idx + 1}.
                    </div>

                    {/* Nama Artikel */}
                    <div className="flex-1 flex flex-col justify-center pr-4">
                      <span className="text-dark/90 text-sm font-semibold font-sans line-clamp-1">
                        {article.title}
                      </span>
                      {article.excerpt && (
                        <span className="text-dark/50 text-xs font-normal font-sans line-clamp-1">
                          {article.excerpt}
                        </span>
                      )}
                    </div>

                    {/* Kategori Badge */}
                    <div className="w-44 flex items-center">
                      <Badge
                        text={article.category}
                        variant={article.categoryVariant}
                        showDot={true}
                      />
                    </div>

                    {/* Total Pembaca */}
                    <div className="w-36 flex items-center gap-1.5 text-dark/80 text-sm font-semibold font-sans">
                      <span className="size-2 rounded-full bg-g1 inline-block" />
                      {article.views.toLocaleString()} <span className="text-dark/40 font-normal text-xs">views</span>
                    </div>

                    {/* Waktu Dibuat */}
                    <div className="w-44 text-dark/75 text-sm font-normal font-sans">
                      {article.createdAt}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-24 flex justify-start items-center gap-2.5">
                      {/* Edit Button */}
                      <Link
                        href={`/kelola-artikel/${article.id}`}
                        title="Edit Artikel"
                        className="size-9 p-1 bg-brand-background hover:bg-g1/15 rounded-full flex justify-center items-center text-g1 transition-colors cursor-pointer"
                      >
                        <LordIcon name="Edit" size={18} primaryColor="#0A9863" />
                      </Link>

                      {/* Delete Button */}
                      <button
                        type="button"
                        title="Hapus Artikel"
                        onClick={() => setDeleteModal({ isOpen: true, article })}
                        className="size-9 p-1 bg-red-state hover:opacity-90 rounded-full flex justify-center items-center text-white transition-opacity cursor-pointer shadow-xs"
                      >
                        <LordIcon name="Delete" size={18} primaryColor="#FFFFFF" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Table Footer / Pagination */}
            <div className="self-stretch flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-white-80">
              <div className="text-dark/60 text-xs font-normal font-sans">
                Menampilkan{" "}
                <strong className="text-dark font-semibold">
                  {filteredArticles.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                </strong>{" "}
                -{" "}
                <strong className="text-dark font-semibold">
                  {Math.min(currentPage * itemsPerPage, filteredArticles.length)}
                </strong>{" "}
                dari <strong className="text-dark font-semibold">{filteredArticles.length}</strong>{" "}
                artikel
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-white-80 text-xs font-semibold text-dark/70 hover:bg-white-90 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`size-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-g1 text-white shadow-xs"
                          : "text-dark/70 hover:bg-white-90 border border-white-80"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-white-80 text-xs font-semibold text-dark/70 hover:bg-white-90 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Recent Activity Log & Quick Module Shortcuts */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Recent Activity Timeline (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl border border-white-80 bg-white shadow-2xs flex flex-col justify-start gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-dark text-lg font-bold font-sans">
                    Aktivitas Sistem Terkini
                  </h3>
                  <p className="text-dark/60 text-xs font-sans mt-0.5">
                    Catatan pembaruan konten dan aksi administrator
                  </p>
                </div>
                <span className="text-xs text-g1 font-semibold">Live Log</span>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                {/* Log 1 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white-90/60 transition-colors border border-transparent hover:border-white-80">
                  <div className="size-9 rounded-full bg-g1/15 flex items-center justify-center text-g1 shrink-0 mt-0.5">
                    <LordIcon name="Paper" size={18} primaryColor="#0A9863" />
                  </div>
                  <div className="flex-1">
                    <div className="text-dark text-xs font-semibold font-sans">
                      Publikasi Artikel Baru
                    </div>
                    <p className="text-dark/70 text-xs font-sans mt-0.5">
                      Artikel &quot;Standar Keselamatan Pemasangan Guardrail...&quot; berhasil dipublikasikan.
                    </p>
                    <span className="text-[11px] text-dark/40 font-sans mt-1 inline-block">
                      5 menit yang lalu • Oleh Super Admin
                    </span>
                  </div>
                  <Badge text="Artikel" variant="green" />
                </div>

                {/* Log 2 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white-90/60 transition-colors border border-transparent hover:border-white-80">
                  <div className="size-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 mt-0.5">
                    <LordIcon name="Box" size={18} primaryColor="#F97316" />
                  </div>
                  <div className="flex-1">
                    <div className="text-dark text-xs font-semibold font-sans">
                      Pembaruan Katalog Produk
                    </div>
                    <p className="text-dark/70 text-xs font-sans mt-0.5">
                      Spesifikasi teknis &quot;Lampu PJU All-in-One Solar 100W&quot; diperbarui.
                    </p>
                    <span className="text-[11px] text-dark/40 font-sans mt-1 inline-block">
                      1 jam yang lalu • Oleh Dora D
                    </span>
                  </div>
                  <Badge text="Produk" variant="orange" />
                </div>

                {/* Log 3 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white-90/60 transition-colors border border-transparent hover:border-white-80">
                  <div className="size-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                    <LordIcon name="Setting" size={18} primaryColor="#4C94F9" />
                  </div>
                  <div className="flex-1">
                    <div className="text-dark text-xs font-semibold font-sans">
                      Update Deskripsi Layanan
                    </div>
                    <p className="text-dark/70 text-xs font-sans mt-0.5">
                      Layanan &quot;Konstruksi & Pengaspalan Jalan&quot; ditambahkan foto dokumentasi proyek.
                    </p>
                    <span className="text-[11px] text-dark/40 font-sans mt-1 inline-block">
                      3 jam yang lalu • Oleh Budi Santoso
                    </span>
                  </div>
                  <Badge text="Layanan" variant="blue" />
                </div>
              </div>
            </div>

            {/* Quick Shortcuts Grid (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl border border-white-80 bg-white shadow-2xs flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-dark text-lg font-bold font-sans">
                  Pintasan Modul Cepat
                </h3>
                <p className="text-dark/60 text-xs font-sans mt-0.5">
                  Akses langsung modul pengelolaan CMS
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Module 1: Kelola Artikel */}
                <Link
                  href="/kelola-artikel"
                  className="p-4 rounded-2xl bg-brand-background/40 hover:bg-brand-background border border-white-80 transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div className="size-10 rounded-xl bg-white flex items-center justify-center text-g1 border border-white-80 group-hover:scale-105 transition-transform shadow-2xs">
                    <LordIcon name="Paper" size={20} primaryColor="#0A9863" />
                  </div>
                  <div>
                    <div className="text-dark text-xs font-bold font-sans group-hover:text-g1 transition-colors">
                      Kelola Artikel
                    </div>
                    <div className="text-dark/50 text-[11px] font-sans mt-0.5">
                      Publikasi berita & wawasan
                    </div>
                  </div>
                </Link>

                {/* Module 2: Kelola Layanan */}
                <Link
                  href="/kelola-layanan"
                  className="p-4 rounded-2xl bg-brand-background/40 hover:bg-brand-background border border-white-80 transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div className="size-10 rounded-xl bg-white flex items-center justify-center text-blue-500 border border-white-80 group-hover:scale-105 transition-transform shadow-2xs">
                    <LordIcon name="Setting" size={20} primaryColor="#4C94F9" />
                  </div>
                  <div>
                    <div className="text-dark text-xs font-bold font-sans group-hover:text-blue-600 transition-colors">
                      Kelola Layanan
                    </div>
                    <div className="text-dark/50 text-[11px] font-sans mt-0.5">
                      Daftar servis konstruksi
                    </div>
                  </div>
                </Link>

                {/* Module 3: Kelola Produk */}
                <Link
                  href="/kelola-produk"
                  className="p-4 rounded-2xl bg-brand-background/40 hover:bg-brand-background border border-white-80 transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div className="size-10 rounded-xl bg-white flex items-center justify-center text-orange-500 border border-white-80 group-hover:scale-105 transition-transform shadow-2xs">
                    <LordIcon name="Box" size={20} primaryColor="#F97316" />
                  </div>
                  <div>
                    <div className="text-dark text-xs font-bold font-sans group-hover:text-orange-600 transition-colors">
                      Kelola Produk
                    </div>
                    <div className="text-dark/50 text-[11px] font-sans mt-0.5">
                      Katalog rambu & guardrail
                    </div>
                  </div>
                </Link>

                {/* Module 4: Kelola Pengguna */}
                <Link
                  href="/kelola-pengguna"
                  className="p-4 rounded-2xl bg-brand-background/40 hover:bg-brand-background border border-white-80 transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div className="size-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 border border-white-80 group-hover:scale-105 transition-transform shadow-2xs">
                    <LordIcon name="User" size={20} primaryColor="#0A9863" />
                  </div>
                  <div>
                    <div className="text-dark text-xs font-bold font-sans group-hover:text-emerald-700 transition-colors">
                      Kelola Pengguna
                    </div>
                    <div className="text-dark/50 text-[11px] font-sans mt-0.5">
                      Akses admin & staf CMS
                    </div>
                  </div>
                </Link>
              </div>

              <div className="p-3 bg-brand-background/70 rounded-2xl border border-white-80 flex items-center justify-between text-xs font-sans">
                <span className="text-dark/70 font-medium">CMS Version</span>
                <span className="text-g1 font-bold">v0.1.0 • DPS Production</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Hapus Artikel"
        message={`Apakah Anda yakin ingin menghapus artikel "${deleteModal.article?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false })}
      />

      {/* Toast Notification */}
      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
