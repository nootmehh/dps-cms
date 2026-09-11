"use client";

import { useState } from "react";
import InputBox from "@/components/ui/inputBox";
import DescriptionBox from "@/components/ui/descriptionBox";
import Button from "@/components/ui/button";
import LordIcon from "@/components/common/lordIcon";
import UploadFile from "@/components/ui/uploadFile";
import type { SiteContentRow, LegalityItem } from "@/services/siteContentApi";
import { uploadFileToServer } from "@/shared/api/upload";

interface TabContentTentangProps {
  data: SiteContentRow;
  onChange: (updater: (prev: SiteContentRow) => SiteContentRow) => void;
  onError?: (message: string) => void;
}

import SectionHeading from "@/components/ui/sectionHeading";

export default function TabContentTentang({
  data,
  onChange,
  onError,
}: TabContentTentangProps) {
  // Local state for new mission point
  const [newMissionItem, setNewMissionItem] = useState("");

  // Local state for new legality item
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Mission point handlers
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

  // Legality handlers
  const handleAddLegality = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newItem: LegalityItem = {
      id: Date.now(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };
    onChange((prev) => ({
      ...prev,
      legality: [...(prev.legality || []), newItem],
    }));
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleRemoveLegality = (index: number) => {
    onChange((prev) => ({
      ...prev,
      legality: (prev.legality || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateLegality = (
    index: number,
    field: "question" | "answer",
    val: string
  ) => {
    onChange((prev) => {
      const list = [...(prev.legality || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, legality: list };
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* 1. About Section */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={1}
          title="About Section"
          info="Foto ilustrasi, deskripsi singkat, dan narasi lengkap profil perusahaan yang tampil di halaman Tentang Kami."
        />

        {/* Foto Ilustrasi (Hanya 1 Image / Video) */}
        <UploadFile
          label="Foto Ilustrasi *"
          descriptionPrefix="Format Disarankan"
          descriptionValue="(Rasio 3:2 atau 16:9 • Gambar atau Video)"
          previewLayout="large"
          accept="image/*,video/*"
          defaultImageUrl={data.about_image_url || undefined}
          onSelectMediaUrl={(url) =>
            onChange((prev) => ({ ...prev, about_image_url: url }))
          }
          onFilesSelected={async (files) => {
            if (files[0]) {
              try {
                const uploadedUrl = await uploadFileToServer(files[0], "site");
                onChange((prev) => ({ ...prev, about_image_url: uploadedUrl }));
              } catch (err: any) {
                onError?.(err?.message || "Upload gagal: koneksi terlalu lama, coba lagi.");
              }
            }
          }}
          onRemoveDefaultImage={() =>
            onChange((prev) => ({ ...prev, about_image_url: null }))
          }
        />

        <DescriptionBox
          label="Deskripsi Singkat *"
          placeholder="Ringkasan singkat profil perusahaan untuk pengantar dan cuplikan profil..."
          value={data.about_description_short || ""}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              about_description_short: e.target.value,
            }))
          }
          rows={3}
          containerClassName="max-w-none w-full"
        />

        <DescriptionBox
          label="Deskripsi Panjang *"
          placeholder="Kisah perjalanan, komitmen mutu, standar operasional, dan nilai utama perusahaan..."
          value={data.about_description_long || ""}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              about_description_long: e.target.value,
            }))
          }
          rows={6}
          containerClassName="max-w-none w-full"
        />
      </section>

      {/* 2. Vision & Mission Section */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={2}
          title="Vision & Mission Section"
          info="Foto ilustrasi visi-misi, pernyataan visi strategis, serta poin-poin misi operasional perusahaan."
          badge={`${(data.mission || []).length} Poin Misi`}
        />

        {/* Ilustrasi Visi & Misi */}
        <UploadFile
          label="Ilustrasi Visi & Misi *"
          descriptionPrefix="Ukuran Disarankan"
          descriptionValue="(520px × 320px / Rasio 16:10)"
          previewLayout="large"
          defaultImageUrl={data.vision_img_url || undefined}
          onSelectMediaUrl={(url) =>
            onChange((prev) => ({ ...prev, vision_img_url: url }))
          }
          onFilesSelected={async (files) => {
            if (files[0]) {
              try {
                const uploadedUrl = await uploadFileToServer(files[0], "site");
                onChange((prev) => ({ ...prev, vision_img_url: uploadedUrl }));
              } catch (err: any) {
                onError?.(err?.message || "Upload gagal: koneksi terlalu lama, coba lagi.");
              }
            }
          }}
          onRemoveDefaultImage={() =>
            onChange((prev) => ({ ...prev, vision_img_url: null }))
          }
        />

        <DescriptionBox
          label="Visi Perusahaan *"
          placeholder="Menyediakan produk dan jasa bermutu tinggi, berdaya saing kuat demi terciptanya kerjasama yang baik..."
          value={data.vision || ""}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, vision: e.target.value }))
          }
          rows={3}
          containerClassName="max-w-none w-full"
        />

        {/* Misi (Poin-poin misi) */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-g1 font-sans">
            Daftar Poin Misi *
          </label>

          {/* Sub-form tambah poin misi */}
          <div className="p-4 md:p-5 rounded-2xl bg-white-90/50 border border-white-80 shadow-xs flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <InputBox
                label="Tambah Poin Misi Baru *"
                placeholder="Memberikan layanan terbaik dengan ketepatan waktu dan harga yang kompetitif..."
                value={newMissionItem}
                onChange={(e) => setNewMissionItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMission();
                  }
                }}
                containerClassName="max-w-none w-full"
              />
            </div>
            <Button
              type="button"
              text="Tambah Poin Misi"
              leftIcon="Add"
              variant="stroke"
              onClick={handleAddMission}
              disabled={!newMissionItem.trim()}
              className="shrink-0 cursor-pointer"
            />
          </div>

          {/* List poin misi */}
          <div className="flex flex-col gap-2.5 mt-1">
            {(data.mission || []).map((m, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white-90/50 border border-white-80 group hover:border-g1/30 hover:bg-white transition-all shadow-xs"
              >
                <span className="size-7 rounded-full bg-g1 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs font-sans">
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={m}
                  onChange={(e) => handleUpdateMissionItem(idx, e.target.value)}
                  className="flex-1 text-sm text-dark bg-transparent border-none outline-none font-sans"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveMission(idx)}
                  className="size-7 rounded-full bg-red-state border border-red-300 hover:border-red-400 hover:opacity-90 active:opacity-60 active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs text-white"
                  title="Hapus poin misi"
                >
                  <LordIcon name="Delete" size={14} primaryColor="#FFFFFF" secondaryColor="#FFFFFF" />
                </button>
              </div>
            ))}

            {(!data.mission || data.mission.length === 0) && (
              <div className="p-6 text-center text-xs text-dark/50 font-sans border border-dashed border-white-80 rounded-2xl">
                Belum ada poin misi yang ditambahkan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Legality Section */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={3}
          title="Legality Section"
          info="Daftar tanya jawab (Accordion / FAQ) terkait legalitas resmi, perizinan usaha, dan sertifikasi perusahaan."
          badge={`${(data.legality || []).length} Legalitas`}
        />

        {/* Sub-form tambah legalitas */}
        <div className="p-4 md:p-5 rounded-2xl bg-white-90/50 border border-white-80 shadow-xs flex flex-col gap-4">
          <span className="text-xs font-semibold text-g1 font-sans">
            Tambah Butir Legalitas Baru
          </span>

          <InputBox
            label="Pertanyaan (Question) *"
            placeholder="Apakah PT. Dua Putra Srikandi merupakan badan usaha yang terdaftar resmi dan memiliki legalitas pajak?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            containerClassName="max-w-none w-full"
          />

          <DescriptionBox
            label="Jawaban (Answer) *"
            placeholder="Ya, PT. Dua Putra Srikandi adalah badan hukum berstatus Perseroan Terbatas (PT) yang sah dengan NIB..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={3}
            containerClassName="max-w-none w-full"
          />

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              text="Tambah Legalitas"
              leftIcon="Add"
              variant="stroke"
              onClick={handleAddLegality}
              disabled={!newQuestion.trim() || !newAnswer.trim()}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* List butir legalitas */}
        <div className="flex flex-col gap-3">
          {(data.legality || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-5 rounded-2xl bg-white border border-white-80 shadow-xs flex flex-col gap-3 group hover:border-g1/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="size-6 rounded-full bg-g1/10 text-g1 font-bold text-xs flex items-center justify-center shrink-0 font-sans">
                    Q{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) =>
                      handleUpdateLegality(idx, "question", e.target.value)
                    }
                    className="text-sm font-bold text-dark bg-transparent border-none outline-none font-sans w-full focus:underline"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLegality(idx)}
                  className="size-7 rounded-full bg-red-state border border-red-300 hover:border-red-400 hover:opacity-90 active:opacity-60 active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs text-white"
                  title="Hapus legalitas"
                >
                  <LordIcon
                    name="Delete"
                    size={14}
                    primaryColor="#FFFFFF"
                    secondaryColor="#FFFFFF"
                  />
                </button>
              </div>

              <div className="pl-8.5">
                <textarea
                  value={item.answer}
                  onChange={(e) =>
                    handleUpdateLegality(idx, "answer", e.target.value)
                  }
                  rows={2}
                  className="w-full text-xs text-dark/70 font-sans bg-brand-background rounded-xl p-3 border border-transparent hover:border-g1/30 focus:border-g1 outline-none resize-none leading-relaxed transition-all"
                />
              </div>
            </div>
          ))}

          {(!data.legality || data.legality.length === 0) && (
            <div className="p-6 text-center text-xs text-dark/50 font-sans border border-dashed border-white-80 rounded-2xl">
              Belum ada butir legalitas & sertifikasi tersimpan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
