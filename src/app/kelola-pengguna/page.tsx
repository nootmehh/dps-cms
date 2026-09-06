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
import DeleteConfirmationModal from "@/components/ui/modal/deleteConfirmation";
import LordIcon from "@/components/common/lordIcon";

export interface UserItem {
  id: number | string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

const STORAGE_KEY = "dps_users_data";

const INITIAL_USERS: UserItem[] = [];

const ROLE_OPTIONS: DropdownOption[] = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
];

const ROLE_FILTER_OPTIONS: DropdownOption[] = [
  { value: "all", label: "Semua Role" },
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
];

const ROLE_VARIANT_MAP: Record<string, BadgeVariant> = {
  "Super Admin": "purple",
  Admin: "green",
};

export default function KelolaPenggunaPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user?: UserItem }>({
    isOpen: false,
  });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    userId?: number | string;
  }>({
    isOpen: false,
    mode: "add",
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "Admin",
    password: "",
    confirmPassword: "",
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

  // Load users from storage
  useEffect(() => {
    const loadUsers = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setUsers(parsed);
            return;
          }
        }
        setUsers([]);
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  const saveUsersToStorage = (updatedUsers: UserItem[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (e) {
      console.error("Failed to save users", e);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({ username: "", email: "", role: "Admin", password: "", confirmPassword: "" });
    setFormModal({ isOpen: true, mode: "add" });
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
    setFormModal({ isOpen: true, mode: "edit", userId: user.id });
  };

  // Save Add / Edit
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      triggerNotif("Username wajib diisi.", "error");
      return;
    }
    if (!formData.email.trim()) {
      triggerNotif("Email wajib diisi.", "error");
      return;
    }

    // Password validation for add or edit
    if (formModal.mode === "add") {
      if (!formData.password.trim()) {
        triggerNotif("Password wajib diisi untuk akun baru.", "error");
        return;
      }
      if (formData.password.length < 6) {
        triggerNotif("Password minimal 6 karakter.", "error");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        triggerNotif("Password dan Konfirmasi Password tidak cocok!", "error");
        return;
      }
    } else if (formModal.mode === "edit") {
      if (formData.password.trim()) {
        if (formData.password.length < 6) {
          triggerNotif("Password minimal 6 karakter.", "error");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          triggerNotif("Password dan Konfirmasi Password tidak cocok!", "error");
          return;
        }
      }
    }

    if (formModal.mode === "add") {
      const newUser: UserItem = {
        id: Date.now(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        createdAt: "Hari ini",
      };

      const nextList = [newUser, ...users];
      saveUsersToStorage(nextList);
      triggerNotif(`Pengguna "${newUser.username}" berhasil ditambahkan!`, "success");
    } else if (formModal.mode === "edit" && formModal.userId) {
      const nextList = users.map((u) =>
        String(u.id) === String(formModal.userId)
          ? {
              ...u,
              username: formData.username.trim(),
              email: formData.email.trim().toLowerCase(),
              role: formData.role,
            }
          : u
      );
      saveUsersToStorage(nextList);
      triggerNotif(`Pengguna "${formData.username.trim()}" berhasil diperbarui!`, "success");
    }

    setFormModal({ isOpen: false, mode: "add" });
  };

  // Handle Delete
  const confirmDelete = () => {
    if (deleteModal.user) {
      // Safety guard against deleting Super Admin
      if (isSuperAdmin(deleteModal.user.role)) {
        triggerNotif("Super Admin tidak dapat dihapus dari sistem!", "error");
        setDeleteModal({ isOpen: false });
        return;
      }

      const nextList = users.filter((u) => String(u.id) !== String(deleteModal.user?.id));
      saveUsersToStorage(nextList);
      triggerNotif(`Pengguna "${deleteModal.user.username}" berhasil dihapus`, "error");
      setDeleteModal({ isOpen: false });
    }
  };

  const isSuperAdmin = (role: string) => {
    return role.trim().toLowerCase() === "super admin" || role.trim().toLowerCase() === "superadmin";
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === "all" || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const paginatedUsers = filteredUsers.slice(
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
        <Sidebar activeId="users" />

        {/* Content Card */}
        <div className="flex-1 p-6 md:p-8 bg-white rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Pengguna
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Kelola akun CMS dan hak akses pengguna di sistem{" "}
                <span className="text-g1 font-semibold">Dua Putra Srikandi</span>.
              </p>
            </div>

            {/* Add User Action Button */}
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
          <div className="w-full h-px bg-g1/10" aria-hidden="true" />

          {/* Search & Filter Row */}
          <div className="self-stretch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
            <div className="w-full sm:max-w-xs">
              <InputBox
                placeholder="Cari nama atau email pengguna..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon="Global"
              />
            </div>
            <div className="w-full sm:w-60">
              <Dropdown
                options={ROLE_FILTER_OPTIONS}
                value={selectedRoleFilter}
                onChange={(val) => {
                  setSelectedRoleFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="Filter Role"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="self-stretch bg-white flex flex-col justify-start items-start gap-2 overflow-x-auto w-full">
            {/* Table Header */}
            <div className="self-stretch min-w-[720px] h-11 bg-white-90 rounded-xl flex items-center px-4 overflow-hidden select-none">
              <div className="w-14 text-g1 text-sm font-semibold font-sans">No.</div>
              <div className="flex-1 text-g1 text-sm font-semibold font-sans">Username</div>
              <div className="w-64 text-g1 text-sm font-semibold font-sans">Email</div>
              <div className="w-48 text-g1 text-sm font-semibold font-sans">Role</div>
              <div className="w-24 text-left text-g1 text-sm font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows */}
            {filteredUsers.length === 0 ? (
              <div className="self-stretch py-12 text-center text-slate-400 text-sm font-sans">
                Tidak ada pengguna yang sesuai dengan pencarian atau filter role.
              </div>
            ) : (
              paginatedUsers.map((user, idx) => {
                const superAdminUser = isSuperAdmin(user.role);
                const roleVariant = ROLE_VARIANT_MAP[user.role] || "green";

                return (
                  <div
                    key={user.id}
                    className="self-stretch min-w-[720px] min-h-[58px] border-b border-white-90 hover:bg-white-90/60 transition-colors flex items-center px-4 py-2"
                  >
                    {/* No. */}
                    <div className="w-14 text-dark/90 text-sm font-normal font-sans">
                      {(currentPage - 1) * itemsPerPage + idx + 1}.
                    </div>

                    {/* Username */}
                    <div className="flex-1 flex items-center gap-3 pr-4">
                      <div className="size-8 rounded-full bg-g1/15 text-g1 font-bold text-xs flex items-center justify-center font-sans shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-dark/90 text-sm font-semibold font-sans line-clamp-1">
                        {user.username}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="w-64 text-dark/80 text-sm font-normal font-sans truncate pr-2">
                      {user.email}
                    </div>

                    {/* Role Badge */}
                    <div className="w-48 flex items-center">
                      <Badge
                        text={user.role}
                        variant={roleVariant}
                        showDot={true}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="w-24 flex justify-start items-center gap-2.5">
                      {/* Edit Action Button */}
                      <button
                        type="button"
                        title="Edit Pengguna"
                        onClick={() => handleOpenEdit(user)}
                        className="size-9 p-1 bg-brand-background hover:bg-g1/15 rounded-full flex justify-center items-center text-g1 transition-colors cursor-pointer"
                      >
                        <LordIcon name="Edit" size={18} primaryColor="#0A9863" />
                      </button>

                      {/* Delete Action Button (Disabled for Super Admin) */}
                      {superAdminUser ? (
                        <button
                          type="button"
                          disabled
                          title="Super Admin tidak dapat dihapus"
                          className="size-9 p-1 bg-slate-100 text-slate-300 rounded-full flex justify-center items-center cursor-not-allowed opacity-50 border border-slate-200"
                        >
                          <LordIcon name="Delete" size={18} primaryColor="#94A3B8" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Hapus Pengguna"
                          onClick={() => setDeleteModal({ isOpen: true, user })}
                          className="size-9 p-1 bg-red-state hover:opacity-90 rounded-full flex justify-center items-center text-white transition-opacity cursor-pointer shadow-xs"
                        >
                          <LordIcon name="Delete" size={18} primaryColor="#FFFFFF" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Divider */}
          <div className="w-full h-px bg-g1/10" aria-hidden="true" />

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="Pengguna"
          />
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${deleteModal.user?.username}" (${deleteModal.user?.email})? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Add / Edit User Modal */}
      {formModal.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-white-80 shadow-2xl flex flex-col gap-5 animate-scale-in">
            <div>
              <h2 className="text-xl font-bold text-dark">
                {formModal.mode === "add" ? "Tambah Pengguna Baru" : "Edit Pengguna"}
              </h2>
              <p className="text-xs text-slate-500">
                {formModal.mode === "add"
                  ? "Masukkan detail username, email, hak akses (role), dan password untuk akun baru."
                  : "Perbarui informasi akun, hak akses, atau ubah password pengguna."}
              </p>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <InputBox
                label={
                  <span>
                    Username <span className="text-red-state">*</span>
                  </span>
                }
                placeholder="cth. Jane Doe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                containerClassName="max-w-none"
              />

              <InputBox
                label={
                  <span>
                    Email <span className="text-red-state">*</span>
                  </span>
                }
                type="email"
                placeholder="cth. jane@duaputra.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                containerClassName="max-w-none"
              />

              <Dropdown
                label={
                  <span>
                    Role / Hak Akses <span className="text-red-state">*</span>
                  </span>
                }
                options={ROLE_OPTIONS}
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                placeholder="Pilih Role Pengguna"
                containerClassName="max-w-none"
              />

              <InputBox
                label={
                  <span>
                    {formModal.mode === "add" ? "Password" : "Password Baru"}{" "}
                    {formModal.mode === "add" ? (
                      <span className="text-red-state">*</span>
                    ) : (
                      <span className="text-dark/40 text-xs font-normal">
                        (Kosongkan jika tidak ingin mengubah)
                      </span>
                    )}
                  </span>
                }
                type="password"
                placeholder={
                  formModal.mode === "add"
                    ? "Minimal 6 karakter..."
                    : "Masukkan password baru jika ingin mengubah..."
                }
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={formModal.mode === "add"}
                containerClassName="max-w-none"
              />

              <InputBox
                label={
                  <span>
                    Konfirmasi {formModal.mode === "add" ? "Password" : "Password Baru"}{" "}
                    {formModal.mode === "add" || formData.password ? (
                      <span className="text-red-state">*</span>
                    ) : null}
                  </span>
                }
                type="password"
                placeholder="Ketik ulang password..."
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required={formModal.mode === "add" || !!formData.password}
                containerClassName="max-w-none"
              />

              <div className="flex justify-end items-center gap-3 pt-3">
                <Button
                  type="button"
                  text="Batal"
                  variant="ghost-green"
                  onClick={() => setFormModal({ isOpen: false, mode: "add" })}
                  className="cursor-pointer"
                />
                <Button
                  type="submit"
                  text={formModal.mode === "add" ? "Simpan Pengguna" : "Perbarui Pengguna"}
                  variant="fill"
                  rightIcon={formModal.mode === "add" ? "Add" : undefined}
                  className="cursor-pointer"
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
