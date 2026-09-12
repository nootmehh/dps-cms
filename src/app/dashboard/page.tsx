"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import AuthGuard from "@/components/layout/authGuard";
import EmptyState from "@/components/common/emptyState";
import { getAuthSession, clearAuthSession, type AuthSession } from "@/services/authApi";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const current = getAuthSession();
    if (current) {
      setSession(current);
    }
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen lg:h-screen lg:max-h-screen bg-white-90 flex flex-col items-center lg:overflow-hidden select-none">
        {/* Navbar */}
        <Navbar
          brandTitle="Dua Putra Srikandi"
          userName={session?.user.username || "Super Admin"}
          userRole={session?.user.role || "Super Admin"}
          onLogout={handleLogout}
          logoutText="Logout Sistem"
        />

        {/* Main Body */}
        <main className="w-full max-w-360 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 flex-1 flex flex-col md:flex-row justify-center items-start gap-4 sm:gap-6 min-h-0 lg:overflow-hidden lg:h-full">
          {/* Sidebar */}
          <Sidebar activeId="dashboard" className="shrink-0 h-fit" />

          {/* Content Card */}
          <div className="flex-1 w-full p-4 sm:p-6 md:p-8 bg-white rounded-3xl sm:rounded-4xl border border-white-80 hover:border-g1 transition-colors flex flex-col justify-start items-start gap-4 sm:gap-5 overflow-hidden min-h-0 lg:h-full">
            {/* Header Card */}
            <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex-1 flex flex-col justify-start items-start gap-1">
                <h1 className="self-stretch justify-start text-g1 text-xl sm:text-2xl md:text-3xl font-bold font-sans">
                  Dashboard
                </h1>
                <p className="text-dark text-xs sm:text-sm font-normal font-sans">
                  Ringkasan sistem Content Management System (CMS) Dua Putra Srikandi.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

            {/* Empty State Card */}
            <div className="flex-1 w-full flex flex-col items-center justify-center p-6 sm:p-8 min-h-0">
              <EmptyState
                iconName="Dashboard"
                iconSize={72}
                primaryColor="#0A9863"
                secondaryColor="#ffc738"
                text="Halaman Dashboard Siap Dikembangkan"
                className="pt-6 sm:pt-8 pb-4"
              >
                <p className="text-xs sm:text-sm text-dark/50 max-w-md mx-auto mt-2 font-sans leading-relaxed text-center">
                  Modul analitik dan ringkasan performa akan segera hadir di sini. Anda dapat menggunakan menu navigasi untuk mengelola data sistem.
                </p>
              </EmptyState>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
