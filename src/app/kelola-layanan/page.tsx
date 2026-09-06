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
  getStoredServices,
  deleteService,
  SERVICE_CATEGORY_VARIANT_MAP,
  type ServicePayload,
} from "@/shared/api/service";
import { getServices } from "@/services/serviceApi";

export interface ServiceItem {
  id: string | number;
  name: string;
  category: string;
  categoryVariant: BadgeVariant;
  createdAt: string;
  description?: string;
  imageUrl?: string | null;
}

export default function KelolaLayananPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([
    { value: "all", label: "Semua Kategori" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; service?: ServiceItem }>({
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

  // Load services from storage/Supabase
  useEffect(() => {
    const loadServices = async () => {
      try {
        const rows = await getServices();
        if (rows && rows.length > 0) {
          const mapped: ServiceItem[] = rows.map((item) => {
            const cat = item.category || "Umum";
            return {
              id: item.id,
              name: item.title,
              category: cat,
              categoryVariant: (SERVICE_CATEGORY_VARIANT_MAP[cat] || "green") as BadgeVariant,
              createdAt: item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : "Baru saja",
              description: "",
              imageUrl: item.service_image_url?.[0] || null,
            };
          });
          setServices(mapped);
          const uniqueCategories = Array.from(new Set(rows.map((s) => s.category).filter(Boolean))) as string[];
          setCategoryOptions([
            { value: "all", label: "Semua Kategori" },
            ...uniqueCategories.map((c) => ({ value: c, label: c })),
          ]);
          return;
        }
      } catch (err) {
        console.error("Error loading services from Supabase", err);
      }

      const stored = getStoredServices();
      const mapped: ServiceItem[] = stored.map((item) => {
        const cat = item.category || "Umum";
        return {
          id: item.id || Date.now(),
          name: item.title,
          category: cat,
          categoryVariant: (item.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[cat] || "green") as BadgeVariant,
          createdAt: item.createdAt || "Baru saja",
          description: item.description || "",
          imageUrl: item.imageUrl,
        };
      });
      setServices(mapped);

      const uniqueCategories = Array.from(new Set(stored.map((s) => s.category).filter(Boolean)));
      const opts: DropdownOption[] = [
        { value: "all", label: "Semua Kategori" },
        ...uniqueCategories.map((c) => ({ value: c, label: c })),
      ];
      setCategoryOptions(opts);
    };

    loadServices();
  }, []);

  // Confirm Delete
  const confirmDelete = async () => {
    if (deleteModal.service) {
      const target = deleteModal.service;
      try {
        await deleteService(target.id);
        setServices((prev) => prev.filter((s) => String(s.id) !== String(target.id)));
        triggerNotif(`Layanan "${target.name}" berhasil dihapus`, "default");
      } catch (err: any) {
        const msg = err?.message || err?.details || "Gagal menghapus layanan dari Supabase";
        console.error("Error deleting service from Supabase:", err);
        triggerNotif(`Gagal menghapus layanan: ${msg}`, "error");
      } finally {
        setDeleteModal({ isOpen: false });
      }
    }
  };

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === "all" || s.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const paginatedServices = filteredServices.slice(
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
        <Sidebar activeId="services" className="shrink-0 h-fit" />

        {/* Content Card */}
        <div className="flex-1 h-full p-6 md:p-8 bg-white rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-5 w-full overflow-hidden min-h-0">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Layanan
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Kelola katalog jasa dan layanan konstruksi serta keselamatan jalan oleh{" "}
                <span className="text-g1 font-semibold">Dua Putra Srikandi</span>.
              </p>
            </div>

            {/* Add Service Button (Navigates to /kelola-layanan/tambah) */}
            <Link href="/kelola-layanan/tambah">
              <Button
                type="button"
                text="Tambah Layanan"
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
                placeholder="Cari nama layanan..."
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
          <div className="self-stretch flex-1 bg-white flex flex-col justify-start items-start gap-2 overflow-x-auto overflow-y-auto min-h-0 w-full pr-1">
            {/* Table Header */}
            <div className="self-stretch min-w-[720px] h-11 bg-white-90 rounded-xl flex items-center px-4 overflow-hidden select-none sticky top-0 z-10 shrink-0">
              <div className="w-14 text-g1 text-sm font-semibold font-sans">No.</div>
              <div className="flex-1 text-g1 text-sm font-semibold font-sans">Nama Layanan</div>
              <div className="w-48 text-g1 text-sm font-semibold font-sans">Kategori</div>
              <div className="w-40 text-g1 text-sm font-semibold font-sans">Waktu Dibuat</div>
              <div className="w-24 text-left text-g1 text-sm font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows */}
            {filteredServices.length === 0 ? (
              <div className="self-stretch py-12 text-center text-slate-400 text-sm font-sans">
                Tidak ada layanan yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              paginatedServices.map((service, idx) => (
                <div
                  key={service.id}
                  className="self-stretch min-w-[720px] min-h-[58px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                >
                  {/* No. */}
                  <div className="w-14 text-dark/90 text-sm font-normal font-sans">
                    {(currentPage - 1) * itemsPerPage + idx + 1}.
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
                  <div className="w-40 text-dark/75 text-sm font-normal font-sans">
                    {service.createdAt}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-24 flex justify-start items-center gap-2.5">
                    {/* Edit Action Button (Navigates to /kelola-layanan/[id]) */}
                    <Link
                      href={`/kelola-layanan/${service.id}`}
                      title="Edit Layanan"
                      className="size-9 p-1 bg-brand-background hover:bg-g1/15 rounded-full flex justify-center items-center text-g1 transition-colors cursor-pointer"
                    >
                      <LordIcon name="Edit" size={18} primaryColor="#0A9863" />
                    </Link>

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
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Pagination Component */}
          <div className="self-stretch shrink-0">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredServices.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="Layanan"
            />
          </div>
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
