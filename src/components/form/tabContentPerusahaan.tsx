"use client";

import { useState } from "react";
import InputBox from "@/components/ui/inputBox";
import Button from "@/components/ui/button";
import LordIcon from "@/components/common/lordIcon";
import type { SiteContentRow, LegalityDoc } from "@/services/siteContentApi";

interface TabContentPerusahaanProps {
  data: SiteContentRow;
  onChange: (updater: (prev: SiteContentRow) => SiteContentRow) => void;
}

export default function TabContentPerusahaan({
  data,
  onChange,
}: TabContentPerusahaanProps) {
  // Local state for new legality document
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocNumber, setNewDocNumber] = useState("");
  const [newDocIssuer, setNewDocIssuer] = useState("");

  const handleAddLegality = () => {
    if (!newDocTitle.trim() || !newDocNumber.trim()) return;
    const newDoc: LegalityDoc = {
      id: `leg-${Date.now()}`,
      title: newDocTitle.trim(),
      doc_number: newDocNumber.trim(),
      issuer: newDocIssuer.trim() || "Instansi Pemerintah",
    };

    onChange((prev) => ({
      ...prev,
      legality: [...(prev.legality || []), newDoc],
    }));

    setNewDocTitle("");
    setNewDocNumber("");
    setNewDocIssuer("");
  };

  const handleRemoveLegality = (index: number) => {
    onChange((prev) => ({
      ...prev,
      legality: (prev.legality || []).filter((_, i) => i !== index),
    }));
  };

  const updateSocialMedia = (platform: string, value: string) => {
    onChange((prev) => ({
      ...prev,
      social_media: {
        ...(prev.social_media || {}),
        [platform]: value,
      },
    }));
  };

  const socialMedia = data.social_media || {};

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Section 1: Informasi Kontak Utama */}
      <section className="flex flex-col gap-5 p-5 md:p-6 bg-white rounded-3xl border border-white-80 shadow-xs">
        <div className="text-g1 text-base font-bold font-sans">
          1. Informasi Kontak Resmi Perusahaan
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputBox
            label="Nomor Telepon Kantor"
            placeholder="+62 21 8899 0011"
            value={data.phone || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, phone: e.target.value }))
            }
          />

          <InputBox
            label="Alamat Email Resmi"
            placeholder="info@duaputrasrikandi.co.id"
            type="email"
            value={data.email || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <InputBox
            label="Tautan WhatsApp CS"
            placeholder="https://wa.me/6281234567890"
            value={data.whatsapp_url || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, whatsapp_url: e.target.value }))
            }
          />
        </div>

        {/* Alamat Lengkap */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-g1 font-sans">
            Alamat Kantor / Workshop
          </label>
          <textarea
            rows={3}
            placeholder="Alamat kantor pusat, workshop, dan operasional..."
            value={data.address || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, address: e.target.value }))
            }
            className="w-full p-3.5 rounded-2xl border border-white-80 text-sm text-dark bg-white outline-none focus:border-g1 focus:ring-2 focus:ring-g1/10 transition-all font-sans placeholder:text-dark/40"
          />
        </div>
      </section>

      {/* Section 2: Media Sosial Resmi */}
      <section className="flex flex-col gap-5 p-5 md:p-6 bg-white rounded-3xl border border-white-80 shadow-xs">
        <div className="text-g1 text-base font-bold font-sans">
          2. Media Sosial Resmi Perusahaan
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputBox
            label="Instagram URL"
            placeholder="https://instagram.com/duaputrasrikandi"
            value={socialMedia.instagram || ""}
            onChange={(e) => updateSocialMedia("instagram", e.target.value)}
          />

          <InputBox
            label="LinkedIn URL"
            placeholder="https://linkedin.com/company/duaputrasrikandi"
            value={socialMedia.linkedin || ""}
            onChange={(e) => updateSocialMedia("linkedin", e.target.value)}
          />

          <InputBox
            label="Facebook URL"
            placeholder="https://facebook.com/duaputrasrikandi"
            value={socialMedia.facebook || ""}
            onChange={(e) => updateSocialMedia("facebook", e.target.value)}
          />

          <InputBox
            label="YouTube URL"
            placeholder="https://youtube.com/@duaputrasrikandi"
            value={socialMedia.youtube || ""}
            onChange={(e) => updateSocialMedia("youtube", e.target.value)}
          />

          <InputBox
            label="TikTok URL"
            placeholder="https://tiktok.com/@duaputrasrikandi"
            value={socialMedia.tiktok || ""}
            onChange={(e) => updateSocialMedia("tiktok", e.target.value)}
          />

          <InputBox
            label="X / Twitter URL"
            placeholder="https://x.com/duaputrasrikandi"
            value={socialMedia.twitter || ""}
            onChange={(e) => updateSocialMedia("twitter", e.target.value)}
          />
        </div>
      </section>

      {/* Section 3: Legalitas & Sertifikasi */}
      <section className="flex flex-col gap-5 p-5 md:p-6 bg-white rounded-3xl border border-white-80 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="text-g1 text-base font-bold font-sans">
            3. Legalitas & Sertifikasi Badan Usaha
          </div>
          <span className="text-xs text-dark/50 font-normal font-sans">
            Total: {(data.legality || []).length} Dokumen
          </span>
        </div>

        {/* Input Tambah Dokumen Legalitas */}
        <div className="p-4 md:p-5 rounded-2xl bg-white-90/40 border border-white-80 shadow-xs flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <InputBox
              label="Nama Dokumen / Izin"
              placeholder="Contoh: Nomor Induk Berusaha (NIB)"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <InputBox
              label="Nomor Registrasi / Dokumen"
              placeholder="Contoh: 0220202930192"
              value={newDocNumber}
              onChange={(e) => setNewDocNumber(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <InputBox
              label="Penerbit / Instansi"
              placeholder="Contoh: Kementerian Investasi / BKPM"
              value={newDocIssuer}
              onChange={(e) => setNewDocIssuer(e.target.value)}
            />
          </div>
          <Button
            type="button"
            text="Tambah Dokumen"
            leftIcon="Add"
            variant="stroke"
            onClick={handleAddLegality}
            disabled={!newDocTitle.trim() || !newDocNumber.trim()}
          />
        </div>

        {/* List Dokumen Legalitas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-1">
          {(data.legality || []).map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="p-4 rounded-2xl bg-white border border-white-80 shadow-xs flex flex-col justify-between gap-3 group hover:border-g1/40 transition-all hover:shadow-sm"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-dark font-sans line-clamp-1">
                    {doc.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLegality(idx)}
                    className="size-7 rounded-full bg-red-state border border-red-300 hover:border-red-400 hover:opacity-90 active:opacity-60 active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                    title="Hapus dokumen"
                  >
                    <LordIcon
                      name="Delete"
                      size={14}
                      primaryColor="#FFFFFF"
                      secondaryColor="#FFFFFF"
                    />
                  </button>
                </div>
                <div className="px-3 py-1 rounded-full bg-g1/10 text-g1 font-mono text-xs font-semibold w-fit border border-g1/20">
                  {doc.doc_number}
                </div>
              </div>

              <div className="text-[11px] text-dark/60 pt-2.5 border-t border-white-80 flex items-center justify-between font-sans">
                <span>Penerbit:</span>
                <span className="font-semibold text-dark/80">{doc.issuer || "-"}</span>
              </div>
            </div>
          ))}

          {(!data.legality || data.legality.length === 0) && (
            <div className="col-span-full py-6 text-center text-xs text-dark/50 font-sans">
              Belum ada data legalitas perusahaan ditambahkan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
