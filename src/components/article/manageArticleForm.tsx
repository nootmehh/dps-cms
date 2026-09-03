"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../layout/navbar";
import Sidebar from "../layout/sidebar";
import Button from "../ui/button";
import InputBox from "../ui/inputBox";
import UploadFile from "../ui/uploadFile";
import Dropdown from "../ui/dropdown";
import Badge from "../ui/badge";
import ArticleEditor from "../ui/articleEditor";
import Notification from "../ui/notification";
import LordIcon from "../common/lordIcon";
import {
  getArticleById,
  addArticle,
  editArticle,
  getConsistingCategories,
} from "../../shared/api/article";

const DEFAULT_CATEGORIES = [
  "Keselamatan Jalan",
  "Konstruksi",
  "Inovasi Marka",
  "Perlengkapan Jalan",
  "Teknologi Hijau",
  "Penerangan",
  "Kabar Proyek",
];

export interface ManageArticleFormProps {
  id?: string;
}

export default function ManageArticleForm({ id }: ManageArticleFormProps) {
  const router = useRouter();

  const [articleName, setArticleName] = useState("");
  const [articleNameIndonesia, setArticleNameIndonesia] = useState("");
  const [categories, setCategories] = useState<string[]>(["Keselamatan Jalan"]);
  const [categoryColors, setCategoryColors] = useState<string[]>(["Green"]);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerRemoved, setBannerRemoved] = useState(false);
  const [content, setContent] = useState("");
  const [contentIndonesia, setContentIndonesia] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "default";
  }>({
    isOpen: false,
    message: "",
    type: "default",
  });

  const showNotif = (message: string, type: "success" | "error" | "default" = "success") => {
    setNotification({
      isOpen: true,
      message,
      type,
    });
  };

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const existing = await getConsistingCategories();
        const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...existing]));
        setAvailableCategories(merged);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    loadCategories();
  }, []);

  // Load existing article info if in edit mode
  useEffect(() => {
    if (!id) return;

    const loadArticle = async () => {
      setLoading(true);
      try {
        const article = await getArticleById(id);
        if (article) {
          setArticleName(article.title);
          setArticleNameIndonesia(article.titleIndonesia || article.title || "");
          setCategories(article.category && article.category.length > 0 ? article.category : ["Keselamatan Jalan"]);
          setCategoryColors(
            article.categoryColor && article.categoryColor.length > 0
              ? article.categoryColor
              : ["Green"]
          );
          setContent(article.content || "");
          setContentIndonesia(article.contentIndonesia || article.content || "");
          setBannerUrl(article.imageUrl || null);

          if (article.category && article.category.length > 0) {
            setAvailableCategories((prev) => {
              const newCategories = article.category.filter((cat) => !prev.includes(cat));
              return Array.from(new Set([...prev, ...newCategories]));
            });
          }
        } else {
          showNotif("Artikel tidak ditemukan.", "error");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Gagal memuat detail artikel.";
        showNotif(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validCategories = categories.map((c) => c.trim()).filter(Boolean);
    const validColors = categoryColors.map((c) => c.trim()).filter(Boolean);

    if (!articleName.trim() || validCategories.length === 0 || validColors.length === 0) {
      showNotif("Mohon lengkapi semua kolom yang wajib diisi.", "error");
      return;
    }

    if (!bannerUrl && !bannerFile) {
      showNotif("Banner artikel wajib diunggah.", "error");
      return;
    }

    if (!content.trim() && !contentIndonesia.trim()) {
      showNotif("Konten artikel wajib diisi.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const articleData = {
        title: articleName.trim(),
        titleIndonesia: articleNameIndonesia.trim() || articleName.trim(),
        category: validCategories,
        categoryColor: validColors,
        content: content || contentIndonesia,
        contentIndonesia: contentIndonesia || content,
        imageUrl: bannerUrl,
      };

      if (id) {
        await editArticle(id, articleData, bannerFile, bannerRemoved);
        showNotif(`Artikel "${articleName.trim()}" berhasil diperbarui!`, "success");
      } else {
        await addArticle(articleData, bannerFile);
        showNotif(`Artikel "${articleName.trim()}" berhasil ditambahkan!`, "success");
      }

      // Return to articles list page after short delay
      setTimeout(() => {
        router.push("/kelola-artikel");
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menyimpan artikel.";
      showNotif(errorMessage, "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white-90 flex flex-col items-center">
      {/* Top Navbar */}
      <Navbar
        brandTitle="Dua Putra Srikandi"
        userName="Username"
        userRole="Super Admin"
        onLogout={() => showNotif("Anda telah logout dari sistem", "error")}
      />

      {/* Main Body */}
      <main className="w-full max-w-[1440px] px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Sidebar Component */}
        <Sidebar activeId="articles" />

        {/* Main Content Card */}
        <div className="flex-1 p-6 md:p-8 bg-white rounded-[32px] border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Back Button */}
          <Button
            type="button"
            onClick={() => router.push("/kelola-artikel")}
            text="Kembali"
            leftIcon="Left 1"
            variant="ghost-green"
            className="cursor-pointer"
          />

          {/* Header Block */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="text-dark/40 text-xs md:text-sm font-normal font-sans tracking-wider uppercase">
              FORMULIR ARTIKEL
            </div>
            <h1 className="text-g1 text-2xl md:text-3xl font-bold font-sans">
              {id ? "Edit Artikel" : "Tambah Artikel Baru"}
            </h1>
            <p className="text-dark/70 text-sm font-normal font-sans">
              Lengkapi informasi artikel, banner visual, dan kategori publikasi website.
            </p>
          </div>

          {/* Divider */}
          <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

          {loading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-g1">
              <div className="w-10 h-10 border-4 border-g1 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-sans text-dark/60">Memuat data artikel...</span>
            </div>
          ) : (
            /* Form Area */
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
              <div className="flex flex-col gap-5">
                {/* Article Banner Upload */}
                <UploadFile
                  label="Banner Artikel *"
                  descriptionPrefix="Ukuran Disarankan"
                  descriptionValue="(736px * 448px)"
                  multiple={false}
                  defaultImageUrl={bannerUrl || undefined}
                  defaultImageLabel="Banner Artikel Saat Ini"
                  onRemoveDefaultImage={() => {
                    setBannerUrl(null);
                    setBannerFile(null);
                    setBannerRemoved(true);
                  }}
                  onFilesSelected={(files: File[]) => {
                    if (files.length > 0) {
                      setBannerFile(files[0]);
                      setBannerUrl(URL.createObjectURL(files[0]));
                      setBannerRemoved(false);
                    } else {
                      setBannerFile(null);
                      setBannerUrl(null);
                      setBannerRemoved(true);
                    }
                  }}
                />

                {/* Article Title (Bahasa Indonesia) */}
                <InputBox
                  label={
                    <span>
                      Judul Artikel (Bahasa Indonesia) <span className="text-red-state">*</span>
                    </span>
                  }
                  placeholder="mis. Standar Keselamatan Pemasangan Guardrail di Jalan Tol"
                  value={articleNameIndonesia}
                  onChange={(e) => {
                    setArticleNameIndonesia(e.target.value);
                    if (!articleName) setArticleName(e.target.value);
                  }}
                  required
                  containerClassName="max-w-none"
                />

                {/* Article Title (English) */}
                <InputBox
                  label={
                    <span>
                      Judul Artikel (English) <span className="text-red-state">*</span>
                    </span>
                  }
                  placeholder="e.g. Safety Standards for Guardrail Installation on Highways"
                  value={articleName}
                  onChange={(e) => setArticleName(e.target.value)}
                  required
                  containerClassName="max-w-none"
                />

                {/* Dynamic Categories & Colors */}
                <div className="flex flex-col gap-3 w-full">
                  <div className="self-stretch px-4 py-3 bg-g1/10 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 text-g1 flex items-center justify-center">
                        <LordIcon name="Category" size={20} primaryColor="#0A9863" />
                      </div>
                      <div>
                        <span className="text-g1 text-sm md:text-base font-semibold font-sans">
                          Kategori Artikel
                        </span>
                        <span className="text-dark/50 text-xs md:text-sm font-normal font-sans">
                          {" "}
                          (Dapat memilih lebih dari satu)
                        </span>
                      </div>
                    </div>

                    {/* Add Category Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCategories([...categories, "Konstruksi"]);
                        setCategoryColors([...categoryColors, "Blue"]);
                      }}
                      className="h-9 px-3 bg-white hover:bg-g1/15 text-g1 rounded-full border border-g1/20 flex items-center justify-center gap-1.5 text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs shrink-0"
                      title="Tambah Kategori"
                    >
                      <LordIcon name="Add" size={16} primaryColor="#0A9863" />
                      <span>Tambah Kategori</span>
                    </button>
                  </div>

                  {categories.length === 0 ? (
                    <div className="self-stretch text-dark/40 text-sm font-normal font-sans pl-4 py-2">
                      Klik tombol <span className="text-g1 font-semibold">+ Tambah Kategori</span> di atas untuk menambahkan label.
                    </div>
                  ) : (
                    categories.map((cat, index) => (
                      <div
                        key={index}
                        className="self-stretch flex flex-col md:flex-row items-stretch md:items-end gap-3 w-full pl-0 md:pl-4"
                      >
                        <Dropdown
                          label={
                            <span>
                              Kategori {index + 1} <span className="text-red-state">*</span>
                            </span>
                          }
                          placeholder="Pilih atau ketik kategori..."
                          options={availableCategories.map((c) => ({ value: c, label: c }))}
                          value={cat}
                          onChange={(val) => {
                            const updated = [...categories];
                            updated[index] = val;
                            setCategories(updated);
                          }}
                          multiple={false}
                          allowCustomValues={true}
                          containerClassName="flex-1 max-w-none"
                        />

                        <Dropdown
                          label={
                            <span>
                              Warna Badge {index + 1} <span className="text-red-state">*</span>
                            </span>
                          }
                          placeholder="Pilih Warna"
                          options={[
                            { value: "Green", label: <Badge variant="green" text="Green" />, searchLabel: "Green" },
                            { value: "Blue", label: <Badge variant="blue" text="Blue" />, searchLabel: "Blue" },
                            { value: "Red", label: <Badge variant="red" text="Red" />, searchLabel: "Red" },
                            { value: "Yellow", label: <Badge variant="yellow" text="Yellow" />, searchLabel: "Yellow" },
                            { value: "Purple", label: <Badge variant="purple" text="Purple" />, searchLabel: "Purple" },
                            { value: "Orange", label: <Badge variant="orange" text="Orange" />, searchLabel: "Orange" },
                          ]}
                          value={categoryColors[index] || "Green"}
                          onChange={(val) => {
                            const updated = [...categoryColors];
                            updated[index] = val;
                            setCategoryColors(updated);
                          }}
                          multiple={false}
                          containerClassName="w-full max-w-none md:w-60 shrink-0"
                          selectClassName="bg-white"
                        />

                        <div className="h-11 flex items-center shrink-0 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setCategories(categories.filter((_, i) => i !== index));
                              setCategoryColors(categoryColors.filter((_, i) => i !== index));
                            }}
                            className="size-11 bg-red-state/10 hover:bg-red-state text-red-state hover:text-white rounded-full flex justify-center items-center transition-all cursor-pointer"
                            title="Hapus Kategori"
                          >
                            <LordIcon name="Delete" size={18} primaryColor="currentColor" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Article Content Editor */}
                <ArticleEditor
                  label="Isi Konten Artikel"
                  englishValue={content}
                  onEnglishChange={setContent}
                  indonesianValue={contentIndonesia}
                  onIndonesianChange={setContentIndonesia}
                  className="mt-2"
                />
              </div>

              {/* Form Divider */}
              <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

              {/* Action Buttons */}
              <div className="self-stretch flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-2 w-full">
                <Button
                  type="button"
                  onClick={() => router.push("/kelola-artikel")}
                  text="Batal"
                  variant="ghost-green"
                  className="w-full sm:w-36 cursor-pointer"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  text={submitting ? "Menyimpan..." : id ? "Perbarui Artikel" : "Simpan Artikel"}
                  variant="fill"
                  rightIcon="Add"
                  className="w-full sm:w-48 cursor-pointer"
                />
              </div>
            </form>
          )}
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
