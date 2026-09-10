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
      <div className="min-h-screen bg-brand-background flex flex-col select-none">
        {/* Navbar */}
        <Navbar
          brandTitle="Dua Putra Srikandi"
          userName={session?.user.username || "Super Admin"}
          userRole={session?.user.role || "Super Admin"}
          onLogout={handleLogout}
          logoutText="Logout Sistem"
        />

        {/* Main Body */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <Sidebar activeId="dashboard" />
          </div>

          {/* Empty Dashboard Content Area */}
          <section className="flex-1 flex flex-col gap-6">
            {/* Header Card */}
            <div className="bg-white p-6 rounded-4xl border border-white-80 shadow-xs flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-g1 font-sans">
                Dashboard
              </h1>
              <p className="text-sm text-dark/60 font-sans">
                Ringkasan sistem Content Management System (CMS) Dua Putra Srikandi.
              </p>
            </div>

            {/* Empty State Card */}
            <div className="bg-white rounded-4xl border border-white-80 shadow-xs p-8 flex flex-col items-center justify-center min-h-[420px]">
              <EmptyState
                iconName="Dashboard"
                iconSize={72}
                primaryColor="#0A9863"
                secondaryColor="#ffc738"
                text="Halaman Dashboard Siap Dikembangkan"
                className="pt-8 pb-4"
              >
                <p className="text-sm text-dark/50 max-w-md mx-auto mt-2 font-sans leading-relaxed">
                  Modul analitik dan ringkasan performa akan segera hadir di sini. Anda dapat menggunakan menu di sidebar untuk mengelola data sistem.
                </p>
              </EmptyState>
            </div>
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
