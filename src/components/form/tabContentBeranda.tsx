"use client";

import { useState } from "react";
import InputBox from "@/components/ui/inputBox";
import DescriptionBox from "@/components/ui/descriptionBox";
import Button from "@/components/ui/button";
import LordIcon from "@/components/common/lordIcon";
import UploadFile from "@/components/ui/uploadFile";
import type {
  SiteContentRow,
  GalleryItem,
  TestimonialItem,
} from "@/services/siteContentApi";
import { uploadFileToServer } from "@/shared/api/upload";
import MediaSelectModal, { MediaSelectModalItem } from "@/components/modal/mediaSelectModal";

interface TabContentBerandaProps {
  data: SiteContentRow;
  onChange: (updater: (prev: SiteContentRow) => SiteContentRow) => void;
  onError?: (message: string) => void;
}

import SectionHeading from "@/components/ui/sectionHeading";

export default function TabContentBeranda({
  data,
  onChange,
  onError,
}: TabContentBerandaProps) {
  // Local state for new gallery item
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryCategory, setNewGalleryCategory] = useState("");

  // Local state for new testimonial
  const [newTestiName, setNewTestiName] = useState("");
  const [newTestiRole, setNewTestiRole] = useState("");
  const [newTestiCompany, setNewTestiCompany] = useState("");
  const [newTestiContent, setNewTestiContent] = useState("");

  // Media library modal states
  const [isPartnerMediaModalOpen, setIsPartnerMediaModalOpen] = useState(false);
  const [isGalleryMediaModalOpen, setIsGalleryMediaModalOpen] = useState(false);


  const handleSelectPartnerMedia = (item: MediaSelectModalItem) => {
    onChange((prev) => {
      const current = prev.partner_img_url || [];
      if (current.includes(item.url)) return prev;
      return {
        ...prev,
        partner_img_url: [...current, item.url],
      };
    });
    setIsPartnerMediaModalOpen(false);
  };

  const handleSelectGalleryMedia = (item: MediaSelectModalItem) => {
    const cleanTitle = item.fileName
      ? item.fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      : "Foto Proyek";
    const newItem: GalleryItem = {
      url: item.url,
      title: newGalleryTitle.trim() || cleanTitle || "Foto Proyek",
      category: newGalleryCategory.trim() || "Konstruksi",
    };
    onChange((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), newItem],
    }));
    setNewGalleryTitle("");
    setNewGalleryCategory("");
    setNewGalleryUrl("");
    setIsGalleryMediaModalOpen(false);
  };

  const handleRemovePartner = (index: number) => {
    onChange((prev) => ({
      ...prev,
      partner_img_url: (prev.partner_img_url || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddGallery = () => {
    if (!newGalleryUrl.trim()) return;
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      url: newGalleryUrl.trim(),
      title: newGalleryTitle.trim() || "Proyek Marka Jalan",
      category: newGalleryCategory.trim() || "Konstruksi",
    };
    onChange((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), newItem],
    }));
    setNewGalleryTitle("");
    setNewGalleryCategory("");
    setNewGalleryUrl("");
  };

  const handleRemoveGallery = (index: number) => {
    onChange((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddTestimonial = () => {
    if (!newTestiName.trim() || !newTestiContent.trim()) return;
    const newItem: TestimonialItem = {
      id: `testi-${Date.now()}`,
      name: newTestiName.trim(),
      role: newTestiRole.trim() || "Klien",
      company: newTestiCompany.trim(),
      content: newTestiContent.trim(),
    };
    onChange((prev) => ({
      ...prev,
      testimonials: [...(prev.testimonials || []), newItem],
    }));
    setNewTestiName("");
    setNewTestiRole("");
    setNewTestiCompany("");
    setNewTestiContent("");
  };

  const handleRemoveTestimonial = (index: number) => {
    onChange((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* 1. Hero Section */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={1}
          title="Hero Section"
          info="Gambar latar belakang utama yang tampil di bagian paling atas halaman beranda situs. Disarankan rasio 16:9 atau resolusi minimal 1440px x 800px."
        />

        <UploadFile
          label="Foto Hero Banner *"
          descriptionPrefix="Ukuran Disarankan"
          descriptionValue="(1440px × 800px)"
          previewLayout="compact"
          defaultImageUrl={data.hero_img_url && data.hero_img_url.trim() ? data.hero_img_url.trim() : undefined}
          onSelectMediaUrl={(url) =>
            onChange((prev) => ({ ...prev, hero_img_url: url }))
          }
          onFilesSelected={async (files) => {
            if (files[0]) {
              try {
                const uploadedUrl = await uploadFileToServer(files[0], "site");
                onChange((prev) => ({ ...prev, hero_img_url: uploadedUrl }));
              } catch (err: any) {
                onError?.(err?.message || "Upload gagal: koneksi terlalu lama, coba lagi.");
              }
            }
          }}
          onRemoveDefaultImage={() =>
            onChange((prev) => ({ ...prev, hero_img_url: null }))
          }
        />
      </section>

      {/* 2. Partner Section */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={2}
          title="Partner Section"
          info="Logo instansi pemerintah, BUMN, atau perusahaan rekanan yang bekerja sama dengan Dua Putra Srikandi. Format PNG atau SVG transparan sangat disarankan."
        />

        <UploadFile
          label="Logo Mitra & Rekanan *"
          descriptionPrefix="Ukuran Disarankan"
          descriptionValue="(100px x 60px)"
          previewLayout="compact"
          multiple={true}
          maxFiles={30}
          existingImageUrls={data.partner_img_url || []}
          onRemoveExistingImage={(removedUrl) => {
            onChange((prev) => ({
              ...prev,
              partner_img_url: (prev.partner_img_url || []).filter((u) => u !== removedUrl),
            }));
          }}
          onAddExistingUrl={(newUrl) => {
            onChange((prev) => ({
              ...prev,
              partner_img_url: [...(prev.partner_img_url || []), newUrl],
            }));
          }}
          onFilesSelected={async (files) => {
            for (const file of files) {
              try {
                const uploadedUrl = await uploadFileToServer(file, "site");
                onChange((prev) => ({
                  ...prev,
                  partner_img_url: [...(prev.partner_img_url || []), uploadedUrl],
                }));
              } catch (err: any) {
                onError?.(err?.message || "Upload gagal: koneksi terlalu lama, coba lagi.");
              }
            }
          }}
        />

        {/* Grid preview logo mitra aktif */}
        {data.partner_img_url && data.partner_img_url.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            <span className="text-xs font-semibold text-g1 font-sans">
              Logo Terpasang ({data.partner_img_url.length}):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {(data.partner_img_url || [])
                .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
                .map((url, idx) => (
                  <div
                    key={idx}
                    className="relative p-3 bg-white rounded-2xl border border-white-80 shadow-xs flex items-center justify-center h-20 group hover:border-g1/40 transition-all hover:shadow-sm"
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={`Partner ${idx + 1}`}
                        className="max-h-12 max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/120x40/png?text=Partner";
                        }}
                      />
                    ) : null}
                  <button
                    type="button"
                    onClick={() => handleRemovePartner(idx)}
                    title="Hapus Logo"
                    className="absolute -top-2 -right-2 size-7 rounded-full bg-red-state border border-red-300 hover:border-red-400 hover:opacity-90 active:opacity-60 active:scale-95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xs cursor-pointer text-white"
                  >
                    <LordIcon name="Delete" size={14} primaryColor="#FFFFFF" secondaryColor="#FFFFFF" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Why Us Section */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={3}
          title="Why Us Section"
          info="Angka pencapaian resmi perusahaan yang ditampilkan sebagai counter statistik di halaman beranda."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white-90/50 border border-white-80 shadow-xs flex items-center gap-3.5 hover:border-g1/30 transition-all">
            <LordIcon
              name="ThumbsUp"
              size={48}
              primaryColor="#0A9863"
              secondaryColor="#ffc738"
              tertiaryColor="#f9c9c0"
              quaternaryColor="#4bb3fd"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-sm font-semibold text-dark font-sans truncate">
                Pelanggan Puas <span className="text-red-state">*</span>
              </span>
              <div className="flex items-center border-b border-g1/20 focus-within:border-g1 py-0.5">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="99"
                  value={data.value_satisfy_customer ?? ""}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      value_satisfy_customer: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  className="w-full text-xl font-bold text-dark outline-none bg-transparent font-sans placeholder:text-dark/25 placeholder:font-normal placeholder:text-base"
                />
                <span className="text-lg font-bold text-g1 select-none pr-1">%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white-90/50 border border-white-80 shadow-xs flex items-center gap-3.5 hover:border-g1/30 transition-all">
            <LordIcon
              name="Road"
              size={48}
              primaryColor="#0A9863"
              secondaryColor="#ebe6ef"
              tertiaryColor="#f24c00"
              quaternaryColor="#3a3347"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-sm font-semibold text-dark font-sans truncate">
                Layanan Selesai <span className="text-red-state">*</span>
              </span>
              <div className="flex items-center border-b border-g1/20 focus-within:border-g1 py-0.5">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="50"
                  value={data.value_finished_services ?? ""}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      value_finished_services: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  className="w-full text-xl font-bold text-dark outline-none bg-transparent font-sans placeholder:text-dark/25 placeholder:font-normal placeholder:text-base"
                />
                <span className="text-lg font-bold text-g1 select-none pr-1">+</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white-90/50 border border-white-80 shadow-xs flex items-center gap-3.5 hover:border-g1/30 transition-all">
            <LordIcon
              name="Bucket"
              size={48}
              primaryColor="#0A9863"
              secondaryColor="#ffc738"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-sm font-semibold text-dark font-sans truncate">
                Produk Diproduksi <span className="text-red-state">*</span>
              </span>
              <div className="flex items-center border-b border-g1/20 focus-within:border-g1 py-0.5">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="300"
                  value={data.value_product_produced ?? ""}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      value_product_produced: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  className="w-full text-xl font-bold text-dark outline-none bg-transparent font-sans placeholder:text-dark/25 placeholder:font-normal placeholder:text-base"
                />
                <span className="text-lg font-bold text-g1 select-none pr-1">+</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white-90/50 border border-white-80 shadow-xs flex items-center gap-3.5 hover:border-g1/30 transition-all">
            <LordIcon
              name="Check"
              size={48}
              primaryColor="#0A9863"
              secondaryColor="#06D07A"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-sm font-semibold text-dark font-sans truncate">
                Tahun Pengalaman <span className="text-red-state">*</span>
              </span>
              <div className="flex items-center border-b border-g1/20 focus-within:border-g1 py-0.5">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="5"
                  value={data.value_years_experience ?? ""}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      value_years_experience: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  className="w-full text-xl font-bold text-dark outline-none bg-transparent font-sans placeholder:text-dark/25 placeholder:font-normal placeholder:text-base"
                />
                <span className="text-lg font-bold text-g1 select-none pr-1">+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Gallery Section */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={4}
          title="Gallery Section"
          info="Dokumentasi portofolio foto pengerjaan marka jalan, guardrail, dan perlengkapan jalan yang ditampilkan di halaman beranda."
          badge={`Total: ${(data.gallery || []).length} Foto`}
        />

        <InputBox
          label="Judul Gallery *"
          placeholder="Berikut Hasil Pekerjaan Kami"
          value={data.more_title || ""}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, more_title: e.target.value }))
          }
          containerClassName="max-w-none w-full"
        />

        {/* Sub-form tambah galeri */}
        <div className="p-4 md:p-5 rounded-2xl bg-white-90/50 border border-white-80 shadow-xs flex flex-col gap-4">
          <span className="text-xs font-semibold text-g1 font-sans">Tambah Item Galeri Baru</span>

          <UploadFile
            label="Foto Proyek *"
            descriptionPrefix="Ukuran Disarankan"
            descriptionValue="(800px × 600px)"
            previewLayout="compact"
            defaultImageUrl={newGalleryUrl && newGalleryUrl.trim() ? newGalleryUrl.trim() : undefined}
            onSelectMediaUrl={(url) => setNewGalleryUrl(url)}
            onFilesSelected={async (files) => {
              if (files[0]) {
                try {
                  const uploadedUrl = await uploadFileToServer(files[0], "site");
                  setNewGalleryUrl(uploadedUrl);
                } catch (err: any) {
                  onError?.(err?.message || "Upload gagal: koneksi terlalu lama, coba lagi.");
                }
              }
            }}
            onRemoveDefaultImage={() => setNewGalleryUrl("")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputBox
              label="Judul Proyek *"
              placeholder="Contoh: Marka Jalan Tol Cipali"
              value={newGalleryTitle}
              onChange={(e) => setNewGalleryTitle(e.target.value)}
              containerClassName="max-w-none w-full"
            />
            <InputBox
              label="Kategori *"
              placeholder="Contoh: Marka Jalan, Guardrail, Rambu"
              value={newGalleryCategory}
              onChange={(e) => setNewGalleryCategory(e.target.value)}
              containerClassName="max-w-none w-full"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              text="Tambah ke Galeri"
              leftIcon="Add"
              variant="stroke"
              onClick={handleAddGallery}
              disabled={!newGalleryUrl.trim() || !newGalleryTitle.trim()}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Grid item galeri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(data.gallery || [])
            .filter((item): item is GalleryItem => typeof item?.url === "string" && item.url.trim().length > 0)
            .map((item, idx) => (
            <div
              key={item.id || idx}
              className="group relative rounded-2xl overflow-hidden bg-white border border-white-80 shadow-xs flex flex-col hover:border-g1/30 transition-all hover:shadow-sm"
            >
              <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.title || "Gallery"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x250/png?text=Proyek+DPS";
                    }}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => handleRemoveGallery(idx)}
                  className="absolute top-2.5 right-2.5 size-8 rounded-full bg-red-state border border-red-300 hover:border-red-400 hover:opacity-90 active:opacity-60 active:scale-95 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-sm text-white"
                  title="Hapus item galeri"
                >
                  <LordIcon name="Delete" size={16} primaryColor="#FFFFFF" secondaryColor="#FFFFFF" />
                </button>
              </div>
              <div className="p-3.5 flex flex-col gap-0.5">
                <span className="text-xs font-bold text-dark line-clamp-1 font-sans">
                  {item.title || "Tanpa Judul"}
                </span>
                <span className="text-[11px] text-g1 font-semibold font-sans">
                  {item.category || "Umum"}
                </span>
              </div>
            </div>
          ))}

          {(!data.gallery || data.gallery.length === 0) && (
            <div className="col-span-full py-6 text-center text-xs text-dark/50 font-sans border border-dashed border-white-80 rounded-2xl">
              Belum ada foto dalam galeri beranda.
            </div>
          )}
        </div>
      </section>

      {/* 5. Testimonial Section */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={5}
          title="Testimonial Section"
          info="Kutipan ulasan dan kepuasan dari klien terpercaya yang ditampilkan di halaman beranda sebagai social proof."
          badge={`Total: ${(data.testimonials || []).length} Testimoni`}
        />

        {/* Sub-form tambah testimoni */}
        <div className="p-4 md:p-5 rounded-2xl bg-white-90/50 border border-white-80 shadow-xs flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InputBox
              label="Nama Klien *"
              placeholder="Contoh: Ir. Hendra Gunawan"
              value={newTestiName}
              onChange={(e) => setNewTestiName(e.target.value)}
              containerClassName="max-w-none w-full"
            />
            <InputBox
              label="Jabatan"
              placeholder="Contoh: Project Manager"
              value={newTestiRole}
              onChange={(e) => setNewTestiRole(e.target.value)}
              containerClassName="max-w-none w-full"
            />
            <InputBox
              label="Instansi / Perusahaan"
              placeholder="Contoh: Dinas PUPR"
              value={newTestiCompany}
              onChange={(e) => setNewTestiCompany(e.target.value)}
              containerClassName="max-w-none w-full"
            />
          </div>

          <DescriptionBox
            label="Isi Kutipan Testimoni *"
            placeholder="Tulis ulasan atau kepuasan klien terhadap pekerjaan marka jalan..."
            value={newTestiContent}
            onChange={(e) => setNewTestiContent(e.target.value)}
            rows={3}
            containerClassName="max-w-none w-full"
          />

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              text="Tambah Testimoni"
              leftIcon="Add"
              variant="stroke"
              onClick={handleAddTestimonial}
              disabled={!newTestiName.trim() || !newTestiContent.trim()}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* List testimoni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.testimonials || []).map((t, idx) => (
            <div
              key={t.id || idx}
              className="relative p-5 rounded-2xl bg-white border border-white-80 shadow-xs flex flex-col justify-between gap-3 group hover:border-g1/30 transition-all"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <LordIcon name="Quote" size={24} primaryColor="#0A9863" />
                  <button
                    type="button"
                    onClick={() => handleRemoveTestimonial(idx)}
                    className="size-7 rounded-full bg-red-state border border-red-300 hover:border-red-400 hover:opacity-90 active:opacity-60 active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-xs text-white"
                    title="Hapus testimoni"
                  >
                    <LordIcon name="Delete" size={14} primaryColor="#FFFFFF" secondaryColor="#FFFFFF" />
                  </button>
                </div>
                <p className="text-sm text-dark/85 italic font-sans leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white-80">
                <div className="w-0.5 h-8 bg-g1 rounded-full shrink-0" />
                <div className="flex-1 flex flex-col justify-start items-start min-w-0">
                  <span className="text-xs font-bold text-dark font-sans truncate w-full">
                    {t.name}
                  </span>
                  <span className="text-[11px] text-dark/60 font-sans truncate w-full">
                    {t.role} {t.company ? `• ${t.company}` : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {(!data.testimonials || data.testimonials.length === 0) && (
            <div className="col-span-full py-6 text-center text-xs text-dark/50 font-sans">
              Belum ada testimoni klien tersimpan.
            </div>
          )}
        </div>
      </section>

      {/* Media Select Modal for Partner Section */}
      <MediaSelectModal
        isOpen={isPartnerMediaModalOpen}
        onClose={() => setIsPartnerMediaModalOpen(false)}
        onSelect={handleSelectPartnerMedia}
      />

      {/* Media Select Modal for Gallery Section */}
      <MediaSelectModal
        isOpen={isGalleryMediaModalOpen}
        onClose={() => setIsGalleryMediaModalOpen(false)}
        onSelect={handleSelectGalleryMedia}
      />
    </div>
  );
}
