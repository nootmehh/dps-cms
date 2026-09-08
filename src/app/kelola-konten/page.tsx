"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import Notification, { type NotificationType } from "@/components/ui/notification";
import LordIcon from "@/components/common/lordIcon";
import TabContentBeranda from "@/components/content/tabContentBeranda";
import TabContentTentang from "@/components/content/tabContentTentang";
import TabContentPerusahaan from "@/components/content/tabContentPerusahaan";
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
        <Sidebar activeId="content" className="shrink-0 h-fit" />

        {/* Content Card */}
        <div className="flex-1 h-full p-6 md:p-8 bg-white rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-5 w-full overflow-hidden min-h-0">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Konten
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Atur informasi landing page, profil perusahaan, dan kontak resmi{" "}
                <span className="text-g1 font-semibold">Dua Putra Srikandi</span>.
              </p>
            </div>

            {/* Simpan Perubahan Button */}
            <Button
              type="button"
              text={isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              variant="fill"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="shrink-0 cursor-pointer"
            />
          </div>

          {/* Top Divider */}
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Tab Navigation Buttons Bar */}
          <div className="self-stretch flex items-center gap-2 p-1.5 bg-white-90 rounded-2xl border border-white-80 shrink-0 overflow-x-auto">
            {/* Tab 1: Halaman Beranda */}
            <button
              type="button"
              id="tab-beranda"
              onClick={() => setActiveTab("beranda")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                activeTab === "beranda"
                  ? "bg-g1 text-white shadow-sm shadow-g1/25"
                  : "text-dark/70 hover:text-g1 hover:bg-white/80"
              }`}
            >
              <LordIcon
                name="Dashboard"
                size={18}
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
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                activeTab === "tentang"
                  ? "bg-g1 text-white shadow-sm shadow-g1/25"
                  : "text-dark/70 hover:text-g1 hover:bg-white/80"
              }`}
            >
              <LordIcon
                name="Document"
                size={18}
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
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                activeTab === "perusahaan"
                  ? "bg-g1 text-white shadow-sm shadow-g1/25"
                  : "text-dark/70 hover:text-g1 hover:bg-white/80"
              }`}
            >
              <LordIcon
                name="Global"
                size={18}
                primaryColor={activeTab === "perusahaan" ? "#ffffff" : "#0A9863"}
                secondaryColor={activeTab === "perusahaan" ? "#ffffff" : "#0A9863"}
              />
              <span>Detail Perusahaan</span>
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="self-stretch flex-1 flex flex-col gap-6 overflow-y-auto min-h-0 pr-1">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-dark/60">
                <LordIcon name="Document" size={48} primaryColor="#0A9863" />
                <span className="text-sm font-medium">Memuat data konten situs...</span>
              </div>
            ) : (
              <>
                {activeTab === "beranda" && (
                  <TabContentBeranda
                    data={siteContent}
                    onChange={setSiteContent}
                  />
                )}

                {activeTab === "tentang" && (
                  <TabContentTentang
                    data={siteContent}
                    onChange={setSiteContent}
                  />
                )}

                {activeTab === "perusahaan" && (
                  <TabContentPerusahaan
                    data={siteContent}
                    onChange={setSiteContent}
                  />
                )}
              </>
            )}
          </div>
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
