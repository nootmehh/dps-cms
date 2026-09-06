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
import DeleteConfirmationModal from "@/components/ui/modal/deleteConfirmation";
import LordIcon from "@/components/common/lordIcon";
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
  description?: string;
  imageUrl?: string | null;
}

export default function KelolaProdukPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([
    { value: "all", label: "Semua Kategori" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
              categoryVariant: (CATEGORY_VARIANT_MAP[cat] || "green") as BadgeVariant,
              createdAt: item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : "Baru saja",
              description: item.description || "",
              imageUrl: item.product_image_url?.[0] || item.highlight_img_url || null,
            };
          });
          setProducts(mapped);
          const uniqueCategories = Array.from(new Set(rows.map((p) => p.category).filter(Boolean))) as string[];
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
          description: item.description || "",
          imageUrl: item.imageUrl,
        };
      });
      setProducts(mapped);

      const uniqueCategories = Array.from(new Set(stored.map((p) => p.category).filter(Boolean)));
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
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === "all" || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-white-90 flex flex-col items-center">
      {/* Top Navbar */}
      <Navbar
        brandTitle="Dua Putra Srikandi"
        userName="Username"
        userRole="Super Admin"
        onLogout={() => triggerNotif("Anda telah logout dari sistem", "error")}
      />

      {/* Main Body */}
      <main className="w-full max-w-360 px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Sidebar Component */}
        <Sidebar activeId="products" />

        {/* Content Card */}
        <div className="flex-1 p-6 md:p-8 bg-white rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Produk
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Kelola katalog produk perlengkapan jalan dan keselamatan yang diproduksi oleh{" "}
                <span className="text-g1 font-semibold">Dua Putra Srikandi</span>.
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
          <div className="w-full h-px bg-g1/10" aria-hidden="true" />

          {/* Filter and Search Row */}
          <div className="self-stretch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
            <div className="w-full sm:max-w-xs">
              <InputBox
                placeholder="Cari nama produk..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon="Global"
              />
            </div>
            <div className="w-full sm:w-80">
              <Dropdown
                options={categoryOptions}
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
            <div className="self-stretch min-w-[720px] h-11 bg-white-90 rounded-xl flex items-center px-4 overflow-hidden select-none">
              <div className="w-14 text-g1 text-sm font-semibold font-sans">No.</div>
              <div className="flex-1 text-g1 text-sm font-semibold font-sans">Nama Produk</div>
              <div className="w-64 text-g1 text-sm font-semibold font-sans">Kategori</div>
              <div className="w-40 text-g1 text-sm font-semibold font-sans">Waktu Dibuat</div>
              <div className="w-24 text-left text-g1 text-sm font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows */}
            {filteredProducts.length === 0 ? (
              <div className="self-stretch py-12 text-center text-slate-400 text-sm font-sans">
                Tidak ada produk yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              paginatedProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="self-stretch min-w-[720px] min-h-[58px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                >
                  {/* No. */}
                  <div className="w-14 text-dark/90 text-sm font-normal font-sans">
                    {(currentPage - 1) * itemsPerPage + idx + 1}.
                  </div>

                  {/* Nama Produk */}
                  <div className="flex-1 flex flex-col justify-center pr-4">
                    <span className="text-dark/90 text-sm font-semibold font-sans line-clamp-1">
                      {product.name}
                    </span>
                    {product.description && (
                      <span className="text-dark/50 text-xs font-normal font-sans line-clamp-1">
                        {product.description}
                      </span>
                    )}
                  </div>

                  {/* Kategori Badge */}
                  <div className="w-64 flex items-center pr-2">
                    <Badge
                      text={product.category}
                      variant={product.categoryVariant}
                      showDot={true}
                    />
                  </div>

                  {/* Waktu Dibuat */}
                  <div className="w-40 text-dark/75 text-sm font-normal font-sans">
                    {product.createdAt}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-24 flex justify-start items-center gap-2.5">
                    {/* Edit Action Button (Navigates to /kelola-produk/[id]) */}
                    <Link
                      href={`/kelola-produk/${product.id}`}
                      title="Edit Produk"
                      className="size-9 p-1 bg-brand-background hover:bg-g1/15 rounded-full flex justify-center items-center text-g1 transition-colors cursor-pointer"
                    >
                      <LordIcon name="Edit" size={18} primaryColor="#0A9863" />
                    </Link>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      title="Hapus Produk"
                      onClick={() => setDeleteModal({ isOpen: true, product })}
                      className="size-9 p-1 bg-red-state hover:opacity-90 rounded-full flex justify-center items-center text-white transition-opacity cursor-pointer shadow-xs"
                    >
                      <LordIcon name="Delete" size={18} primaryColor="#FFFFFF" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Divider */}
          <div className="w-full h-px bg-g1/10" aria-hidden="true" />

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="Produk"
          />
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
