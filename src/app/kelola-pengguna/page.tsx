"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import InputBox from "@/components/ui/inputBox";
import Dropdown, { type DropdownOption } from "@/components/ui/dropdown";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import Notification, { type NotificationType } from "@/components/ui/notification";
import DeleteConfirmationModal from "@/components/modal/deleteConfirmation";
import ManageUserModal from "@/components/modal/manageUserModal";
import LordIcon from "@/components/common/lordIcon";
import EmptyState from "@/components/common/emptyState";
import AuthGuard from "@/components/layout/authGuard";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserItem,
} from "@/services/userApi";

const ROLE_FILTER_OPTIONS: DropdownOption[] = [
  { value: "all", label: "Semua Role" },
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
];

const SORT_OPTIONS: DropdownOption[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlama", label: "Terlama" },
  { value: "a-z", label: "A - Z" },
  { value: "z-a", label: "Z - A" },
];

const formatRole = (role?: string) => {
  if (!role) return "Admin";
  const normalized = role.toLowerCase().replace(/[_-]/g, " ").trim();
  if (normalized === "super admin" || normalized === "superadmin") {
    return "Super Admin";
  }
  if (normalized === "admin") {
    return "Admin";
  }
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const getRoleVariant = (role?: string): BadgeVariant => {
  if (!role) return "green";
  const normalized = role.toLowerCase().replace(/[_-]/g, " ").trim();
  if (normalized.includes("super")) return "purple";
  return "green";
};

export default function KelolaPenggunaPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState<string>("terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user?: UserItem }>({
    isOpen: false,
  });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    user: UserItem | null;
  }>({
    isOpen: false,
    mode: "add",
    user: null,
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

  // Load users on mount directly from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err: any) {
        console.error("Error loading users from Supabase:", err);
        triggerNotif(`Gagal memuat pengguna dari Supabase: ${err.message || "Terjadi kesalahan"}`, "error");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const isSuperAdmin = (role?: string) => {
    if (!role) return false;
    const normalized = role.trim().toLowerCase().replace(/[_-]/g, " ");
    return normalized === "super admin" || normalized === "superadmin";
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormModal({ isOpen: true, mode: "add", user: null });
  };

  // Open Edit Modal (Super Admin cannot be edited)
  const handleOpenEdit = (user: UserItem) => {
    if (isSuperAdmin(user.role)) {
      triggerNotif("Akun Super Admin tidak dapat diedit!", "error");
      return;
    }
    setFormModal({ isOpen: true, mode: "edit", user });
  };

  // Save Add / Edit User directly to Supabase
  const handleSaveUser = async (data: {
    username: string;
    email: string;
    role: string;
    password?: string;
  }) => {
    try {
      if (formModal.mode === "add") {
        const created = await createUser({
          username: data.username,
          email: data.email,
          role: data.role,
          password: data.password!,
        });
        setUsers((prev) => [created, ...prev]);
        triggerNotif(`Pengguna "${created.username}" berhasil ditambahkan!`, "default");
      } else if (formModal.mode === "edit" && formModal.user) {
        if (isSuperAdmin(formModal.user.role)) {
          triggerNotif("Akun Super Admin tidak dapat diedit!", "error");
          return;
        }
        const updated = await updateUser(formModal.user.id, data);
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        );
        triggerNotif(`Pengguna "${updated.username}" berhasil diperbarui!`, "default");
      }
    } catch (err: any) {
      console.error("Error saving user:", err);
      const isRls =
        err?.message?.toLowerCase().includes("row-level security") ||
        err?.code === "42501";
      const msg = isRls
        ? "Gagal menyimpan: Policy RLS tabel 'users' belum diizinkan. Silakan aktifkan policy INSERT/UPDATE di Supabase SQL Editor."
        : err?.message || "Terjadi kesalahan saat menyimpan ke Supabase";
      triggerNotif(msg, "error");
      throw err;
    }
  };

  // Confirm Delete User directly from Supabase
  const confirmDelete = async () => {
    if (!deleteModal.user) return;

    if (isSuperAdmin(deleteModal.user.role)) {
      triggerNotif("Super Admin tidak dapat dihapus dari sistem!", "error");
      setDeleteModal({ isOpen: false });
      return;
    }

    const target = deleteModal.user;
    try {
      await deleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      triggerNotif(`Pengguna "${target.username}" berhasil dihapus`, "default");
    } catch (err: any) {
      console.error("Error deleting user:", err);
      const isRls =
        err?.message?.toLowerCase().includes("row-level security") ||
        err?.code === "42501";
      const msg = isRls
        ? "Gagal menghapus: Policy RLS tabel 'users' belum mengizinkan DELETE di Supabase."
        : err?.message || "Gagal menghapus pengguna dari Supabase";
      triggerNotif(msg, "error");
    } finally {
      setDeleteModal({ isOpen: false });
    }
  };

  // Filter and Sort users
  const filteredUsers = users
    .filter((u) => {
      const matchesSearch =
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        selectedRoleFilter === "all" ||
        formatRole(u.role).toLowerCase() === formatRole(selectedRoleFilter).toLowerCase();
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (selectedSort === "a-z") {
        return a.username.localeCompare(b.username);
      }
      if (selectedSort === "z-a") {
        return b.username.localeCompare(a.username);
      }
      if (selectedSort === "terlama") {
        return String(a.id).localeCompare(String(b.id));
      }
      return String(b.id).localeCompare(String(a.id));
    });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AuthGuard>
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
        <Sidebar activeId="users" className="shrink-0 h-fit" />

        {/* Content Card */}
        <div className="flex-1 w-full p-4 sm:p-6 md:p-8 bg-white rounded-3xl sm:rounded-4xl border border-white-80 hover:border-g1 transition-colors flex flex-col justify-start items-start gap-4 sm:gap-5 overflow-hidden min-h-0 lg:h-full">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-xl sm:text-2xl md:text-3xl font-bold font-sans">
                Kelola Pengguna
              </h1>
              <p className="text-dark text-xs sm:text-sm font-normal font-sans">
                Kelola akun admin dan hak akses pengguna sistem di halaman ini
              </p>
            </div>

            {/* Add User Button */}
            <Button
              type="button"
              text="Tambah Pengguna"
              variant="fill"
              rightIcon="Add"
              onClick={handleOpenAdd}
              className="shrink-0 cursor-pointer"
            />
          </div>

          {/* Top Divider */}
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Filter and Search Row */}
          <div className="self-stretch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full shrink-0">
            <div className="w-full sm:max-w-xs">
              <InputBox
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon="Search"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-56">
                <Dropdown
                  options={ROLE_FILTER_OPTIONS}
                  value={selectedRoleFilter}
                  onChange={(val) => {
                    setSelectedRoleFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter Role"
                  searchPlaceholder="Search Role"
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
            {/* Sticky Table Header */}
            <div className="self-stretch min-w-[840px] h-11 bg-white-90 rounded-xl flex items-center px-4 overflow-hidden select-none sticky top-0 z-10 shrink-0">
              <div className="w-14 text-g1 text-xs font-semibold font-sans">No.</div>
              <div className="flex-1 text-g1 text-xs font-semibold font-sans">Nama Pengguna</div>
              <div className="w-64 text-g1 text-xs font-semibold font-sans">Email</div>
              <div className="w-40 text-g1 text-xs font-semibold font-sans">Role</div>
              <div className="w-32 text-g1 text-xs font-semibold font-sans">Waktu Dibuat</div>
              <div className="w-24 text-left text-g1 text-xs font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows or Empty State */}
            {isLoading ? (
              <div className="w-full py-20 flex flex-col items-center justify-center gap-3 text-g1">
                <div className="w-9 h-9 border-3 border-g1 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-dark/60 font-sans">
                  Memuat data pengguna...
                </span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                text={
                  searchQuery || selectedRoleFilter !== "all"
                    ? "Tidak ada pengguna yang sesuai dengan pencarian atau filter Anda."
                    : "Belum ada pengguna yang terdaftar saat ini."
                }
              />
            ) : (
              paginatedUsers.map((user, idx) => (
                <div
                  key={user.id}
                  className="self-stretch min-w-[840px] min-h-[54px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                >
                  {/* No. */}
                  <div className="w-14 text-dark/90 text-xs font-normal font-sans">
                    {(currentPage - 1) * itemsPerPage + idx + 1}.
                  </div>

                  {/* Nama Pengguna */}
                  <div className="flex-1 flex items-center pr-4">
                    <span className="text-dark/90 text-xs font-semibold font-sans truncate">
                      {user.username}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="w-64 text-dark/75 text-xs font-normal font-sans truncate pr-2">
                    {user.email}
                  </div>

                  {/* Role Badge */}
                  <div className="w-40 flex items-center pr-2">
                    <Badge
                      text={formatRole(user.role)}
                      variant={getRoleVariant(user.role)}
                      showDot={true}
                    />
                  </div>

                  {/* Waktu Dibuat */}
                  <div className="w-32 text-dark/75 text-xs font-normal font-sans">
                    {user.createdAt || "Baru saja"}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-24 flex justify-start items-center gap-2.5">
                    {isSuperAdmin(user.role) ? (
                      <span className="text-xs font-semibold text-dark/40 font-sans select-none">
                        Terkunci
                      </span>
                    ) : (
                      <>
                        {/* Edit Action Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          title="Edit Pengguna"
                          className="group size-9 p-1 bg-brand-background text-g1 border border-g1/40 hover:border-g1 hover:bg-g1/15 hover:opacity-80 rounded-full flex justify-center items-center hover:shadow-[0px_2px_6px_0px_rgba(6,137,81,0.25)] active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                          <LordIcon
                            name="Edit"
                            size={18}
                            primaryColor="#0A9863"
                            trigger="hover"
                            target="button, .group"
                          />
                        </button>

                        {/* Delete Action Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteModal({ isOpen: true, user })}
                          title="Hapus Pengguna"
                          className="size-9 p-1 bg-red-state text-white border border-red-300 hover:border-red-400 hover:opacity-80 active:opacity-60 active:scale-95 rounded-full flex justify-center items-center hover:shadow-[0px_2px_6px_0px_rgba(249,76,76,0.3)] transition-all duration-200 cursor-pointer shadow-xs"
                        >
                          <LordIcon name="Delete" size={18} primaryColor="#FFFFFF" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Divider */}
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Bottom Pagination */}
          <div className="self-stretch shrink-0">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="Pengguna"
            />
          </div>
        </div>
      </main>

      {/* Delete User Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${deleteModal.user?.username}" (${deleteModal.user?.email})? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Add / Edit User Modal */}
      <ManageUserModal
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        user={formModal.user}
        onClose={() => setFormModal({ isOpen: false, mode: "add", user: null })}
        onSave={handleSaveUser}
      />

      {/* Toast Notification */}
      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
    </AuthGuard>
  );
}
