"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import Notification, { type NotificationType } from "@/components/ui/notification";
import { loginUser, getAuthSession } from "@/services/authApi";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Check if user already logged in on mount
  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      router.replace("/dashboard");
      return;
    }

    if (searchParams.get("expired") === "1") {
      triggerNotif(
        "Sesi login Anda telah berakhir (keamanan 30 menit). Silakan login kembali.",
        "error"
      );
    } else if (searchParams.get("login_required") === "1") {
      triggerNotif(
        "Silakan login terlebih dahulu untuk mengakses Content Management System.",
        "error"
      );
    } else if (searchParams.get("logout") === "1") {
      triggerNotif("Anda telah berhasil logout dari sistem.", "default");
    }
  }, [router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      triggerNotif("Silakan masukkan email Anda.", "error");
      return;
    }
    if (!password.trim()) {
      triggerNotif("Silakan masukkan password Anda.", "error");
      return;
    }

    setLoading(true);
    try {
      const session = await loginUser(email, password);
      triggerNotif(`Selamat datang kembali, ${session.user.username}!`, "default");
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (err: any) {
      console.error("Login failed:", err);
      triggerNotif(err?.message || "Gagal login ke sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-stone-100 flex justify-center items-center p-4 overflow-hidden select-none">
      {/* Login Card matching user CSS */}
      <div className="w-full max-w-[466px] p-6 bg-white rounded-[32px] shadow-[0px_2px_4px_0px_rgba(6,137,81,0.25)] inline-flex flex-col justify-start items-start gap-5">
        {/* Brand Header */}
        <div className="inline-flex justify-start items-center gap-2.5">
          <img
            className="h-8 w-auto object-contain"
            src="/dps-logo-icon.png"
            alt="Logo Dua Putra Srikandi"
          />
          <div className="justify-start text-green-950 text-2xl font-bold font-serif tracking-tight">
            Dua Putra Srikandi
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="justify-start text-slate-900/40 text-sm font-normal font-sans">
            LOGIN KE SISTEM
          </div>
          <div className="self-stretch justify-start text-emerald-600 text-3xl font-bold font-sans leading-tight">
            Content <br />
            Management System
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleLogin} className="self-stretch flex flex-col gap-4">
          {/* Email Field via InputBox Component */}
          <InputBox
            label="Email"
            type="email"
            placeholder="your@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            containerClassName="w-full max-w-none"
            leftIcon="User"
          />

          {/* Password Field via InputBox Component */}
          <InputBox
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan Password Anda"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            containerClassName="w-full max-w-none"
            leftIcon="input-pin"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pr-1 text-slate-900/40 hover:text-slate-900 text-xs font-semibold focus:outline-none cursor-pointer transition-colors"
                tabIndex={-1}
              >
                {showPassword ? "Sembunyikan" : "Lihat"}
              </button>
            }
          />

          {/* Divider matching user CSS */}
          <div className="self-stretch h-px bg-gray-200 my-1" aria-hidden="true" />

          {/* Action Button via Button Component */}
          <Button
            type="submit"
            text={loading ? "Memproses..." : "Login Ke Sistem"}
            variant="unique-green"
            rightIcon="arrow-right"
            disabled={loading}
            className="w-full"
          />
        </form>

        {/* Forgot Password Text (Non-clickable) */}
        <div className="self-stretch text-center justify-start text-emerald-600 text-sm font-normal font-sans select-none">
          Lupa Password? Kontak Administrator.
        </div>
      </div>

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
