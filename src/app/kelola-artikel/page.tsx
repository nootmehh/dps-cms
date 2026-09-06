"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { deleteArticle, type ArticlePayload } from "@/shared/api/article";

export interface ArticleItem {
  id: string | number;
  title: string;
  category: string;
  categoryVariant: BadgeVariant;
  createdAt: string;
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

export default function KelolaArtikelPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
              categoryVariant: CATEGORY_VARIANT_MAP[mainCat] || "green",
              createdAt: item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : "Baru saja",
              excerpt: item.content ? item.content.replace(/<[^>]*>?/gm, "").slice(0, 80) : "",
            };
          });
          setArticles(mapped);
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
              categoryVariant: CATEGORY_VARIANT_MAP[mainCat] || "green",
              createdAt: item.createdAt || "Baru saja",
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

  return (
    <div className="h-screen max-h-screen bg-white-90 flex flex-col items-center overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        brandTitle="Dua Putra Srikandi"
        userName="Username"
        userRole="Super Admin"
        onLogout={() => triggerNotif("Anda telah logout dari sistem", "error")}
      />

      {/* Main Body */}
      <main className="w-full max-w-360 px-6 lg:px-12 py-6 flex-1 flex flex-col md:flex-row justify-center items-start gap-6 overflow-hidden min-h-0 h-full">
        {/* Sidebar Component */}
        <Sidebar activeId="articles" className="shrink-0 h-fit" />

        {/* Content Card */}
        <div className="flex-1 h-full p-6 md:p-8 bg-white rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-5 w-full overflow-hidden min-h-0">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Artikel
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Kelola publikasi artikel, berita proyek, dan wawasan konstruksi di website{" "}
                <span className="text-g1 font-semibold">Dua Putra Srikandi</span>.
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
          <div className="self-stretch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full shrink-0">
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
          <div className="self-stretch flex-1 bg-white flex flex-col justify-start items-start gap-2 overflow-x-auto overflow-y-auto min-h-0 w-full pr-1">
            {/* Table Header */}
            <div className="self-stretch min-w-[720px] h-11 bg-white-90 rounded-xl flex items-center px-4 overflow-hidden select-none sticky top-0 z-10 shrink-0">
              <div className="w-14 text-g1 text-sm font-semibold font-sans">No.</div>
              <div className="flex-1 text-g1 text-sm font-semibold font-sans">Nama Artikel</div>
              <div className="w-48 text-g1 text-sm font-semibold font-sans">Kategori</div>
              <div className="w-48 text-g1 text-sm font-semibold font-sans">Waktu Dibuat</div>
              <div className="w-24 text-left text-g1 text-sm font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows */}
            {paginatedArticles.length === 0 ? (
              <div className="self-stretch py-12 text-center text-slate-400 text-sm font-sans">
                Tidak ada artikel yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              paginatedArticles.map((article, idx) => (
                <div
                  key={article.id}
                  className="self-stretch min-w-[720px] min-h-[58px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
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
                  <div className="w-48 flex items-center">
                    <Badge
                      text={article.category}
                      variant={article.categoryVariant}
                      showDot={true}
                    />
                  </div>

                  {/* Waktu Dibuat */}
                  <div className="w-48 text-dark/75 text-sm font-normal font-sans">
                    {article.createdAt}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-24 flex justify-start items-center gap-2.5">
                    {/* Edit Action Button (Navigates to /kelola-artikel/[id]) */}
                    <Link
                      href={`/kelola-artikel/${article.id}`}
                      title="Edit Artikel"
                      className="size-9 p-1 bg-brand-background hover:bg-g1/15 rounded-full flex justify-center items-center text-g1 transition-colors cursor-pointer"
                    >
                      <LordIcon name="Edit" size={18} primaryColor="#0A9863" />
                    </Link>

                    {/* Delete Action Button */}
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
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white-80 shrink-0">
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
