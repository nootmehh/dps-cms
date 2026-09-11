"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import Notification, { type NotificationType } from "@/components/ui/notification";
import LordIcon from "@/components/common/lordIcon";
import TabContentBeranda from "@/components/form/tabContentBeranda";
import TabContentTentang from "@/components/form/tabContentTentang";
import TabContentPerusahaan from "@/components/form/tabContentPerusahaan";
import {
  getSiteContent,
  updateSiteContent,
  DEFAULT_SITE_CONTENT,
  type SiteContentRow,
} from "@/services/siteContentApi";

type ActiveTabType = "beranda" | "tentang" | "perusahaan";

export default function KelolaKontenPage() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("beranda");
  const [siteContent, setSiteContent] = useState<SiteContentRow>(DEFAULT_SITE_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Notification Toast State
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

  // Load site content from Supabase on mount
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const data = await getSiteContent();
        if (data) {
          setSiteContent(data);
        }
      } catch (err) {
        console.error("Error loading site_content:", err);
        triggerNotif("Menggunakan data cache lokal (Supabase offline/belum siap)", "default");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  // Listen for global upload errors (e.g. timeout / abort error) to display toast notification
  useEffect(() => {
    const handleUploadError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string; type?: NotificationType }>;
      if (customEvent.detail?.message) {
        triggerNotif(customEvent.detail.message, customEvent.detail.type || "error");
      }
    };
    window.addEventListener("dps-upload-error", handleUploadError);
    return () => window.removeEventListener("dps-upload-error", handleUploadError);
  }, []);

  // Save changes to Supabase
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await updateSiteContent(siteContent, siteContent.id);
      setSiteContent(saved);
      triggerNotif("Konten situs berhasil diperbarui ke Supabase!", "default");
    } catch (err: any) {
      console.error("Error saving site_content:", err);
      triggerNotif(
        `Gagal menyimpan: ${err.message || "Terjadi kesalahan di Supabase"}`,
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

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
      <main className="w-full max-w-360 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Sidebar Component */}
        <Sidebar activeId="content" className="md:sticky md:top-8 shrink-0" />

        {/* Content Card */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white rounded-3xl sm:rounded-[32px] border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Konten Website
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Kelola konten dan informasi website di halaman ini
              </p>
            </div>

            {/* Simpan Perubahan Button */}
            <Button
              type="button"
              text={isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              variant="fill"
              rightIcon="Pen"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="w-full sm:w-auto shrink-0 cursor-pointer"
            />
          </div>

          {/* Top Divider */}
          <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

          {/* Tab Navigation Buttons Bar */}
          <div className="self-stretch flex items-center gap-2 p-1.5 bg-white-90 rounded-full border border-white-80 shrink-0 overflow-x-auto">
            {/* Tab 1: Halaman Beranda */}
            <button
              type="button"
              id="tab-beranda"
              onClick={() => setActiveTab("beranda")}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full font-sans text-sm font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-[0.98] ${
                activeTab === "beranda"
                  ? "bg-g1 text-white border border-g2 shadow-sm shadow-g1/25 hover:opacity-80 active:opacity-60"
                  : "text-dark/70 border border-transparent hover:border-g1/40 hover:text-g1 hover:bg-white hover:opacity-80 active:opacity-60 hover:shadow-xs hover:-translate-y-0.5"
              }`}
            >
              <LordIcon
                name="Document"
                size={18}
                trigger="hover"
                target="button"
                primaryColor={activeTab === "beranda" ? "#ffffff" : "#0A9863"}
                secondaryColor={activeTab === "beranda" ? "#ffffff" : "#0A9863"}
              />
              <span>Halaman Beranda</span>
            </button>

            {/* Tab 2: Halaman Tentang */}
            <button
              type="button"
              id="tab-tentang"
              onClick={() => setActiveTab("tentang")}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full font-sans text-sm font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-[0.98] ${
                activeTab === "tentang"
                  ? "bg-g1 text-white border border-g2 shadow-sm shadow-g1/25 hover:opacity-80 active:opacity-60"
                  : "text-dark/70 border border-transparent hover:border-g1/40 hover:text-g1 hover:bg-white hover:opacity-80 active:opacity-60 hover:shadow-xs hover:-translate-y-0.5"
              }`}
            >
              <LordIcon
                name="Target"
                size={18}
                trigger="hover"
                target="button"
                primaryColor={activeTab === "tentang" ? "#ffffff" : "#0A9863"}
                secondaryColor={activeTab === "tentang" ? "#ffffff" : "#0A9863"}
              />
              <span>Halaman Tentang</span>
            </button>

            {/* Tab 3: Detail Perusahaan */}
            <button
              type="button"
              id="tab-perusahaan"
              onClick={() => setActiveTab("perusahaan")}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full font-sans text-sm font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-[0.98] ${
                activeTab === "perusahaan"
                  ? "bg-g1 text-white border border-g2 shadow-sm shadow-g1/25 hover:opacity-80 active:opacity-60"
                  : "text-dark/70 border border-transparent hover:border-g1/40 hover:text-g1 hover:bg-white hover:opacity-80 active:opacity-60 hover:shadow-xs hover:-translate-y-0.5"
              }`}
            >
              <LordIcon
                name="InfoCircle"
                size={18}
                trigger="hover"
                target="button"
                primaryColor={activeTab === "perusahaan" ? "#ffffff" : "#0A9863"}
                secondaryColor={activeTab === "perusahaan" ? "#ffffff" : "#0A9863"}
              />
              <span>Detail Perusahaan</span>
            </button>
          </div>

          {/* Form Content Area */}
          {isLoading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-g1">
              <div className="w-10 h-10 border-4 border-g1 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-sans text-dark/60">Memuat data konten situs...</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="flex flex-col gap-8 w-full"
            >
              {activeTab === "beranda" && (
                <TabContentBeranda
                  data={siteContent}
                  onChange={setSiteContent}
                  onError={(msg) => triggerNotif(msg, "error")}
                />
              )}

              {activeTab === "tentang" && (
                <TabContentTentang
                  data={siteContent}
                  onChange={setSiteContent}
                  onError={(msg) => triggerNotif(msg, "error")}
                />
              )}

              {activeTab === "perusahaan" && (
                <TabContentPerusahaan
                  data={siteContent}
                  onChange={setSiteContent}
                />
              )}

              {/* Form Bottom Divider */}
              <div className="self-stretch h-px bg-g1/10 mt-2" aria-hidden="true" />

              {/* Action Buttons at Bottom */}
              <div className="self-stretch flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-2 w-full">
                <Button
                  type="submit"
                  disabled={isSaving}
                  text={isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  variant="fill"
                  rightIcon="Pen"
                  className="w-full sm:w-56 cursor-pointer"
                />
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Notification Toast */}
      <Notification
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
