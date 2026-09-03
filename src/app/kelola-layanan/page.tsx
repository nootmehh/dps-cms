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
import LordIcon from "@/components/common/lordIcon";

interface ServiceItem {
  id: number;
  name: string;
  category: string;
  categoryVariant: BadgeVariant;
  createdAt: string;
  description?: string;
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 1,
    name: "Konstruksi & Pengaspalan Jalan",
    category: "Konstruksi",
    categoryVariant: "green",
    createdAt: "24 Agu 2024, 10:15",
    description: "Layanan pengerjaan proyek jalan aspal hotmix dan perbaikan jalan raya standar nasional.",
  },
  {
    id: 2,
    name: "Pemasangan Rambu & Marka Jalan",
    category: "Perlengkapan Jalan",
    categoryVariant: "blue",
    createdAt: "20 Agu 2024, 14:30",
    description: "Instalasi rambu petunjuk jalan, marka thermoplastic, dan paku jalan reflektif.",
  },
  {
    id: 3,
    name: "Fabrikasi Guardrail & Pagar Pengaman",
    category: "Fabrikasi",
    categoryVariant: "purple",
    createdAt: "18 Agu 2024, 09:00",
    description: "Produksi dan instalasi pagar pengaman jalan (guardrail) galvanis tahan korosi.",
  },
  {
    id: 4,
    name: "Penerangan Jalan Umum (PJU) Solar Cell",
    category: "Penerangan",
    categoryVariant: "yellow",
    createdAt: "15 Agu 2024, 16:45",
    description: "Pemasangan tiang dan lampu PJU tenaga surya hemat energi untuk jalan protokol dan desa.",
  },
  {
    id: 5,
    name: "Penyewaan Alat Berat Konstruksi",
    category: "Rental Alat",
    categoryVariant: "orange",
    createdAt: "10 Agu 2024, 11:20",
    description: "Penyewaan vibro roller, excavator, asphalt finisher, dan dump truck beserta operator.",
  },
];

const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: "all", label: "Semua Kategori" },
  { value: "Konstruksi", label: "Konstruksi" },
  { value: "Perlengkapan Jalan", label: "Perlengkapan Jalan" },
  { value: "Fabrikasi", label: "Fabrikasi" },
  { value: "Penerangan", label: "Penerangan" },
  { value: "Rental Alat", label: "Rental Alat" },
];

const CATEGORY_FORM_OPTIONS: DropdownOption[] = [
  { value: "Konstruksi", label: "Konstruksi" },
  { value: "Perlengkapan Jalan", label: "Perlengkapan Jalan" },
  { value: "Fabrikasi", label: "Fabrikasi" },
  { value: "Penerangan", label: "Penerangan" },
  { value: "Rental Alat", label: "Rental Alat" },
];

const CATEGORY_VARIANT_MAP: Record<string, BadgeVariant> = {
  Konstruksi: "green",
  "Perlengkapan Jalan": "blue",
  Fabrikasi: "purple",
  Penerangan: "yellow",
  "Rental Alat": "orange",
};

export default function KelolaLayananPage() {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; service?: ServiceItem }>({
    isOpen: false,
  });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    serviceId?: number;
  }>({
    isOpen: false,
    mode: "add",
  });

  const [formData, setFormData] = useState({
    name: "",
    category: "Konstruksi",
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
    setFormData({ name: "", category: "Konstruksi", description: "" });
    setFormModal({ isOpen: true, mode: "add" });
  };

  // Open Edit Modal
  const handleOpenEdit = (service: ServiceItem) => {
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || "",
    });
    setFormModal({ isOpen: true, mode: "edit", serviceId: service.id });
  };

  // Save Add or Edit Service
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const categoryVariant = CATEGORY_VARIANT_MAP[formData.category] || "green";

    if (formModal.mode === "add") {
      const now = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newService: ServiceItem = {
        id: Date.now(),
        name: formData.name.trim(),
        category: formData.category,
        categoryVariant,
        createdAt: formattedDate,
        description: formData.description.trim(),
      };

      setServices((prev) => [newService, ...prev]);
      triggerNotif(`Layanan "${newService.name}" berhasil ditambahkan!`, "success");
    } else if (formModal.mode === "edit" && formModal.serviceId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === formModal.serviceId
            ? {
                ...s,
                name: formData.name.trim(),
                category: formData.category,
                categoryVariant,
                description: formData.description.trim(),
              }
            : s
        )
      );
      triggerNotif(`Layanan berhasil diperbarui!`, "success");
    }

    setFormModal({ isOpen: false, mode: "add" });
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (deleteModal.service) {
      setServices((prev) => prev.filter((s) => s.id !== deleteModal.service?.id));
      triggerNotif(`Layanan "${deleteModal.service.name}" berhasil dihapus`, "error");
      setDeleteModal({ isOpen: false });
    }
  };

  // Filter Services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" || s.category === selectedCategoryFilter;
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
        <Sidebar activeId="services" />

        {/* Content Card */}
        <div className="flex-1 p-6 md:p-8 bg-white rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Layanan
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Kelola daftar layanan dan jasa konstruksi yang ditawarkan oleh{" "}
                <span className="text-g1 font-semibold">Dua Putra Srikandi</span>.
              </p>
            </div>

            {/* Add Service Button */}
            <Button
              type="button"
              text="Tambah Layanan"
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
                placeholder="Cari nama layanan..."
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
              <div className="flex-1 text-g1 text-sm font-semibold font-sans">Nama Layanan</div>
              <div className="w-48 text-g1 text-sm font-semibold font-sans">Kategori</div>
              <div className="w-48 text-g1 text-sm font-semibold font-sans">Waktu Dibuat</div>
              <div className="w-24 text-left text-g1 text-sm font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows */}
            {filteredServices.length === 0 ? (
              <div className="self-stretch py-12 text-center text-slate-400 text-sm font-sans">
                Tidak ada layanan yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              filteredServices.map((service, idx) => (
                <div
                  key={service.id}
                  className="self-stretch min-w-[720px] min-h-[58px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                >
                  {/* No. */}
                  <div className="w-14 text-dark/90 text-sm font-normal font-sans">
                    {idx + 1}.
                  </div>

                  {/* Nama Layanan */}
                  <div className="flex-1 flex flex-col justify-center pr-4">
                    <span className="text-dark/90 text-sm font-semibold font-sans line-clamp-1">
                      {service.name}
                    </span>
                    {service.description && (
                      <span className="text-dark/50 text-xs font-normal font-sans line-clamp-1">
                        {service.description}
                      </span>
                    )}
                  </div>

                  {/* Kategori Badge */}
                  <div className="w-48 flex items-center">
                    <Badge
                      text={service.category}
                      variant={service.categoryVariant}
                      showDot={true}
                    />
                  </div>

                  {/* Waktu Dibuat */}
                  <div className="w-48 text-dark/75 text-sm font-normal font-sans">
                    {service.createdAt}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-24 flex justify-start items-center gap-2.5">
                    {/* Edit Action Button */}
                    <button
                      type="button"
                      title="Edit Layanan"
                      onClick={() => handleOpenEdit(service)}
                      className="size-9 p-1 bg-brand-background hover:bg-g1/15 rounded-full flex justify-center items-center text-g1 transition-colors cursor-pointer"
                    >
                      <LordIcon name="Edit" size={18} primaryColor="#0A9863" />
                    </button>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      title="Hapus Layanan"
                      onClick={() => setDeleteModal({ isOpen: true, service })}
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
            totalItems={filteredServices.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="Layanan"
          />
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Hapus Layanan"
        message={`Apakah Anda yakin ingin menghapus layanan "${deleteModal.service?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Add / Edit Service Modal */}
      {formModal.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-white-80 shadow-2xl flex flex-col gap-5 animate-scale-in">
            <div>
              <h2 className="text-xl font-bold text-dark">
                {formModal.mode === "add" ? "Tambah Layanan Baru" : "Edit Layanan"}
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi rincian nama layanan, kategori, dan deskripsi untuk dipublikasikan pada sistem CMS.
              </p>
            </div>

            <form onSubmit={handleSaveService} className="flex flex-col gap-4">
              <InputBox
                label="Nama Layanan"
                placeholder="cth. Konstruksi & Pengaspalan Jalan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Dropdown
                label="Kategori"
                options={CATEGORY_FORM_OPTIONS}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                placeholder="Pilih Kategori Layanan"
              />

              <DescriptionBox
                label="Deskripsi Layanan (Opsional)"
                placeholder="Masukkan deskripsi ringkas tentang layanan..."
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
                  text={formModal.mode === "add" ? "Simpan Layanan" : "Perbarui Layanan"}
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
