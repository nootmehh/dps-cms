"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import Dropdown, { type DropdownOption } from "@/components/ui/dropdown";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import Notification, { type NotificationType } from "@/components/ui/notification";
import DeleteConfirmationModal from "@/components/modal/deleteConfirmation";
import LordIcon from "@/components/common/lordIcon";
import EmptyState from "@/components/common/emptyState";
import { getArticles } from "@/services/articleApi";
import { deleteArticle, type ArticlePayload } from "@/shared/api/article";

export interface ArticleItem {
  id: string | number;
  title: string;
  category: string;
  categoryVariant: BadgeVariant;
  createdAt: string;
  editedAt: string;
  excerpt?: string;
}

const CATEGORY_VARIANT_MAP: Record<string, BadgeVariant> = {
  "Keselamatan Jalan": "green",
  "Inovasi Marka": "blue",
  "Teknologi Hijau": "yellow",
  Konstruksi: "blue",
  "Perlengkapan Jalan": "orange",
  Penerangan: "yellow",
  "Aturan Lalu Lintas": "blue",
  "Marka Jalan": "green",
  Keselamatan: "orange",
};

const SORT_OPTIONS: DropdownOption[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlama", label: "Terlama" },
  { value: "a-z", label: "A - Z" },
  { value: "z-a", label: "Z - A" },
];

export default function KelolaArtikelPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState<string>("terbaru");
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([
    { value: "all", label: "Semua Kategori" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; article?: ArticleItem }>({
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
          const mapped: ArticleItem[] = rows.map((item) => {
            const mainCat = item.category || "Umum";
            return {
              id: item.id,
              title: item.title,
              category: mainCat,
              categoryVariant: (item.category_color?.toLowerCase() as BadgeVariant) || CATEGORY_VARIANT_MAP[mainCat] || "green",
              createdAt: item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : "Baru saja",
              editedAt: item.edited_at
                ? new Date(item.edited_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : item.created_at
                  ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                  : "Baru saja",
              excerpt: item.content ? item.content.replace(/<[^>]*>?/gm, "").slice(0, 80) : "",
            };
          });
          setArticles(mapped);

          const uniqueCategories = Array.from(
            new Set(rows.map((a) => a.category).filter(Boolean))
          ).filter(
            (c) => c !== "all" && c !== "Semua Kategori" && c !== "Semua"
          ) as string[];
          setCategoryOptions([
            { value: "all", label: "Semua Kategori" },
            ...uniqueCategories.map((c) => ({ value: c, label: c })),
          ]);
          return;
        }
      } catch (e) {
        console.error("Error loading articles from Supabase:", e);
      }

      try {
        const raw = localStorage.getItem("dps_articles_data");
        if (raw) {
          const parsed: ArticlePayload[] = JSON.parse(raw);
          const mapped: ArticleItem[] = parsed.map((item) => {
            const mainCat = Array.isArray(item.category)
              ? item.category[0] || "Umum"
              : item.category || "Umum";
            return {
              id: item.id || Date.now(),
              title: item.title,
              category: mainCat,
              categoryVariant: (item.categoryColor?.[0]?.toLowerCase() as BadgeVariant) || CATEGORY_VARIANT_MAP[mainCat] || "green",
              createdAt: item.createdAt || "Baru saja",
              editedAt: item.editedAt || item.createdAt || "Baru saja",
              excerpt: item.content ? item.content.replace(/<[^>]*>?/gm, "").slice(0, 80) : "",
            };
          });
          setArticles(mapped);

          const uniqueCategories = Array.from(
            new Set(parsed.map((a) => Array.isArray(a.category) ? a.category[0] : a.category).filter(Boolean))
          ).filter(
            (c) => c !== "all" && c !== "Semua Kategori" && c !== "Semua"
          ) as string[];
          setCategoryOptions([
            { value: "all", label: "Semua Kategori" },
            ...uniqueCategories.map((c) => ({ value: c, label: c })),
          ]);
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
  const handleConfirmDelete = async () => {
    if (!deleteModal.article) return;
    const target = deleteModal.article;

    try {
      await deleteArticle(target.id);
      setArticles((prev) => prev.filter((a) => String(a.id) !== String(target.id)));
      triggerNotif(`Artikel "${target.title}" berhasil dihapus!`, "default");
    } catch (err: any) {
      const msg = err?.message || err?.details || "Gagal menghapus artikel dari Supabase";
      console.error("Error deleting article from Supabase:", err);
      triggerNotif(`Gagal menghapus artikel: ${msg}`, "error");
    } finally {
      setDeleteModal({ isOpen: false });
    }
  };

  // Filter & Search Logic
  const filteredArticles = articles
    .filter((article) => {
      const matchCategory =
        selectedCategoryFilter === "all" || article.category === selectedCategoryFilter;
      const matchSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (selectedSort === "a-z") {
        return a.title.localeCompare(b.title);
      }
      if (selectedSort === "z-a") {
        return b.title.localeCompare(a.title);
      }
      if (selectedSort === "terlama") {
        return String(a.createdAt).localeCompare(String(b.createdAt));
      }
      return 0;
    });

  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-white-90 flex flex-col items-center lg:overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        brandTitle="Dua Putra Srikandi"
        userName="Username"
        userRole="Super Admin"
        onLogout={() => triggerNotif("Anda telah logout dari sistem", "error")}
      />

      {/* Main Body */}
      <main className="w-full max-w-360 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 flex-1 flex flex-col md:flex-row justify-center items-start gap-4 sm:gap-6 min-h-0 lg:overflow-hidden lg:h-full">
        {/* Sidebar Component */}
        <Sidebar activeId="articles" className="shrink-0 h-fit" />

        {/* Content Card */}
        <div className="flex-1 w-full p-4 sm:p-6 md:p-8 bg-white rounded-3xl sm:rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-4 sm:gap-5 overflow-hidden min-h-0 lg:h-full">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-xl sm:text-2xl md:text-3xl font-bold font-sans">
                Kelola Artikel
              </h1>
              <p className="text-dark text-xs sm:text-sm font-normal font-sans">
                Kelola konten artikel & berita proyek di halaman ini
              </p>
            </div>

            {/* Add Article Button (Navigates directly to /kelola-artikel/tambah) */}
            <Link href="/kelola-artikel/tambah">
              <Button
                type="button"
                text="Tambah Artikel"
                variant="fill"
                rightIcon="Add"
                className="shrink-0 cursor-pointer"
              />
            </Link>
          </div>

          {/* Top Divider */}
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Filter and Search Row */}
          <div className="self-stretch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full shrink-0">
            <div className="w-full sm:max-w-xs">
              <InputBox
                placeholder="Cari judul artikel..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon="Search"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-60">
                <Dropdown
                  options={categoryOptions}
                  value={selectedCategoryFilter}
                  onChange={(val) => {
                    setSelectedCategoryFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter Kategori"
                  searchPlaceholder="Search Category"
                />
              </div>
              <div className="w-full sm:w-48">
                <Dropdown
                  options={SORT_OPTIONS}
                  value={selectedSort}
                  onChange={(val) => {
                    setSelectedSort(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Urutkan"
                  searchPlaceholder="Urutkan"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="self-stretch flex-1 bg-white flex flex-col justify-start items-start gap-2 overflow-x-auto overflow-y-auto min-h-0 w-full pr-1">
            {/* Table Header */}
            <div className="self-stretch min-w-[840px] h-11 bg-white-90 rounded-xl flex items-center px-4 overflow-hidden select-none sticky top-0 z-10 shrink-0">
              <div className="w-14 text-g1 text-xs font-semibold font-sans">No.</div>
              <div className="flex-1 text-g1 text-xs font-semibold font-sans">Nama Artikel</div>
              <div className="w-48 text-g1 text-xs font-semibold font-sans">Kategori</div>
              <div className="w-24 text-g1 text-xs font-semibold font-sans">Waktu Dibuat</div>
              <div className="w-24 text-g1 text-xs font-semibold font-sans">Waktu Diedit</div>
              <div className="w-24 text-left text-g1 text-xs font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows */}
            {filteredArticles.length === 0 ? (
              <EmptyState
                text={
                  searchQuery || selectedCategoryFilter !== "all"
                    ? "Tidak ada artikel yang sesuai dengan pencarian atau filter Anda."
                    : "Belum ada artikel yang tersedia saat ini."
                }
              />
            ) : (
              paginatedArticles.map((article, idx) => (
                <div
                  key={article.id}
                  className="self-stretch min-w-[840px] min-h-[54px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                >
                  {/* No. */}
                  <div className="w-14 text-dark/90 text-xs font-normal font-sans">
                    {(currentPage - 1) * itemsPerPage + idx + 1}.
                  </div>

                  {/* Nama Artikel (Up to 2 lines title max) */}
                  <div className="flex-1 flex flex-col justify-center pr-4">
                    <span className="text-dark/90 text-xs font-semibold font-sans line-clamp-2">
                      {article.title}
                    </span>
                  </div>

                  {/* Kategori Badge */}
                  <div className="w-48 flex items-center pr-2">
                    <Badge
                      text={article.category}
                      variant={article.categoryVariant}
                      showDot={true}
                    />
                  </div>

                  {/* Waktu Dibuat */}
                  <div className="w-24 text-dark/75 text-xs font-normal font-sans">
                    {article.createdAt}
                  </div>

                  {/* Waktu Diedit */}
                  <div className="w-24 text-dark/75 text-xs font-normal font-sans">
                    {article.editedAt || article.createdAt}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-24 flex justify-start items-center gap-2.5">
                    {/* Edit Action Button (Navigates to /kelola-artikel/[id]) */}
                    <Link
                      href={`/kelola-artikel/${article.id}`}
                      title="Edit Artikel"
                      className="group size-9 p-1 bg-brand-background text-g1 border border-g1/40 hover:border-g1 hover:bg-g1/15 hover:opacity-80 rounded-full flex justify-center items-center hover:shadow-[0px_2px_6px_0px_rgba(6,137,81,0.25)] active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      <LordIcon name="Edit" size={18} primaryColor="#0A9863" trigger="hover" target="a, .group" />
                    </Link>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      title="Hapus Artikel"
                      onClick={() => setDeleteModal({ isOpen: true, article })}
                      className="size-9 p-1 bg-red-state text-white border border-red-300 hover:border-red-400 hover:opacity-80 active:opacity-60 active:scale-95 rounded-full flex justify-center items-center hover:shadow-[0px_2px_6px_0px_rgba(249,76,76,0.3)] transition-all duration-200 cursor-pointer shadow-xs"
                    >
                      <LordIcon name="Delete" size={18} primaryColor="#FFFFFF" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Divider */}
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Pagination Component */}
          <div className="self-stretch shrink-0">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredArticles.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="Artikel"
            />
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
