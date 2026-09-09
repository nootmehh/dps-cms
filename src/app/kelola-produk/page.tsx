"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import InputBox from "@/components/ui/inputBox";
import Dropdown, { type DropdownOption } from "@/components/ui/dropdown";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import Notification, { type NotificationType } from "@/components/ui/notification";
import DeleteConfirmationModal from "@/components/modal/deleteConfirmation";
import LordIcon from "@/components/common/lordIcon";
import EmptyState from "@/components/common/emptyState";
import {
  getStoredProducts,
  deleteProduct,
  CATEGORY_VARIANT_MAP,
  type ProductPayload,
} from "@/shared/api/product";
import { getProducts } from "@/services/productApi";

export interface ProductItem {
  id: string | number;
  name: string;
  category: string;
  categoryVariant: BadgeVariant;
  createdAt: string;
  editedAt?: string;
  description?: string;
  imageUrl?: string | null;
}

const SORT_OPTIONS: DropdownOption[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlama", label: "Terlama" },
  { value: "a-z", label: "A - Z" },
  { value: "z-a", label: "Z - A" },
];

export default function KelolaProdukPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState<string>("terbaru");
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([
    { value: "all", label: "Semua Kategori" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product?: ProductItem }>({
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

  // Load products from Supabase / storage on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const rows = await getProducts();
        if (rows && rows.length > 0) {
          const mapped: ProductItem[] = rows.map((item) => {
            const cat = item.category || "Umum";
            return {
              id: item.id,
              name: item.title,
              category: cat,
              categoryVariant: (item.category_color?.toLowerCase() || CATEGORY_VARIANT_MAP[cat] || "green") as BadgeVariant,
              createdAt: item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : "Baru saja",
              editedAt: (item as any).edited_at || (item as any).updated_at
                ? new Date((item as any).edited_at || (item as any).updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : item.created_at
                  ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                  : "Baru saja",
              description: item.description || "",
              imageUrl: item.product_image_url?.[0] || item.highlight_img_url || null,
            };
          });
          setProducts(mapped);
          const uniqueCategories = Array.from(
            new Set(rows.map((p) => p.category).filter(Boolean))
          ).filter(
            (c) => c !== "all" && c !== "Semua Kategori" && c !== "Semua"
          ) as string[];
          setCategoryOptions([
            { value: "all", label: "Semua Kategori" },
            ...uniqueCategories.map((c) => ({ value: c, label: c })),
          ]);
          return;
        }
      } catch (err) {
        console.error("Error loading products from Supabase", err);
      }

      const stored = getStoredProducts();
      const mapped: ProductItem[] = stored.map((item) => {
        const cat = item.category || "Umum";
        return {
          id: item.id || Date.now(),
          name: item.title,
          category: cat,
          categoryVariant: (item.categoryVariant || CATEGORY_VARIANT_MAP[cat] || "green") as BadgeVariant,
          createdAt: item.createdAt || "Baru saja",
          editedAt: (item as any).editedAt || (item as any).updatedAt || item.createdAt || "Baru saja",
          description: item.description || "",
          imageUrl: item.imageUrl,
        };
      });
      setProducts(mapped);

      const uniqueCategories = Array.from(
        new Set(stored.map((p) => p.category).filter(Boolean))
      ).filter(
        (c) => c !== "all" && c !== "Semua Kategori" && c !== "Semua"
      );
      const opts: DropdownOption[] = [
        { value: "all", label: "Semua Kategori" },
        ...uniqueCategories.map((c) => ({ value: c, label: c })),
      ];
      setCategoryOptions(opts);
    };

    loadProducts();
  }, []);

  // Confirm Delete
  const confirmDelete = async () => {
    if (deleteModal.product) {
      const target = deleteModal.product;
      try {
        await deleteProduct(target.id);
        setProducts((prev) => prev.filter((p) => String(p.id) !== String(target.id)));
        triggerNotif(`Produk "${target.name}" berhasil dihapus`, "default");
      } catch (err: any) {
        const msg = err?.message || err?.details || "Gagal menghapus produk dari Supabase";
        console.error("Error deleting product from Supabase:", err);
        triggerNotif(`Gagal menghapus produk: ${msg}`, "error");
      } finally {
        setDeleteModal({ isOpen: false });
      }
    }
  };

  // Filter products
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategoryFilter === "all" || p.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (selectedSort === "a-z") {
        return a.name.localeCompare(b.name);
      }
      if (selectedSort === "z-a") {
        return b.name.localeCompare(a.name);
      }
      if (selectedSort === "terlama") {
        return String(a.createdAt).localeCompare(String(b.createdAt));
      }
      return 0;
    });

  const paginatedProducts = filteredProducts.slice(
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
        <Sidebar activeId="products" className="shrink-0 h-fit" />

        {/* Content Card */}
        <div className="flex-1 h-full p-6 md:p-8 bg-white rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-5 w-full overflow-hidden min-h-0">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Produk
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Kelola konten produk & material proyek di halaman ini
              </p>
            </div>

            {/* Add Product Button (Navigates to /kelola-produk/tambah) */}
            <Link href="/kelola-produk/tambah">
              <Button
                type="button"
                text="Tambah Produk"
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
                placeholder="Cari nama produk..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon="Search"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
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
              <div className="flex-1 text-g1 text-xs font-semibold font-sans">Nama Produk</div>
              <div className="w-48 text-g1 text-xs font-semibold font-sans">Kategori</div>
              <div className="w-24 text-g1 text-xs font-semibold font-sans">Waktu Dibuat</div>
              <div className="w-24 text-g1 text-xs font-semibold font-sans">Waktu Diedit</div>
              <div className="w-24 text-left text-g1 text-xs font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows */}
            {filteredProducts.length === 0 ? (
              <EmptyState
                text={
                  searchQuery || selectedCategoryFilter !== "all"
                    ? "Tidak ada produk yang sesuai dengan pencarian atau filter Anda."
                    : "Belum ada produk yang tersedia saat ini."
                }
              />
            ) : (
              paginatedProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="self-stretch min-w-[840px] min-h-[54px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                >
                  {/* No. */}
                  <div className="w-14 text-dark/90 text-xs font-normal font-sans">
                    {(currentPage - 1) * itemsPerPage + idx + 1}.
                  </div>

                  {/* Nama Produk (Title only) */}
                  <div className="flex-1 flex flex-col justify-center pr-4">
                    <span className="text-dark/90 text-xs font-semibold font-sans line-clamp-2">
                      {product.name}
                    </span>
                  </div>

                  {/* Kategori Badge */}
                  <div className="w-48 flex items-center pr-2">
                    <Badge
                      text={product.category}
                      variant={product.categoryVariant}
                      showDot={true}
                    />
                  </div>

                  {/* Waktu Dibuat */}
                  <div className="w-24 text-dark/75 text-xs font-normal font-sans">
                    {product.createdAt}
                  </div>

                  {/* Waktu Diedit */}
                  <div className="w-24 text-dark/75 text-xs font-normal font-sans">
                    {product.editedAt || product.createdAt}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-24 flex justify-start items-center gap-2.5">
                    {/* Edit Action Button (Navigates to /kelola-produk/[id]) */}
                    <Link
                      href={`/kelola-produk/${product.id}`}
                      title="Edit Produk"
                      className="group size-9 p-1 bg-brand-background text-g1 border border-g1/40 hover:border-g1 hover:bg-g1/15 hover:opacity-80 rounded-full flex justify-center items-center hover:shadow-[0px_2px_6px_0px_rgba(6,137,81,0.25)] active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      <LordIcon name="Edit" size={18} primaryColor="#0A9863" trigger="hover" target="a, .group" />
                    </Link>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      title="Hapus Produk"
                      onClick={() => setDeleteModal({ isOpen: true, product })}
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
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="Produk"
            />
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteModal.product?.name}"? Tindakan ini tidak dapat dibatalkan.`}
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
