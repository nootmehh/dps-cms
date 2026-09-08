"use client";

import { useState } from "react";
import InputBox from "@/components/ui/inputBox";
import DescriptionBox from "@/components/ui/descriptionBox";
import Button from "@/components/ui/button";
import LordIcon from "@/components/common/lordIcon";
import UploadFile from "@/components/ui/uploadFile";
import type { SiteContentRow } from "@/services/siteContentApi";

interface TabContentTentangProps {
  data: SiteContentRow;
  onChange: (updater: (prev: SiteContentRow) => SiteContentRow) => void;
}

export default function TabContentTentang({
  data,
  onChange,
}: TabContentTentangProps) {
  const [newMissionItem, setNewMissionItem] = useState("");

  const handleAddMission = () => {
    if (!newMissionItem.trim()) return;
    onChange((prev) => ({
      ...prev,
      mission: [...(prev.mission || []), newMissionItem.trim()],
    }));
    setNewMissionItem("");
  };

  const handleRemoveMission = (index: number) => {
    onChange((prev) => ({
      ...prev,
      mission: (prev.mission || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateMissionItem = (index: number, val: string) => {
    onChange((prev) => {
      const list = [...(prev.mission || [])];
      list[index] = val;
      return { ...prev, mission: list };
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fadeIn">
      {/* Section 1: Gambar Profil Tentang Kami */}
      <section className="flex flex-col gap-4 p-5 rounded-2xl bg-white-90/50 border border-white-80">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-g1" />
          <h3 className="text-base font-bold text-dark font-sans">
            1. Foto Profil / Tentang Kami (`about_image_url`)
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="flex flex-col gap-3">
            <InputBox
              label="URL Gambar Tentang Kami"
              placeholder="https://..."
              value={data.about_image_url || ""}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  about_image_url: e.target.value,
                }))
              }
            />
            <p className="text-xs text-dark/60">
              Foto perwakilan tim, kantor operasional, atau aktivitas konstruksi marka di lapangan.
            </p>

            <UploadFile
              label="Atau Pilih / Unggah Gambar"
              defaultImageUrl={data.about_image_url || undefined}
              onFilesSelected={(files) => {
                if (files[0]) {
                  const blobUrl = URL.createObjectURL(files[0]);
                  onChange((prev) => ({ ...prev, about_image_url: blobUrl }));
                }
              }}
              onRemoveDefaultImage={() =>
                onChange((prev) => ({ ...prev, about_image_url: "" }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-g1 font-sans">
              Pratinjau Foto Tentang Kami:
            </span>
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-g1/20 bg-white shadow-xs relative group">
              {data.about_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.about_image_url}
                  alt="About Us Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-dark/40 gap-2">
                  <LordIcon name="Image 2" size={36} primaryColor="#0A9863" />
                  <span className="text-xs">Belum ada foto tentang kami</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Deskripsi Singkat & Lengkap */}
      <section className="flex flex-col gap-5 p-5 rounded-2xl bg-white-90/50 border border-white-80">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-g1" />
          <h3 className="text-base font-bold text-dark font-sans">
            2. Deskripsi Perusahaan
          </h3>
        </div>

        {/* Deskripsi Singkat */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-g1 font-sans">
            Deskripsi Singkat Profil (`about_description_short`)
          </label>
          <textarea
            rows={3}
            placeholder="Ringkasan singkat tentang identitas perusahaan..."
            value={data.about_description_short || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                about_description_short: e.target.value,
              }))
            }
            className="w-full p-3 rounded-xl border border-g1/30 text-sm text-dark bg-white outline-none focus:border-g1 focus:ring-1 focus:ring-g1/20"
          />
          <span className="text-[11px] text-dark/50">
            Ditampilkan pada kartu pengantar, cuplikan halaman beranda, dan meta description profil.
          </span>
        </div>

        {/* Deskripsi Lengkap */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-g1 font-sans">
            Deskripsi Lengkap / Sejarah Perusahaan (`about_description_long`)
          </label>
          <textarea
            rows={6}
            placeholder="Kisah perjalanan, komitmen kualitas, standar operasional, dan nilai utama perusahaan..."
            value={data.about_description_long || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                about_description_long: e.target.value,
              }))
            }
            className="w-full p-3 rounded-xl border border-g1/30 text-sm text-dark bg-white outline-none focus:border-g1 focus:ring-1 focus:ring-g1/20"
          />
          <span className="text-[11px] text-dark/50">
            Teks naratif lengkap untuk halaman profil utama &quot;Tentang Kami&quot;.
          </span>
        </div>
      </section>

      {/* Section 3: Visi & Misi */}
      <section className="flex flex-col gap-5 p-5 rounded-2xl bg-white-90/50 border border-white-80">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-g1" />
          <h3 className="text-base font-bold text-dark font-sans">
            3. Visi & Misi Perusahaan
          </h3>
        </div>

        {/* Visi */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-g1 font-sans">
            Visi Perusahaan (`vision`)
          </label>
          <textarea
            rows={2}
            placeholder="Tuliskan cita-cita dan visi strategis perusahaan..."
            value={data.vision || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, vision: e.target.value }))
            }
            className="w-full p-3 rounded-xl border border-g1/30 text-sm text-dark bg-white outline-none focus:border-g1 focus:ring-1 focus:ring-g1/20"
          />
        </div>

        {/* Misi (Dynamic Array) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-g1 font-sans">
              Daftar Poin Misi (`mission` text[])
            </label>
            <span className="text-xs text-dark/60">
              Total: {(data.mission || []).length} Poin
            </span>
          </div>

          {/* Input Add New Mission */}
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <InputBox
                placeholder="Tulis butir misi baru..."
                value={newMissionItem}
                onChange={(e) => setNewMissionItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMission();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              text="Tambah Poin Misi"
              leftIcon="Add"
              variant="stroke"
              onClick={handleAddMission}
              disabled={!newMissionItem.trim()}
            />
          </div>

          {/* List Existing Mission Items */}
          <div className="flex flex-col gap-2.5 mt-1">
            {(data.mission || []).map((m, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-white-80 shadow-xs group hover:border-g1/30 transition-colors"
              >
                <span className="size-6 rounded-full bg-g1/15 text-g1 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={m}
                  onChange={(e) => handleUpdateMissionItem(idx, e.target.value)}
                  className="flex-1 text-sm text-dark bg-transparent border-none outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveMission(idx)}
                  className="size-7 text-red-state hover:bg-red-state/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                  title="Hapus butir misi"
                >
                  ✕
                </button>
              </div>
            ))}

            {(!data.mission || data.mission.length === 0) && (
              <div className="py-4 text-center text-xs text-dark/50">
                Belum ada butir misi yang ditambahkan.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
