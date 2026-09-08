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
    <div className="flex flex-col gap-8 w-full animate-fadeIn">
      {/* Section 1: Informasi Kontak Utama */}
      <section className="flex flex-col gap-5 p-5 rounded-2xl bg-white-90/50 border border-white-80">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-g1" />
          <h3 className="text-base font-bold text-dark font-sans">
            1. Informasi Kontak Resmi Perusahaan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputBox
            label="Nomor Telepon Kantor (`phone`)"
            placeholder="+62 21 8899 0011"
            value={data.phone || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, phone: e.target.value }))
            }
          />

          <InputBox
            label="Alamat Email Resmi (`email`)"
            placeholder="info@duaputrasrikandi.co.id"
            type="email"
            value={data.email || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <InputBox
            label="Tautan WhatsApp CS (`whatsapp_url`)"
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
            Alamat Kantor / Workshop (`address`)
          </label>
          <textarea
            rows={3}
            placeholder="Alamat kantor pusat, workshop, dan operasional..."
            value={data.address || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, address: e.target.value }))
            }
            className="w-full p-3 rounded-xl border border-g1/30 text-sm text-dark bg-white outline-none focus:border-g1 focus:ring-1 focus:ring-g1/20"
          />
        </div>
      </section>

      {/* Section 2: Media Sosial Resmi */}
      <section className="flex flex-col gap-5 p-5 rounded-2xl bg-white-90/50 border border-white-80">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-g1" />
          <h3 className="text-base font-bold text-dark font-sans">
            2. Tautan Media Sosial Resmi (`social_media` jsonb)
          </h3>
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
      <section className="flex flex-col gap-5 p-5 rounded-2xl bg-white-90/50 border border-white-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-g1" />
            <h3 className="text-base font-bold text-dark font-sans">
              3. Legalitas & Sertifikasi Badan Usaha (`legality` jsonb)
            </h3>
          </div>
          <span className="text-xs text-dark/60">
            Total: {(data.legality || []).length} Dokumen
          </span>
        </div>

        {/* Input Tambah Dokumen Legalitas */}
        <div className="p-4 rounded-xl bg-white border border-g1/20 flex flex-col md:flex-row gap-3 items-end">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data.legality || []).map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="p-4 rounded-xl bg-white border border-white-80 shadow-xs flex flex-col justify-between gap-3 group hover:border-g1/30 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-dark font-sans">
                    {doc.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLegality(idx)}
                    className="text-red-state hover:bg-red-state/10 size-6 rounded-md flex items-center justify-center text-xs font-bold cursor-pointer"
                    title="Hapus dokumen"
                  >
                    ✕
                  </button>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-g1/10 text-g1 font-mono text-xs font-semibold w-fit">
                  {doc.doc_number}
                </div>
              </div>

              <div className="text-[11px] text-dark/60 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span>Penerbit:</span>
                <span className="font-medium text-dark/80">{doc.issuer || "-"}</span>
              </div>
            </div>
          ))}

          {(!data.legality || data.legality.length === 0) && (
            <div className="col-span-full py-4 text-center text-xs text-dark/50">
              Belum ada data legalitas perusahaan ditambahkan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
