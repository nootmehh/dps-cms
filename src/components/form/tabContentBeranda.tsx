"use client";

import { useState } from "react";
import InputBox from "@/components/ui/inputBox";
import Button from "@/components/ui/button";
import LordIcon from "@/components/common/lordIcon";
import UploadFile from "@/components/ui/uploadFile";
import type {
  SiteContentRow,
  GalleryItem,
  TestimonialItem,
} from "@/services/siteContentApi";

import { uploadFileToServer } from "@/shared/api/upload";

interface TabContentBerandaProps {
  data: SiteContentRow;
  onChange: (updater: (prev: SiteContentRow) => SiteContentRow) => void;
}

export default function TabContentBeranda({
  data,
  onChange,
}: TabContentBerandaProps) {
  // Local state for adding partner
  const [newPartnerUrl, setNewPartnerUrl] = useState("");

  // Local state for new gallery item
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryCategory, setNewGalleryCategory] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Local state for new testimonial
  const [newTestiName, setNewTestiName] = useState("");
  const [newTestiRole, setNewTestiRole] = useState("");
  const [newTestiCompany, setNewTestiCompany] = useState("");
  const [newTestiContent, setNewTestiContent] = useState("");
  const [newTestiRating, setNewTestiRating] = useState<number>(5);

  const handleAddPartner = () => {
    if (!newPartnerUrl.trim()) return;
    onChange((prev) => ({
      ...prev,
      partner_img_url: [...(prev.partner_img_url || []), newPartnerUrl.trim()],
    }));
    setNewPartnerUrl("");
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
      role: newTestiRole.trim() || "Client",
      company: newTestiCompany.trim(),
      content: newTestiContent.trim(),
      rating: newTestiRating,
    };
    onChange((prev) => ({
      ...prev,
      testimonials: [...(prev.testimonials || []), newItem],
    }));
    setNewTestiName("");
    setNewTestiRole("");
    setNewTestiCompany("");
    setNewTestiContent("");
    setNewTestiRating(5);
  };

  const handleRemoveTestimonial = (index: number) => {
    onChange((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Section 1: Hero Banner */}
      <section className="flex flex-col gap-5 p-5 md:p-6 bg-white rounded-3xl border border-white-80 shadow-xs">
        <div className="text-g1 text-base font-bold font-sans">
          1. Hero Banner Utama
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="flex flex-col gap-3">
            <InputBox
              label="URL Gambar Hero / Banner"
              placeholder="https://..."
              value={data.hero_img_url || ""}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, hero_img_url: e.target.value }))
              }
            />
            <p className="text-xs text-dark/60 font-sans">
              Rekomendasi rasio 16:9 atau resolusi minimal 1920x1080px untuk tampilan tajam.
            </p>

            <UploadFile
              label="Atau Pilih / Unggah Hero Image"
              defaultImageUrl={data.hero_img_url || undefined}
              onFilesSelected={async (files) => {
                if (files[0]) {
                  try {
                    const uploadedUrl = await uploadFileToServer(files[0], "site");
                    onChange((prev) => ({ ...prev, hero_img_url: uploadedUrl }));
                  } catch {
                    const blobUrl = URL.createObjectURL(files[0]);
                    onChange((prev) => ({ ...prev, hero_img_url: blobUrl }));
                  }
                }
              }}
              onRemoveDefaultImage={() =>
                onChange((prev) => ({ ...prev, hero_img_url: "" }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-g1 font-sans">
              Pratinjau Banner Hero:
            </span>
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-g1/20 bg-white shadow-xs relative group">
              {data.hero_img_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.hero_img_url}
                  alt="Hero Banner Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-dark/40 gap-2">
                  <LordIcon name="Image 2" size={36} primaryColor="#0A9863" />
                  <span className="text-xs font-sans">Belum ada gambar hero</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Mitra & Partner */}
      <section className="flex flex-col gap-5 p-5 md:p-6 bg-white rounded-3xl border border-white-80 shadow-xs">
        <div className="text-g1 text-base font-bold font-sans">
          2. Logo Mitra & Rekanan
        </div>

        <div className="p-4 rounded-2xl bg-white-90/40 border border-white-80 shadow-xs flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <InputBox
              label="Tambah URL Logo Mitra Baru"
              placeholder="https://.../logo-partner.png"
              value={newPartnerUrl}
              onChange={(e) => setNewPartnerUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPartner();
                }
              }}
            />
          </div>
          <Button
            type="button"
            text="Tambah Mitra"
            leftIcon="Add"
            variant="stroke"
            onClick={handleAddPartner}
            disabled={!newPartnerUrl.trim()}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 mt-1">
          {(data.partner_img_url || []).map((url, idx) => (
            <div
              key={idx}
              className="relative p-3 bg-white rounded-2xl border border-white-80 shadow-xs flex items-center justify-center h-20 group hover:border-g1/40 transition-all hover:shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Partner ${idx + 1}`}
                className="max-h-12 max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/120x40/png?text=Partner";
                }}
              />
              <button
                type="button"
                onClick={() => handleRemovePartner(idx)}
                title="Hapus Logo"
                className="absolute -top-2 -right-2 size-7 rounded-full bg-red-state border border-red-300 hover:border-red-400 hover:opacity-90 active:opacity-60 active:scale-95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xs cursor-pointer text-white"
              >
                <LordIcon
                  name="Delete"
                  size={14}
                  primaryColor="#FFFFFF"
                  secondaryColor="#FFFFFF"
                />
              </button>
            </div>
          ))}

          {(!data.partner_img_url || data.partner_img_url.length === 0) && (
            <div className="col-span-full py-6 text-center text-xs text-dark/50 font-sans">
              Belum ada logo mitra. Masukkan URL logo di atas untuk menambahkan.
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Tagline / More Title & Statistik Prestasi */}
      <section className="flex flex-col gap-5 p-5 md:p-6 bg-white rounded-3xl border border-white-80 shadow-xs">
        <div className="text-g1 text-base font-bold font-sans">
          3. Highlight Keunggulan & Counter Statistik
        </div>

        <InputBox
          label="Judul Section Keunggulan"
          placeholder="Mengapa Memilih Dua Putra Srikandi?"
          value={data.more_title || ""}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, more_title: e.target.value }))
          }
          className="w-full"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-1">
          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white-90/40 border border-white-80 shadow-xs focus-within:border-g1 focus-within:bg-white transition-all">
            <span className="text-xs font-semibold text-g1 font-sans">Pelanggan Puas</span>
            <input
              type="number"
              min="0"
              value={data.value_satisfy_customer ?? 0}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  value_satisfy_customer: parseInt(e.target.value) || 0,
                }))
              }
              className="text-2xl font-bold text-dark border-none outline-none bg-transparent"
            />
            <span className="text-[11px] text-dark/50 font-sans">Klien & Lembaga</span>
          </div>

          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white-90/40 border border-white-80 shadow-xs focus-within:border-g1 focus-within:bg-white transition-all">
            <span className="text-xs font-semibold text-g1 font-sans">Layanan Selesai</span>
            <input
              type="number"
              min="0"
              value={data.value_finished_services ?? 0}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  value_finished_services: parseInt(e.target.value) || 0,
                }))
              }
              className="text-2xl font-bold text-dark border-none outline-none bg-transparent"
            />
            <span className="text-[11px] text-dark/50 font-sans">Proyek Terselesaikan</span>
          </div>

          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white-90/40 border border-white-80 shadow-xs focus-within:border-g1 focus-within:bg-white transition-all">
            <span className="text-xs font-semibold text-g1 font-sans">Produk Diproduksi</span>
            <input
              type="number"
              min="0"
              value={data.value_product_produced ?? 0}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  value_product_produced: parseInt(e.target.value) || 0,
                }))
              }
              className="text-2xl font-bold text-dark border-none outline-none bg-transparent"
            />
            <span className="text-[11px] text-dark/50 font-sans">Unit Cat & Rambu</span>
          </div>

          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white-90/40 border border-white-80 shadow-xs focus-within:border-g1 focus-within:bg-white transition-all">
            <span className="text-xs font-semibold text-g1 font-sans">Tahun Pengalaman</span>
            <input
              type="number"
              min="0"
              value={data.value_years_experience ?? 0}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  value_years_experience: parseInt(e.target.value) || 0,
                }))
              }
              className="text-2xl font-bold text-dark border-none outline-none bg-transparent"
            />
            <span className="text-[11px] text-dark/50 font-sans">Tahun Dedikasi</span>
          </div>
        </div>
      </section>

      {/* Section 4: Galeri Foto Proyek */}
      <section className="flex flex-col gap-5 p-5 md:p-6 bg-white rounded-3xl border border-white-80 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="text-g1 text-base font-bold font-sans">
            4. Galeri Proyek Unggulan
          </div>
          <span className="text-xs text-dark/50 font-normal font-sans">
            Total: {(data.gallery || []).length} Foto
          </span>
        </div>

        {/* Form Tambah Item Galeri */}
        <div className="p-4 md:p-5 rounded-2xl bg-white-90/40 border border-white-80 shadow-xs flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <InputBox
              label="URL Foto Galeri"
              placeholder="https://..."
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <InputBox
              label="Judul Proyek"
              placeholder="Contoh: Marka Jalan Tol Cipali"
              value={newGalleryTitle}
              onChange={(e) => setNewGalleryTitle(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <InputBox
              label="Kategori"
              placeholder="Contoh: Marka Jalan"
              value={newGalleryCategory}
              onChange={(e) => setNewGalleryCategory(e.target.value)}
            />
          </div>
          <Button
            type="button"
            text="Tambah Foto"
            leftIcon="Add"
            variant="stroke"
            onClick={handleAddGallery}
            disabled={!newGalleryUrl.trim()}
          />
        </div>

        {/* List Foto Galeri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(data.gallery || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className="group relative rounded-2xl overflow-hidden bg-white border border-white-80 shadow-xs flex flex-col hover:border-g1/30 transition-all hover:shadow-sm"
            >
              <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.title || "Gallery"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x250/png?text=Proyek+DPS";
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGallery(idx)}
                  className="absolute top-2.5 right-2.5 size-8 rounded-full bg-red-state border border-red-300 hover:border-red-400 hover:opacity-90 active:opacity-60 active:scale-95 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Hapus item galeri"
                >
                  <LordIcon
                    name="Delete"
                    size={16}
                    primaryColor="#FFFFFF"
                    secondaryColor="#FFFFFF"
                  />
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
            <div className="col-span-full py-6 text-center text-xs text-dark/50 font-sans">
              Belum ada foto dalam galeri beranda.
            </div>
          )}
        </div>
      </section>

      {/* Section 5: Testimoni Klien */}
      <section className="flex flex-col gap-5 p-5 md:p-6 bg-white rounded-3xl border border-white-80 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="text-g1 text-base font-bold font-sans">
            5. Testimoni Klien
          </div>
          <span className="text-xs text-dark/50 font-normal font-sans">
            Total: {(data.testimonials || []).length} Testimoni
          </span>
        </div>

        {/* Input Tambah Testimoni */}
        <div className="p-4 md:p-5 rounded-2xl bg-white-90/40 border border-white-80 shadow-xs flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InputBox
              label="Nama Klien"
              placeholder="Contoh: Ir. Hendra Gunawan"
              value={newTestiName}
              onChange={(e) => setNewTestiName(e.target.value)}
            />
            <InputBox
              label="Jabatan"
              placeholder="Contoh: Project Manager"
              value={newTestiRole}
              onChange={(e) => setNewTestiRole(e.target.value)}
            />
            <InputBox
              label="Instansi / Perusahaan"
              placeholder="Contoh: Dinas PUPR"
              value={newTestiCompany}
              onChange={(e) => setNewTestiCompany(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-g1 font-sans">
              Isi Kutipan Testimoni
            </label>
            <textarea
              rows={3}
              placeholder="Tulis testimoni atau kepuasan klien..."
              value={newTestiContent}
              onChange={(e) => setNewTestiContent(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-white-80 text-sm text-dark bg-white outline-none focus:border-g1 focus:ring-2 focus:ring-g1/10 transition-all font-sans placeholder:text-dark/40"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-dark/70 font-sans">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewTestiRating(star)}
                  className={`text-lg transition-colors cursor-pointer ${
                    star <= newTestiRating ? "text-yellow-state" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <Button
              type="button"
              text="Tambah Testimoni"
              leftIcon="Add"
              variant="stroke"
              onClick={handleAddTestimonial}
              disabled={!newTestiName.trim() || !newTestiContent.trim()}
            />
          </div>
        </div>

        {/* List Testimoni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.testimonials || []).map((t, idx) => (
            <div
              key={t.id || idx}
              className="relative p-5 rounded-2xl bg-white border border-white-80 shadow-xs flex flex-col justify-between gap-3 group hover:border-g1/30 transition-all"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex text-yellow-state text-sm tracking-tight">
                    {"★".repeat(t.rating || 5)}
                    {"☆".repeat(5 - (t.rating || 5))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTestimonial(idx)}
                    className="size-7 rounded-full bg-red-state border border-red-300 hover:border-red-400 hover:opacity-90 active:opacity-60 active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    title="Hapus testimoni"
                  >
                    <LordIcon
                      name="Delete"
                      size={14}
                      primaryColor="#FFFFFF"
                      secondaryColor="#FFFFFF"
                    />
                  </button>
                </div>
                <p className="text-sm text-dark/85 italic font-sans leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white-80">
                <div className="size-9 rounded-full bg-g1/15 text-g1 font-bold text-xs flex items-center justify-center shrink-0">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-dark font-sans">{t.name}</span>
                  <span className="text-[11px] text-dark/60 font-sans">
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
    </div>
  );
}
