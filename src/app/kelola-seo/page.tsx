"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import DescriptionBox from "@/components/ui/descriptionBox";
import UploadFile from "@/components/ui/uploadFile";
import Badge from "@/components/ui/badge";
import SectionHeading from "@/components/ui/sectionHeading";
import Notification, { type NotificationType } from "@/components/ui/notification";
import { uploadFileToServer } from "@/shared/api/upload";
import {
  getSeoSettings,
  updateSeoSettings,
  type SeoSettingsRow,
} from "@/services/seoApi";

export default function KelolaSeoPage() {
  const [settings, setSettings] = useState<SeoSettingsRow>({
    site_title_default: "Dua Putra Srikandi - Jasa & Produk Marka Jalan",
    meta_description_default:
      "Spesialis pengecatan marka jalan, perlengkapan jalan, dan fasilitas keselamatan lalu lintas terpercaya.",
    keywords: "marka jalan, cat thermoplastic, rambu lalu lintas, guardrail, jasa marka jalan",
    favicon_url: null,
    ga_connected: false,
    ga_measurement_id: null,
  });

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

  // Load SEO data on mount
  useEffect(() => {
    const loadSeoData = async () => {
      setIsLoading(true);
      try {
        const settingsData = await getSeoSettings();
        if (settingsData) setSettings(settingsData);
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
          keywords: settings.keywords,
          favicon_url: settings.favicon_url,
          ga_connected: settings.ga_connected,
          ga_measurement_id: settings.ga_measurement_id,
        },
        settings.id
      );
      setSettings(updated);
      triggerNotif("Pengaturan SEO berhasil disimpan!", "default");
    } catch (err: any) {
      console.error("Error saving SEO settings:", err);
      const msg =
        err?.code === "PGRST205"
          ? "Tabel public.seo_settings belum ada di Supabase. Silakan jalankan query SQL terlebih dahulu."
          : err?.message || "Terjadi kesalahan saat menyimpan ke Supabase";
      triggerNotif(`Gagal menyimpan SEO: ${msg}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Parse keywords into individual tags for visual chip display
  const parsedKeywords = useMemo(() => {
    if (!settings.keywords) return [];
    return settings.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }, [settings.keywords]);

  return (
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
        <Sidebar activeId="seo" className="shrink-0 h-fit" />

        {/* Content Card */}
        <div className="flex-1 w-full p-4 sm:p-6 md:p-8 bg-white rounded-3xl sm:rounded-4xl border border-white-80 hover:border-g1 transition-colors flex flex-col justify-start items-start gap-4 sm:gap-5 overflow-hidden min-h-0 lg:h-full">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-xl sm:text-2xl md:text-3xl font-bold font-sans">
                Kelola SEO
              </h1>
              <p className="text-dark text-xs sm:text-sm font-normal font-sans">
                Kelola konfigurasi SEO situs, favicon, dan kata kunci di halaman ini.
              </p>
            </div>

            {/* Simpan Perubahan Button */}
            <Button
              type="button"
              text={isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              variant="fill"
              rightIcon="Pen"
              onClick={handleSaveSettings}
              disabled={isSaving || isLoading}
              className="shrink-0 cursor-pointer w-full sm:w-auto"
            />
          </div>

          {/* Top Divider */}
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Scrollable Content Container */}
          <div className="self-stretch flex-1 flex flex-col gap-8 overflow-y-auto min-h-0 pr-1">
            {/* Section 1: Pengaturan Umum */}
            <div className="self-stretch flex flex-col gap-5">
              <SectionHeading
                number={1}
                title="Pengaturan Umum"
                info="Informasi dasar metadata yang akan dibaca oleh peramban browser dan mesin pencari seperti Google dan Bing."
              />

              {/* Favicon Upload */}
              <div className="self-stretch">
                <UploadFile
                  label="Favicon Situs *"
                  info="Ikon kecil situs web yang ditampilkan pada tab browser dan daftar bookmark pengguna."
                  descriptionPrefix="Format Disarankan"
                  descriptionValue="(ICO, PNG, SVG - Rasio 1:1, Maks 2MB)"
                  fileTypesHint="(ICO, PNG, SVG)"
                  accept="image/x-icon,image/png,image/svg+xml,image/vnd.microsoft.icon,image/webp,image/jpeg"
                  previewLayout="compact"
                  defaultImageUrl={settings.favicon_url || undefined}
                  onSelectMediaUrl={(url) =>
                    setSettings((prev) => ({ ...prev, favicon_url: url }))
                  }
                  onFilesSelected={async (files) => {
                    if (files[0]) {
                      try {
                        const uploadedUrl = await uploadFileToServer(files[0], "site");
                        setSettings((prev) => ({ ...prev, favicon_url: uploadedUrl }));
                        triggerNotif("Favicon berhasil diunggah!", "default");
                      } catch {
                        const blobUrl = URL.createObjectURL(files[0]);
                        setSettings((prev) => ({ ...prev, favicon_url: blobUrl }));
                        triggerNotif("Favicon disimpan secara lokal", "default");
                      }
                    }
                  }}
                  onRemoveDefaultImage={() =>
                    setSettings((prev) => ({ ...prev, favicon_url: null }))
                  }
                />
              </div>

              {/* Site Title Default - Full Width */}
              <div className="self-stretch">
                <InputBox
                  label="Site Title Default *"
                  info="Judul utama situs yang muncul pada tab browser dan tajuk teratas di hasil pencarian Google (disarankan 50-60 karakter)."
                  placeholder="Dua Putra Srikandi - Jasa & Produk Marka Jalan"
                  value={settings.site_title_default}
                  containerClassName="w-full max-w-none"
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      site_title_default: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Meta Description Default - Full Width */}
              <div className="self-stretch">
                <DescriptionBox
                  label="Meta Description Default *"
                  info="Ringkasan konten website yang ditampilkan pada snippet hasil pencarian mesin pencari Google (disarankan 120-160 karakter)."
                  placeholder="Tulis ringkasan deskripsi meta untuk ditampilkan di hasil pencarian Google..."
                  containerClassName="w-full max-w-none"
                  rows={3}
                  value={settings.meta_description_default}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      meta_description_default: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Keywords Input with Tag Chips - Full Width */}
              <div className="self-stretch flex flex-col gap-2">
                <InputBox
                  label="Target Keywords (Kata Kunci SEO) *"
                  info="Daftar kata kunci target utama untuk membantu mesin pencari mengidentifikasi topik website Anda. Pisahkan setiap kata kunci dengan tanda koma (,)."
                  placeholder="marka jalan, cat thermoplastic, rambu lalu lintas, guardrail, jasa marka jalan"
                  value={settings.keywords || ""}
                  containerClassName="w-full max-w-none"
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      keywords: e.target.value,
                    }))
                  }
                />

                {/* Active Keyword Chips */}
                {parsedKeywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs font-semibold text-dark/70 font-sans mr-1">
                      Kata Kunci Aktif ({parsedKeywords.length}):
                    </span>
                    {parsedKeywords.map((kw, idx) => (
                      <Badge
                        key={`${kw}-${idx}`}
                        text={kw}
                        variant="green"
                        showDot={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

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
