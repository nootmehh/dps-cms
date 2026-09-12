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
import {
  getArticleById,
  addArticle,
  editArticle,
  getConsistingCategories,
} from "../../shared/api/article";
import { uploadFileToServer } from "@/shared/api/upload";

export interface ManageArticleFormProps {
  id?: string;
}

export default function ManageArticleForm({ id }: ManageArticleFormProps) {
  const router = useRouter();

  const [articleName, setArticleName] = useState("");
  const [articleNameIndonesia, setArticleNameIndonesia] = useState("");
  const [categories, setCategories] = useState<string[]>([""]);
  const [categoryColors, setCategoryColors] = useState<string[]>(["green"]);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerRemoved, setBannerRemoved] = useState(false);
  const [content, setContent] = useState("");
  const [contentIndonesia, setContentIndonesia] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

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

  // Listen for global upload errors (e.g. timeout / abort error) to display toast notification
  useEffect(() => {
    const handleUploadError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string; type?: "success" | "error" | "default" }>;
      if (customEvent.detail?.message) {
        showNotif(customEvent.detail.message, customEvent.detail.type || "error");
      }
    };
    window.addEventListener("dps-upload-error", handleUploadError);
    return () => window.removeEventListener("dps-upload-error", handleUploadError);
  }, []);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const existing = await getConsistingCategories();
        if (existing.length > 0) {
          setAvailableCategories(existing);
          if (!id) {
            setCategories([existing[0]]);
          }
        }
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    loadCategories();
  }, [id]);

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
              ? article.categoryColor.map((c) => c.toLowerCase())
              : ["green"]
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
      <main className="w-full max-w-360 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Sidebar Component */}
        <Sidebar activeId="articles" className="md:sticky md:top-8 shrink-0" />

        {/* Main Content Card */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white rounded-3xl sm:rounded-[32px] border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Header Block */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="text-dark/40 text-xs md:text-sm font-normal font-sans tracking-wider uppercase">
              ARTIKEL
            </div>
            <h1 className="text-g1 text-2xl md:text-3xl font-bold font-sans">
              {id ? "Edit Artikel" : "Tambah Artikel Baru"}
            </h1>
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
                  descriptionValue="(736px × 448px)"
                  previewLayout="compact"
                  multiple={false}
                  defaultImageUrl={bannerUrl && bannerUrl.trim() ? bannerUrl.trim() : undefined}
                  defaultImageLabel="Banner Artikel Saat Ini"
                  onSelectMediaUrl={(url) => {
                    setBannerUrl(url);
                    setBannerFile(null);
                    setBannerRemoved(false);
                  }}
                  onFilesSelected={async (files: File[]) => {
                    if (files[0]) {
                      setUploadingBanner(true);
                      try {
                        const uploadedUrl = await uploadFileToServer(files[0], "articles");
                        setBannerUrl(uploadedUrl);
                        setBannerFile(null);
                        setBannerRemoved(false);
                      } catch (err: any) {
                        showNotif(err?.message || "Upload gagal: koneksi terlalu lama, coba lagi.", "error");
                      } finally {
                        setUploadingBanner(false);
                      }
                    }
                  }}
                  onRemoveDefaultImage={() => {
                    setBannerUrl(null);
                    setBannerFile(null);
                    setBannerRemoved(true);
                  }}
                  onError={(msg) => showNotif(msg, "error")}
                />

                {/* Article Title */}
                <InputBox
                  label={
                    <span>
                      Judul Artikel <span className="text-red-state">*</span>
                    </span>
                  }
                  placeholder="mis. Standar Keselamatan Pemasangan Guardrail di Jalan Tol"
                  value={articleNameIndonesia}
                  onChange={(e) => {
                    setArticleNameIndonesia(e.target.value);
                    setArticleName(e.target.value);
                  }}
                  required
                  containerClassName="max-w-none"
                />

                {/* Category & Badge Color */}
                <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
                  <Dropdown
                    label={
                      <span>
                        Kategori Artikel <span className="text-red-state">*</span>
                      </span>
                    }
                    placeholder="Pilih atau ketik kategori..."
                    options={availableCategories.map((c) => ({ value: c, label: c }))}
                    value={categories[0] || ""}
                    onChange={(val) => setCategories([val])}
                    multiple={false}
                    allowCustomValues={true}
                    containerClassName="flex-1 max-w-none"
                  />

                  <Dropdown
                    label={
                      <span>
                        Warna Badge Kategori <span className="text-red-state">*</span>
                      </span>
                    }
                    placeholder="Pilih Warna"
                    options={[
                      { value: "green", label: <Badge variant="green" text="Green" />, searchLabel: "Green" },
                      { value: "blue", label: <Badge variant="blue" text="Blue" />, searchLabel: "Blue" },
                      { value: "red", label: <Badge variant="red" text="Red" />, searchLabel: "Red" },
                      { value: "yellow", label: <Badge variant="yellow" text="Yellow" />, searchLabel: "Yellow" },
                      { value: "purple", label: <Badge variant="purple" text="Purple" />, searchLabel: "Purple" },
                      { value: "orange", label: <Badge variant="orange" text="Orange" />, searchLabel: "Orange" },
                    ]}
                    value={categoryColors[0]?.toLowerCase() || "green"}
                    onChange={(val) => setCategoryColors([val])}
                    multiple={false}
                    containerClassName="w-full max-w-none md:w-60 shrink-0"
                    selectClassName="bg-white"
                  />
                </div>

                {/* Article Content Editor */}
                <ArticleEditor
                  label="Isi Konten Artikel *"
                  value={contentIndonesia || content}
                  onChange={(val) => {
                    setContent(val);
                    setContentIndonesia(val);
                  }}
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
                  variant="outline"
                  className="w-full sm:w-36 cursor-pointer"
                />
                <Button
                  type="submit"
                  disabled={submitting || uploadingBanner}
                  text={
                    submitting
                      ? "Menyimpan..."
                      : uploadingBanner
                      ? "Mengunggah..."
                      : id
                      ? "Perbarui Artikel"
                      : "Simpan Artikel"
                  }
                  variant="fill"
                  rightIcon={id ? "Pen" : "Add"}
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
