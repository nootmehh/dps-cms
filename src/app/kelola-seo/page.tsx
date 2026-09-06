"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import Badge from "@/components/ui/badge";
import Notification, { type NotificationType } from "@/components/ui/notification";
import LordIcon from "@/components/common/lordIcon";
import EditPageMetaModal from "@/components/seo/editPageMetaModal";
import ConnectGaModal from "@/components/seo/connectGaModal";
import {
  getSeoSettings,
  updateSeoSettings,
  getPageMetas,
  updatePageMeta,
  type SeoSettingsRow,
  type PageMetaRow,
} from "@/services/seoApi";

export default function KelolaSeoPage() {
  const [settings, setSettings] = useState<SeoSettingsRow>({
    site_title_default: "Dua Putra Srikandi - Jasa & Produk Marka Jalan",
    meta_description_default:
      "Spesialis pengecatan marka jalan, perlengkapan jalan, dan fasilitas keselamatan lalu lintas terpercaya.",
    auto_generate_sitemap: true,
    ga_connected: false,
    ga_measurement_id: null,
  });

  const [pageMetas, setPageMetas] = useState<PageMetaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State for editing page meta
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    meta: PageMetaRow | null;
  }>({
    isOpen: false,
    meta: null,
  });

  // Modal State for Google Analytics
  const [gaModalOpen, setGaModalOpen] = useState(false);

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

  // Load SEO data on mount
  useEffect(() => {
    const loadSeoData = async () => {
      setIsLoading(true);
      try {
        const [settingsData, metasData] = await Promise.all([
          getSeoSettings(),
          getPageMetas(),
        ]);
        if (settingsData) setSettings(settingsData);
        if (metasData) setPageMetas(metasData);
      } catch (err) {
        console.error("Error loading SEO data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeoData();
  }, []);

  // Save General Settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updated = await updateSeoSettings(
        {
          site_title_default: settings.site_title_default,
          meta_description_default: settings.meta_description_default,
          auto_generate_sitemap: settings.auto_generate_sitemap,
          ga_connected: settings.ga_connected,
          ga_measurement_id: settings.ga_measurement_id,
        },
        settings.id
      );
      setSettings(updated);
      triggerNotif("Pengaturan SEO berhasil disimpan!", "default");
    } catch (err: any) {
      console.error("Error saving SEO settings:", err);
      triggerNotif(`Gagal menyimpan SEO: ${err.message || "Terjadi kesalahan di Supabase"}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Page Meta from Modal
  const handleSavePageMeta = async (updatedMeta: PageMetaRow) => {
    try {
      const saved = await updatePageMeta(updatedMeta.id, {
        meta_title: updatedMeta.meta_title,
        meta_description: updatedMeta.meta_description,
        keywords: updatedMeta.keywords,
      });

      setPageMetas((prev) =>
        prev.map((item) => (item.id === saved.id ? saved : item))
      );
      triggerNotif(`Meta untuk halaman "${saved.page_name}" berhasil diperbarui!`, "default");
    } catch (err: any) {
      console.error("Error updating page meta:", err);
      triggerNotif(`Gagal memperbarui meta: ${err.message || "Terjadi kesalahan"}`, "error");
    }
  };

  // Save Google Analytics Connection
  const handleSaveGaConnection = async (connected: boolean, measurementId: string | null) => {
    try {
      const updated = await updateSeoSettings(
        {
          ...settings,
          ga_connected: connected,
          ga_measurement_id: measurementId,
        },
        settings.id
      );
      setSettings(updated);
      triggerNotif(
        connected
          ? `Google Analytics (${measurementId}) berhasil dihubungkan!`
          : "Google Analytics berhasil diputuskan!",
        "default"
      );
    } catch (err: any) {
      console.error("Error updating GA connection:", err);
      triggerNotif(`Gagal memperbarui koneksi: ${err.message || "Terjadi kesalahan"}`, "error");
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
        <Sidebar activeId="seo" className="shrink-0 h-fit" />

        {/* Content Card */}
        <div className="flex-1 h-full p-6 md:p-8 bg-white rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-5 w-full overflow-hidden min-h-0">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola SEO
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Atur meta data, sitemap, dan integrasi tools SEO untuk{" "}
                <span className="text-g1 font-semibold">Dua Putra Srikandi</span>.
              </p>
            </div>

            {/* Simpan Perubahan Button */}
            <Button
              type="button"
              text={isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              variant="fill"
              onClick={handleSaveSettings}
              disabled={isSaving || isLoading}
              className="shrink-0 cursor-pointer"
            />
          </div>

          {/* Top Divider */}
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Scrollable Content Container */}
          <div className="self-stretch flex-1 flex flex-col gap-6 overflow-y-auto min-h-0 pr-1">

          {/* Section 1: Pengaturan Umum */}
          <div className="self-stretch flex flex-col gap-4">
            <h2 className="text-g1 text-lg font-bold font-sans">
              Pengaturan Umum
            </h2>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Site Title Default */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark/70 font-sans">
                  Site Title Default
                </label>
                <InputBox
                  placeholder="Dua Putra Srikandi - Jasa & Produk Marka Jalan"
                  value={settings.site_title_default}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      site_title_default: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Meta Description Default */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark/70 font-sans">
                  Meta Description Default
                </label>
                <InputBox
                  placeholder="Spesialis pengecatan marka jalan, perlengkapan jalan..."
                  value={settings.meta_description_default}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      meta_description_default: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Auto Generate Sitemap Toggle */}
            <div className="self-stretch p-4 bg-white-90/60 rounded-2xl border border-white-80 flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-dark font-sans">
                  Generate Sitemap.xml Otomatis
                </span>
                <span className="text-xs text-dark/60 font-sans">
                  Diperbarui otomatis tiap kali ada konten baru dipublikasikan
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={settings.auto_generate_sitemap}
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    auto_generate_sitemap: !prev.auto_generate_sitemap,
                  }))
                }
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.auto_generate_sitemap ? "bg-g1" : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.auto_generate_sitemap ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 2: Meta Per Halaman */}
          <div className="self-stretch flex flex-col gap-4 pt-2">
            <h2 className="text-g1 text-lg font-bold font-sans">
              Meta Per Halaman
            </h2>

            {/* Page Meta List Container */}
            <div className="self-stretch flex flex-col border border-white-80 rounded-2xl divide-y divide-white-80 overflow-hidden">
              {pageMetas.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex justify-between items-center gap-4 hover:bg-white-90/50 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-dark font-sans">
                      {item.page_name}
                    </span>
                    <span className="text-xs text-dark/50 font-mono">
                      {item.route_path}
                    </span>
                  </div>

                  {/* Edit Button */}
                  <Button
                    type="button"
                    text="Edit Meta"
                    leftIcon="Edit"
                    variant="ghost-green"
                    onClick={() => setEditModal({ isOpen: true, meta: item })}
                    className="cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Integrasi Tools SEO */}
          <div className="self-stretch flex flex-col gap-4 pt-2">
            <h2 className="text-g1 text-lg font-bold font-sans">
              Integrasi Tools SEO
            </h2>

            {/* Integration Item: Google Analytics */}
            <div className="self-stretch p-4 bg-white-90/60 border border-white-80 rounded-2xl flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                {/* GA Logo Icon */}
                <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold text-sm font-sans">
                  GA
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-dark font-sans">
                    Google Analytics 4 (GA4)
                  </span>
                  <span className="text-xs text-dark/60 font-sans">
                    {settings.ga_connected
                      ? `Terhubung (${settings.ga_measurement_id || "Aktif"})`
                      : "Belum terhubung"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Badge */}
                {settings.ga_connected ? (
                  <Badge text="Aktif" variant="green" showDot={true} />
                ) : (
                  <Badge text="Belum Terhubung" variant="orange" showDot={false} />
                )}

                {/* Connect / Edit Button */}
                <Button
                  type="button"
                  text={settings.ga_connected ? "Kelola Integrasi" : "Hubungkan"}
                  leftIcon={settings.ga_connected ? "Setting" : "Global"}
                  variant="ghost-green"
                  onClick={() => setGaModalOpen(true)}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

      {/* Edit Page Meta Modal */}
      <EditPageMetaModal
        isOpen={editModal.isOpen}
        pageMeta={editModal.meta}
        onSave={handleSavePageMeta}
        onClose={() => setEditModal({ isOpen: false, meta: null })}
      />

      {/* Connect Google Analytics Modal */}
      <ConnectGaModal
        isOpen={gaModalOpen}
        isConnected={settings.ga_connected}
        measurementId={settings.ga_measurement_id}
        onSave={handleSaveGaConnection}
        onClose={() => setGaModalOpen(false)}
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
