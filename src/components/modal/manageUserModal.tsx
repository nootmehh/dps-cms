"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import Dropdown, { type DropdownOption } from "@/components/ui/dropdown";
import LordIcon from "@/components/common/lordIcon";
import type { UserItem } from "@/services/userApi";

export interface ManageUserModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  user?: UserItem | null;
  onClose: () => void;
  onSave: (data: {
    username: string;
    email: string;
    role: string;
    password?: string;
  }) => Promise<void>;
}

const ROLE_OPTIONS: DropdownOption[] = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
];

export default function ManageUserModal({
  isOpen,
  mode,
  user,
  onClose,
  onSave,
}: ManageUserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "Admin",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSubmitting(false);
      if (mode === "edit" && user) {
        setFormData({
          username: user.username,
          email: user.email,
          role: user.role,
          password: "",
          confirmPassword: "",
        });
      } else {
        setFormData({
          username: "",
          email: "",
          role: "Admin",
          password: "",
          confirmPassword: "",
        });
      }
    }
  }, [isOpen, mode, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim()) {
      setError("Username wajib diisi.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (mode === "add") {
      if (!formData.password.trim()) {
        setError("Password wajib diisi untuk akun baru.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password minimal 6 karakter.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Password dan Konfirmasi Password tidak cocok!");
        return;
      }
    } else {
      if (formData.password.trim()) {
        if (formData.password.length < 6) {
          setError("Password minimal 6 karakter.");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Password dan Konfirmasi Password tidak cocok!");
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      await onSave({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        password: formData.password.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat menyimpan pengguna.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg p-5 sm:p-6 bg-white rounded-t-[32px] sm:rounded-4xl outline -outline-offset-1 outline-slate-200 flex flex-col justify-start items-start gap-5 sm:gap-6 shadow-2xl animate-scale-in max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Title Bar */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex-1 text-dark text-xl font-bold font-sans">
            {mode === "add" ? "Tambah Pengguna Baru" : "Edit Pengguna"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Tutup"
          >
            <LordIcon name="Cross" size={20} primaryColor="#666666" />
          </button>
        </div>

        {/* Top Divider */}
        <div className="self-stretch h-px bg-slate-200" />

        {/* Error Alert */}
        {error && (
          <div className="self-stretch p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-semibold font-sans">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="self-stretch flex flex-col gap-4">
          <InputBox
            label="Username *"
            placeholder="cth. Jane Doe"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            containerClassName="w-full max-w-none"
          />

          <InputBox
            label="Email *"
            type="email"
            placeholder="cth. jane@duaputra.id"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            containerClassName="w-full max-w-none"
          />

          <Dropdown
            label="Role / Hak Akses *"
            options={ROLE_OPTIONS}
            value={formData.role}
            onChange={(val) => setFormData({ ...formData, role: val })}
            placeholder="Pilih Role Pengguna"
            containerClassName="w-full max-w-none"
          />

          <InputBox
            label={
              mode === "add"
                ? "Password *"
                : "Password Baru (Kosongkan jika tidak diubah)"
            }
            type="password"
            placeholder={
              mode === "add"
                ? "Minimal 6 karakter..."
                : "Masukkan password baru jika ingin mengubah..."
            }
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={mode === "add"}
            containerClassName="w-full max-w-none"
          />

          <InputBox
            label={
              mode === "add" || formData.password
                ? "Konfirmasi Password *"
                : "Konfirmasi Password"
            }
            type="password"
            placeholder="Ketik ulang password..."
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required={mode === "add" || !!formData.password}
            containerClassName="w-full max-w-none"
          />

          {/* Bottom Divider */}
          <div className="self-stretch h-px bg-slate-200 my-1" />

          {/* Action Buttons */}
          <div className="self-stretch flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3">
            <Button
              type="button"
              text="Batal"
              variant="ghost-green"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto cursor-pointer"
            />
            <Button
              type="submit"
              text={
                submitting
                  ? "Menyimpan..."
                  : mode === "add"
                  ? "Simpan Pengguna"
                  : "Perbarui Pengguna"
              }
              variant="fill"
              rightIcon={mode === "add" ? "Add" : undefined}
              disabled={submitting}
              className="w-full sm:w-auto cursor-pointer"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
