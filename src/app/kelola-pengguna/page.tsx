"use client";

import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import InputBox from "@/components/ui/inputBox";
import Notification, { type NotificationType } from "@/components/ui/notification";
import DeleteConfirmationModal from "@/components/ui/modal/deleteConfirmation";

interface UserItem {
  id: number;
  username: string;
  email: string;
  role: string;
}

const INITIAL_USERS: UserItem[] = [
  { id: 1, username: "Abraham A", email: "abraham@duaputra.id", role: "Super Admin" },
  { id: 2, username: "Dora D", email: "dora@duaputra.id", role: "Admin Konten" },
  { id: 3, username: "Budi Santoso", email: "budi@duaputra.id", role: "Admin Media" },
];

const Icon = ({ name, className = "size-4 bg-current" }: { name: string; className?: string }) => (
  <span
    style={{
      maskImage: `url("/icons/${name}.svg")`,
      WebkitMaskImage: `url("/icons/${name}.svg")`,
    }}
    className={`mask-contain mask-no-repeat mask-center shrink-0 inline-block ${className}`}
    aria-hidden="true"
  />
);

export default function KelolaPenggunaPage() {
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user?: UserItem }>({
    isOpen: false,
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", role: "Admin" });

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

  // Filter users
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Delete
  const confirmDelete = () => {
    if (deleteModal.user) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.user?.id));
      triggerNotif(`Pengguna "${deleteModal.user.username}" berhasil dihapus`, "error");
      setDeleteModal({ isOpen: false });
    }
  };

  // Handle Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim()) return;

    const newUser: UserItem = {
      id: Date.now(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      role: formData.role,
    };

    setUsers((prev) => [...prev, newUser]);
    setFormData({ username: "", email: "", role: "Admin" });
    setAddModalOpen(false);
    triggerNotif(`Pengguna "${newUser.username}" berhasil ditambahkan!`, "success");
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col items-center">
      {/* Top Navbar */}
      <Navbar
        brandTitle="Dua Putra Srikandi"
        userName="Username"
        userRole="Super Admin"
        onLogout={() => triggerNotif("Anda telah logout dari sistem", "error")}
      />

      {/* Main Body */}
      <main className="w-full max-w-[1440px] px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Sidebar Component */}
        <Sidebar activeId="users" />

        {/* Content Card */}
        <div className="flex-1 p-6 md:p-8 bg-white rounded-[32px] border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Pengguna
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Kelola akun CMS Anda di sini, halaman ini hanya terlihat oleh{" "}
                <span className="text-g1 font-semibold">Super Admin</span>.
              </p>
            </div>

            {/* Add User Action Button */}
            <Button
              type="button"
              text="Tambah Pengguna"
              variant="fill"
              rightIcon="Add"
              onClick={() => setAddModalOpen(true)}
              className="shrink-0 cursor-pointer"
            />
          </div>

          {/* Top Divider */}
          <div className="w-full h-px bg-g1/10" aria-hidden="true" />

          {/* Search bar helper */}
          <div className="w-full max-w-sm">
            <InputBox
              placeholder="Cari nama atau email pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon="Global"
            />
          </div>

          {/* Table Container */}
          <div className="self-stretch bg-white flex flex-col justify-start items-start gap-2 overflow-x-auto w-full">
            {/* Table Header */}
            <div className="self-stretch min-w-[640px] h-11 bg-brand-background rounded-xl flex items-center px-4 overflow-hidden select-none">
              <div className="w-16 text-g1 text-sm font-semibold font-sans">No.</div>
              <div className="flex-1 text-g1 text-sm font-semibold font-sans">Username</div>
              <div className="w-80 text-g1 text-sm font-semibold font-sans">Email</div>
              <div className="w-28 text-center text-g1 text-sm font-semibold font-sans">Action</div>
            </div>

            {/* Table Rows */}
            {filteredUsers.length === 0 ? (
              <div className="self-stretch py-12 text-center text-slate-400 text-sm font-sans">
                Tidak ada pengguna yang sesuai dengan pencarian.
              </div>
            ) : (
              filteredUsers.map((user, idx) => (
                <div
                  key={user.id}
                  className="self-stretch min-w-[640px] h-14 border-b border-brand-background hover:bg-brand-background/40 transition-colors flex items-center px-4"
                >
                  <div className="w-16 text-dark/90 text-sm font-normal font-sans">
                    {idx + 1}.
                  </div>
                  <div className="flex-1 text-dark/90 text-sm font-semibold font-sans">
                    {user.username}
                  </div>
                  <div className="w-80 text-dark/80 text-sm font-normal font-sans">
                    {user.email}
                  </div>
                  <div className="w-28 flex justify-center items-center gap-2.5">
                    {/* Edit Action Button */}
                    <button
                      type="button"
                      title="Edit Pengguna"
                      onClick={() =>
                        triggerNotif(`Edit fitur untuk ${user.username} sedang diproses`, "default")
                      }
                      className="size-9 p-2 bg-brand-background hover:bg-g1/15 rounded-full flex justify-center items-center text-g1 transition-colors cursor-pointer"
                    >
                      <Icon name="Edit" className="size-4 bg-g1" />
                    </button>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      title="Hapus Pengguna"
                      onClick={() => setDeleteModal({ isOpen: true, user })}
                      className="size-9 p-2 bg-red-state hover:opacity-90 rounded-full flex justify-center items-center text-white transition-opacity cursor-pointer shadow-xs"
                    >
                      <Icon name="Delete" className="size-4 bg-white" />
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
        message={`Apakah Anda yakin ingin menghapus akun "${deleteModal.user?.username}"? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Add User Modal */}
      {addModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-white-80 shadow-2xl flex flex-col gap-5 animate-scale-in">
            <div>
              <h2 className="text-xl font-bold text-dark">Tambah Pengguna Baru</h2>
              <p className="text-xs text-slate-500">
                Masukkan detail username dan email untuk membuat akun CMS baru.
              </p>
            </div>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <InputBox
                label="Username"
                placeholder="cth. Jane Doe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <InputBox
                label="Email"
                type="email"
                placeholder="cth. jane@duaputra.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <div className="flex justify-end items-center gap-3 pt-2">
                <Button
                  type="button"
                  text="Batal"
                  variant="ghost-green"
                  onClick={() => setAddModalOpen(false)}
                />
                <Button type="submit" text="Simpan Pengguna" variant="fill" />
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
