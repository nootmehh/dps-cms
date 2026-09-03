"use client";

import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import InputBox from "@/components/ui/inputBox";
import Dropdown, { type DropdownOption } from "@/components/ui/dropdown";
import DescriptionBox from "@/components/ui/descriptionBox";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import Notification, { type NotificationType } from "@/components/ui/notification";
import DeleteConfirmationModal from "@/components/ui/modal/deleteConfirmation";

interface ProductItem {
  id: number;
  name: string;
  category: string;
  categoryVariant: BadgeVariant;
  createdAt: string;
  description?: string;
  sku?: string;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: "Rambu Lalu Lintas Standar Dishub",
    category: "Rambu & Marka",
    categoryVariant: "blue",
    createdAt: "26 Agu 2024, 09:30",
    description: "Plat alumunium dengan stiker reflective sheet prismatic standar keselamatan Dishub.",
    sku: "RMB-001",
  },
  {
    id: 2,
    name: "Guardrail Beam Flex-Beam Tipe A",
    category: "Guardrail & Pagar",
    categoryVariant: "purple",
    createdAt: "22 Agu 2024, 15:10",
    description: "Pagar pengaman baja galvanis ketebalan 2.67mm lengkap dengan post dan blocking.",
    sku: "GDR-002",
  },
  {
    id: 3,
    name: "Lampu PJU All-in-One Solar 100W",
    category: "PJU Solar Cell",
    categoryVariant: "yellow",
    createdAt: "19 Agu 2024, 11:45",
    description: "Lampu penerangan jalan tenaga surya terintegrasi baterai LiFePO4 dan sensor gerak.",
    sku: "PJU-003",
  },
  {
    id: 4,
    name: "Cat Marka Termoplastik Putih / Kuning",
    category: "Cat Marka Jalan",
    categoryVariant: "green",
    createdAt: "16 Agu 2024, 14:00",
    description: "Bahan cat marka panas berkualitas tinggi daya rekat kuat dan visibilitas malam tinggi.",
    sku: "MRK-004",
  },
  {
    id: 5,
    name: "Traffic Cone Rubber 75cm Reflektif",
    category: "Aksesoris Jalan",
    categoryVariant: "orange",
    createdAt: "12 Agu 2024, 08:20",
    description: "Kerucut lalu lintas karet elastis tahan benturan kendaraan dengan stiker scotchlite.",
    sku: "TFC-005",
  },
];

const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: "all", label: "Semua Kategori" },
  { value: "Rambu & Marka", label: "Rambu & Marka" },
  { value: "Guardrail & Pagar", label: "Guardrail & Pagar" },
  { value: "PJU Solar Cell", label: "PJU Solar Cell" },
  { value: "Cat Marka Jalan", label: "Cat Marka Jalan" },
  { value: "Aksesoris Jalan", label: "Aksesoris Jalan" },
];

const CATEGORY_FORM_OPTIONS: DropdownOption[] = [
  { value: "Rambu & Marka", label: "Rambu & Marka" },
  { value: "Guardrail & Pagar", label: "Guardrail & Pagar" },
  { value: "PJU Solar Cell", label: "PJU Solar Cell" },
  { value: "Cat Marka Jalan", label: "Cat Marka Jalan" },
  { value: "Aksesoris Jalan", label: "Aksesoris Jalan" },
];

const CATEGORY_VARIANT_MAP: Record<string, BadgeVariant> = {
  "Rambu & Marka": "blue",
  "Guardrail & Pagar": "purple",
  "PJU Solar Cell": "yellow",
  "Cat Marka Jalan": "green",
  "Aksesoris Jalan": "orange",
};

import LordIcon from "@/components/common/lordIcon";

export default function KelolaProdukPage() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product?: ProductItem }>({
    isOpen: false,
  });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    productId?: number;
  }>({
    isOpen: false,
    mode: "add",
  });

  const [formData, setFormData] = useState({
    name: "",
    category: "Rambu & Marka",
    description: "",
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

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({ name: "", category: "Rambu & Marka", description: "" });
    setFormModal({ isOpen: true, mode: "add" });
  };

  // Open Edit Modal
  const handleOpenEdit = (product: ProductItem) => {
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || "",
    });
    setFormModal({ isOpen: true, mode: "edit", productId: product.id });
  };

  // Save Add / Edit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const categoryVariant = CATEGORY_VARIANT_MAP[formData.category] || "green";

    if (formModal.mode === "add") {
      const now = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newProduct: ProductItem = {
        id: Date.now(),
        name: formData.name.trim(),
        category: formData.category,
        categoryVariant,
        createdAt: formattedDate,
        description: formData.description.trim(),
      };

      setProducts((prev) => [newProduct, ...prev]);
      triggerNotif(`Produk "${newProduct.name}" berhasil ditambahkan!`, "success");
    } else if (formModal.mode === "edit" && formModal.productId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === formModal.productId
            ? {
                ...p,
                name: formData.name.trim(),
                category: formData.category,
                categoryVariant,
                description: formData.description.trim(),
              }
            : p
        )
      );
      triggerNotif(`Produk berhasil diperbarui!`, "success");
    }

    setFormModal({ isOpen: false, mode: "add" });
  };

  // Confirm Delete
  const confirmDelete = () => {
    if (deleteModal.product) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteModal.product?.id));
      triggerNotif(`Produk "${deleteModal.product.name}" berhasil dihapus`, "error");
      setDeleteModal({ isOpen: false });
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

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

            {/* Add Product Button */}
            <Button
              type="button"
              text="Tambah Produk"
              variant="fill"
              rightIcon="Add"
              onClick={handleOpenAdd}
              className="shrink-0 cursor-pointer"
            />
          </div>

          {/* Top Divider */}
          <div className="w-full h-px bg-g1/10" aria-hidden="true" />

          {/* Filter and Search Row */}
          <div className="self-stretch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
            <div className="w-full sm:max-w-xs">
              <InputBox
                placeholder="Cari nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon="Global"
              />
            </div>
            <div className="w-full sm:w-64">
              <Dropdown
                options={CATEGORY_OPTIONS}
                value={selectedCategoryFilter}
                onChange={(val) => setSelectedCategoryFilter(val)}
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
              <div className="w-48 text-g1 text-sm font-semibold font-sans">Kategori</div>
              <div className="w-48 text-g1 text-sm font-semibold font-sans">Waktu Dibuat</div>
              <div className="w-24 text-left text-g1 text-sm font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows */}
            {filteredProducts.length === 0 ? (
              <div className="self-stretch py-12 text-center text-slate-400 text-sm font-sans">
                Tidak ada produk yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              filteredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="self-stretch min-w-[720px] min-h-[58px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                >
                  {/* No. */}
                  <div className="w-14 text-dark/90 text-sm font-normal font-sans">
                    {idx + 1}.
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
                  <div className="w-48 flex items-center">
                    <Badge
                      text={product.category}
                      variant={product.categoryVariant}
                      showDot={true}
                    />
                  </div>

                  {/* Waktu Dibuat */}
                  <div className="w-48 text-dark/75 text-sm font-normal font-sans">
                    {product.createdAt}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-24 flex justify-start items-center gap-2.5">
                    {/* Edit Action Button */}
                    <button
                      type="button"
                      title="Edit Produk"
                      onClick={() => handleOpenEdit(product)}
                      className="size-9 p-1 bg-brand-background hover:bg-g1/15 rounded-full flex justify-center items-center text-g1 transition-colors cursor-pointer"
                    >
                      <LordIcon name="Edit" size={18} primaryColor="#0A9863" />
                    </button>

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

      {/* Add / Edit Product Modal */}
      {formModal.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-white-80 shadow-2xl flex flex-col gap-5 animate-scale-in">
            <div>
              <h2 className="text-xl font-bold text-dark">
                {formModal.mode === "add" ? "Tambah Produk Baru" : "Edit Produk"}
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi nama produk, kategori perlengkapan, dan spesifikasi produk.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <InputBox
                label="Nama Produk"
                placeholder="cth. Guardrail Beam Flex-Beam Tipe A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Dropdown
                label="Kategori"
                options={CATEGORY_FORM_OPTIONS}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                placeholder="Pilih Kategori Produk"
              />

              <DescriptionBox
                label="Spesifikasi & Deskripsi Produk (Opsional)"
                placeholder="Masukkan spesifikasi material, ketebalan, atau sertifikasi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />

              <div className="flex justify-end items-center gap-3 pt-2">
                <Button
                  type="button"
                  text="Batal"
                  variant="ghost-green"
                  onClick={() => setFormModal({ isOpen: false, mode: "add" })}
                />
                <Button
                  type="submit"
                  text={formModal.mode === "add" ? "Simpan Produk" : "Perbarui Produk"}
                  variant="fill"
                />
              </div>
            </form>
          </div>
        </div>
      )}

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
