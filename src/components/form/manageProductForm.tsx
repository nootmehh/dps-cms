"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../layout/navbar";
import Sidebar from "../layout/sidebar";
import Button from "../ui/button";
import InputBox from "../ui/inputBox";
import DescriptionBox from "../ui/descriptionBox";
import UploadFile from "../ui/uploadFile";
import Dropdown from "../ui/dropdown";
import Badge from "../ui/badge";
import Notification, { type NotificationType } from "../ui/notification";
import LordIcon from "../common/lordIcon";
import {
  getProductById,
  addProduct,
  editProduct,
  getConsistingProductCategories,
  DEFAULT_PRODUCT_CATEGORIES,
  CATEGORY_VARIANT_MAP,
  type ProductDetailItem,
  type ProductFeatureItem,
  type ProductSuitableItem,
} from "../../shared/api/product";

export interface ManageProductFormProps {
  id?: string;
}

export default function ManageProductForm({ id }: ManageProductFormProps) {
  const router = useRouter();

  // Basic Info
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(DEFAULT_PRODUCT_CATEGORIES[0]);
  const [categoryVariant, setCategoryVariant] = useState<string>("green");
  const [description, setDescription] = useState("");
  const [_imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);

  // Highlight Image (Cocok Untuk) - single image only
  const [highlightImageUrl, setHighlightImageUrl] = useState<string | null>(null);
  const [highlightImageFile, setHighlightImageFile] = useState<File | null>(null);
  const [highlightImageRemoved, setHighlightImageRemoved] = useState(false);
  const [removedHighlightUrls, setRemovedHighlightUrls] = useState<string[]>([]);

  // Dynamic Specification / Detail Product (Key-Value)
  const [details, setDetails] = useState<ProductDetailItem[]>([
    { title: "Kisaran Harga", value: "" },
    { title: "Kemasan", value: "" },
    { title: "Pemakaian", value: "" },
    { title: "Aplikasi", value: "" },
    { title: "Spesifikasi", value: "" },
  ]);

  // Suitable For list (2 inputs: title & value)
  const [suitableFor, setSuitableFor] = useState<ProductSuitableItem[]>([
    { title: "", value: "" },
  ]);

  // Kelebihan list
  const [kelebihan, setKelebihan] = useState<ProductFeatureItem[]>([
    { title: "", value: "" },
  ]);

  // Kekurangan list
  const [kekurangan, setKekurangan] = useState<ProductFeatureItem[]>([
    { title: "", value: "" },
  ]);

  type ProductDetailTab = "spesifikasi" | "suitable" | "kelebihan" | "kekurangan";
  const [activeTab, setActiveTab] = useState<ProductDetailTab>("spesifikasi");

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>(DEFAULT_PRODUCT_CATEGORIES);

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: NotificationType;
  }>({
    isOpen: false,
    message: "",
    type: "default",
  });

  const showNotif = (message: string, type: NotificationType = "default") => {
    setNotification({
      isOpen: true,
      message,
      type,
    });
  };

  // Load existing categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const existing = await getConsistingProductCategories();
        if (existing.length > 0) {
          setAvailableCategories(existing);
          if (!id) {
            setCategory(existing[0]);
          }
        }
      } catch (err) {
        console.error("Error loading product categories", err);
      }
    };
    loadCategories();
  }, [id]);

  // Load product if editing
  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const product = await getProductById(id);
        if (product) {
          setTitle(product.title || "");
          setCategory(product.category || DEFAULT_PRODUCT_CATEGORIES[0]);
          setCategoryVariant(
            product.categoryVariant || CATEGORY_VARIANT_MAP[product.category] || "green"
          );
          setDescription(product.description || "");
          const loadedUrls = product.imageUrls && product.imageUrls.length > 0
            ? product.imageUrls
            : product.imageUrl
            ? [product.imageUrl]
            : [];
          setImageUrls(loadedUrls);
          setImageUrl(loadedUrls[0] || null);
          setImageFiles([]);
          setImageRemoved(false);
          setRemovedImageUrls([]);
          setHighlightImageUrl(product.highlightImgUrl || null);
          setRemovedHighlightUrls([]);

          if (product.detailProduct && product.detailProduct.length > 0) {
            setDetails(product.detailProduct);
          }
          if (product.suitableFor && product.suitableFor.length > 0) {
            setSuitableFor(
              product.suitableFor.map((item: any) =>
                typeof item === "string"
                  ? { title: item, value: "" }
                  : { title: item.title || "", value: item.value || "" }
              )
            );
          }
          if (product.kelebihan && product.kelebihan.length > 0) {
            setKelebihan(product.kelebihan);
          }
          if (product.kekurangan && product.kekurangan.length > 0) {
            setKekurangan(product.kekurangan);
          }

          if (product.category) {
            setAvailableCategories((prev) =>
              prev.includes(product.category) ? prev : [...prev, product.category]
            );
          }
        } else {
          showNotif("Produk tidak ditemukan.", "error");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Gagal memuat data produk.";
        showNotif(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Detail handlers
  const handleAddDetail = () => {
    setDetails((prev) => [...prev, { title: "", value: "" }]);
  };
  const handleUpdateDetail = (index: number, field: "title" | "value", val: string) => {
    setDetails((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const handleRemoveDetail = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // Suitable for handlers
  const handleAddSuitable = () => {
    setSuitableFor((prev) => [...prev, { title: "", value: "" }]);
  };
  const handleUpdateSuitable = (index: number, field: "title" | "value", val: string) => {
    setSuitableFor((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const handleRemoveSuitable = (index: number) => {
    setSuitableFor((prev) => prev.filter((_, i) => i !== index));
  };

  // Kelebihan handlers
  const handleAddKelebihan = () => {
    setKelebihan((prev) => [...prev, { title: "", value: "" }]);
  };
  const handleUpdateKelebihan = (index: number, field: "title" | "value", val: string) => {
    setKelebihan((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const handleRemoveKelebihan = (index: number) => {
    setKelebihan((prev) => prev.filter((_, i) => i !== index));
  };

  // Kekurangan handlers
  const handleAddKekurangan = () => {
    setKekurangan((prev) => [...prev, { title: "", value: "" }]);
  };
  const handleUpdateKekurangan = (index: number, field: "title" | "value", val: string) => {
    setKekurangan((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const handleRemoveKekurangan = (index: number) => {
    setKekurangan((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showNotif("Nama / Judul produk wajib diisi.", "error");
      return;
    }

    if (!category.trim()) {
      showNotif("Kategori produk wajib dipilih.", "error");
      return;
    }

    if (imageUrls.length === 0 && imageFiles.length === 0) {
      showNotif("Foto / Gambar produk wajib diunggah minimal 1 gambar.", "error");
      return;
    }

    if (!description.trim()) {
      showNotif("Deskripsi produk wajib diisi.", "error");
      return;
    }

    // Filter out empty rows
    const cleanedDetails = details.filter((d) => d.title.trim() || d.value.trim());
    const cleanedSuitable = suitableFor.filter((s) => s.title.trim() || s.value.trim());
    const cleanedKelebihan = kelebihan.filter((k) => k.title.trim() || k.value.trim());
    const cleanedKekurangan = kekurangan.filter((k) => k.title.trim() || k.value.trim());

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category: category.trim(),
        categoryVariant: categoryVariant || CATEGORY_VARIANT_MAP[category.trim()] || "green",
        description: description.trim(),
        imageUrl: imageUrls[0] || null,
        imageUrls: imageUrls,
        highlightImgUrl: highlightImageUrl,
        detailProduct: cleanedDetails,
        suitableFor: cleanedSuitable,
        kelebihan: cleanedKelebihan,
        kekurangan: cleanedKekurangan,
      };

      if (id) {
        await editProduct(
          id,
          payload,
          imageFiles,
          imageRemoved && imageUrls.length === 0,
          highlightImageFile,
          highlightImageRemoved,
          [...removedImageUrls, ...removedHighlightUrls]
        );
        showNotif(`Produk "${title.trim()}" berhasil diperbarui!`, "success");
      } else {
        await addProduct(payload, imageFiles, highlightImageFile);
        showNotif(`Produk "${title.trim()}" berhasil ditambahkan!`, "success");
      }

      // Return to products list page
      setTimeout(() => {
        router.push("/kelola-produk");
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menyimpan produk.";
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
      <main className="w-full max-w-360 px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Sidebar Component */}
        <Sidebar activeId="products" className="md:sticky md:top-8 shrink-0" />

        {/* Main Content Card */}
        <div className="flex-1 p-6 md:p-8 bg-white rounded-[32px] border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Header Block */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="text-dark/40 text-xs md:text-sm font-normal font-sans tracking-wider uppercase">
              PRODUK
            </div>
            <h1 className="text-g1 text-2xl md:text-3xl font-bold font-sans">
              {id ? "Edit Produk" : "Tambah Produk Baru"}
            </h1>
          </div>

          {/* Divider */}
          <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

          {loading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-g1">
              <div className="w-10 h-10 border-4 border-g1 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-sans text-dark/60">Memuat data produk...</span>
            </div>
          ) : (
            /* Form Area */
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
              <div className="flex flex-col gap-6">
                {/* 1. INFORMASI UTAMA PRODUK */}
                <div className="flex flex-col gap-5">
                  <div className="text-g1 text-base font-bold font-sans">
                    Informasi Utama Produk
                  </div>

                  {/* Product Image Upload with Large Preview */}
                  <UploadFile
                    label="Foto / Gambar Produk *"
                    labelInfo="(Bisa Upload 4 Gambar)"
                    descriptionPrefix="Ukuran Disarankan"
                    descriptionValue="(800px * 600px)"
                    previewLayout="large"
                    multiple={true}
                    maxFiles={4}
                    existingImageUrls={imageUrls}
                    onRemoveExistingImage={(removedUrl) => {
                      setImageUrls((prev) => {
                        const updated = prev.filter((u) => u !== removedUrl);
                        if (updated.length === 0) setImageRemoved(true);
                        return updated;
                      });
                      setRemovedImageUrls((prev) => [...prev, removedUrl]);
                    }}
                    onAddExistingUrl={(newUrl) => {
                      setImageUrls((prev) => {
                        if (prev.includes(newUrl)) return prev;
                        if (prev.length + imageFiles.length >= 4) return prev;
                        return [...prev, newUrl];
                      });
                      setImageRemoved(false);
                    }}
                    onFilesSelected={(files: File[]) => {
                      setImageFiles(files);
                      if (files.length > 0) {
                        setImageRemoved(false);
                      }
                    }}
                    className="max-w-none w-full"
                  />

                  {/* Product Title */}
                  <InputBox
                    label={
                      <span>
                        Nama / Judul Produk <span className="text-red-state">*</span>
                      </span>
                    }
                    placeholder="Masukkan nama produk..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    containerClassName="max-w-none"
                  />

                  {/* Category & Badge Variant */}
                  <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
                    <Dropdown
                      label={
                        <span>
                          Kategori Produk <span className="text-red-state">*</span>
                        </span>
                      }
                      placeholder="Pilih atau ketik kategori produk..."
                      options={availableCategories.map((c) => ({ value: c, label: c }))}
                      value={category}
                      onChange={(val) => {
                        setCategory(val);
                        if (CATEGORY_VARIANT_MAP[val]) {
                          setCategoryVariant(CATEGORY_VARIANT_MAP[val]);
                        }
                      }}
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
                        { value: "yellow", label: <Badge variant="yellow" text="Yellow" />, searchLabel: "Yellow" },
                        { value: "orange", label: <Badge variant="orange" text="Orange" />, searchLabel: "Orange" },
                        { value: "purple", label: <Badge variant="purple" text="Purple" />, searchLabel: "Purple" },
                        { value: "red", label: <Badge variant="red" text="Red" />, searchLabel: "Red" },
                      ]}
                      value={categoryVariant}
                      onChange={(val) => setCategoryVariant(val)}
                      multiple={false}
                      containerClassName="w-full max-w-none md:w-60 shrink-0"
                      selectClassName="bg-white"
                    />
                  </div>

                  {/* Product Description */}
                  <DescriptionBox
                    label={
                      <span>
                        Deskripsi Lengkap Produk <span className="text-red-state">*</span>
                      </span>
                    }
                    placeholder="Tuliskan deskripsi lengkap produk..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    containerClassName="max-w-none"
                    required
                  />
                </div>

                {/* Section Divider */}
                <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

                {/* 2. DETAIL & INFORMASI TAMBAHAN (TAB NAVIGATION) */}
                <div className="flex flex-col gap-5 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-g1 text-base font-bold font-sans">
                      Detail & Informasi Tambahan
                    </div>
                    <span className="text-xs text-dark/50 font-normal font-sans">
                      Pilih tab untuk mengisi atau mengubah detail produk
                    </span>
                  </div>

                  {/* Tab Navigation Buttons Bar */}
                  <div className="self-stretch flex items-center gap-2 p-1.5 bg-white-90 rounded-full border border-white-80 shrink-0 overflow-x-auto">
                    {/* Tab 1: Spesifikasi */}
                    <button
                      type="button"
                      id="tab-spesifikasi"
                      onClick={() => setActiveTab("spesifikasi")}
                      className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-sm font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-[0.98] ${
                        activeTab === "spesifikasi"
                          ? "bg-g1 text-white border border-g2 shadow-sm shadow-g1/25 hover:opacity-80 active:opacity-60"
                          : "text-dark/70 border border-transparent hover:border-g1/40 hover:text-g1 hover:bg-white hover:opacity-80 active:opacity-60 hover:shadow-xs hover:-translate-y-0.5"
                      }`}
                    >
                      <LordIcon
                        name="Setting"
                        size={18}
                        trigger="hover"
                        target="button"
                        primaryColor={activeTab === "spesifikasi" ? "#ffffff" : "#0A9863"}
                        secondaryColor={activeTab === "spesifikasi" ? "#ffffff" : "#0A9863"}
                      />
                      <span>Spesifikasi</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-200 ${
                          activeTab === "spesifikasi"
                            ? "bg-white/20 text-white"
                            : "bg-g1/10 text-g1 group-hover:bg-g1 group-hover:text-white"
                        }`}
                      >
                        {details.length}
                      </span>
                    </button>

                    {/* Tab 2: Cocok Untuk */}
                    <button
                      type="button"
                      id="tab-suitable"
                      onClick={() => setActiveTab("suitable")}
                      className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-sm font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-[0.98] ${
                        activeTab === "suitable"
                          ? "bg-g1 text-white border border-g2 shadow-sm shadow-g1/25 hover:opacity-80 active:opacity-60"
                          : "text-dark/70 border border-transparent hover:border-g1/40 hover:text-g1 hover:bg-white hover:opacity-80 active:opacity-60 hover:shadow-xs hover:-translate-y-0.5"
                      }`}
                    >
                      <LordIcon
                        name="Global"
                        size={18}
                        trigger="hover"
                        target="button"
                        primaryColor={activeTab === "suitable" ? "#ffffff" : "#0A9863"}
                        secondaryColor={activeTab === "suitable" ? "#ffffff" : "#0A9863"}
                      />
                      <span>Cocok Untuk</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-200 ${
                          activeTab === "suitable"
                            ? "bg-white/20 text-white"
                            : "bg-g1/10 text-g1 group-hover:bg-g1 group-hover:text-white"
                        }`}
                      >
                        {suitableFor.length}
                      </span>
                    </button>

                    {/* Tab 3: Kelebihan */}
                    <button
                      type="button"
                      id="tab-kelebihan"
                      onClick={() => setActiveTab("kelebihan")}
                      className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-sm font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-[0.98] ${
                        activeTab === "kelebihan"
                          ? "bg-g1 text-white border border-g2 shadow-sm shadow-g1/25 hover:opacity-80 active:opacity-60"
                          : "text-dark/70 border border-transparent hover:border-g1/40 hover:text-g1 hover:bg-white hover:opacity-80 active:opacity-60 hover:shadow-xs hover:-translate-y-0.5"
                      }`}
                    >
                      <LordIcon
                        name="CheckCircle"
                        size={18}
                        trigger="hover"
                        target="button"
                        primaryColor={activeTab === "kelebihan" ? "#ffffff" : "#0A9863"}
                        secondaryColor={activeTab === "kelebihan" ? "#ffffff" : "#0A9863"}
                      />
                      <span>Kelebihan</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-200 ${
                          activeTab === "kelebihan"
                            ? "bg-white/20 text-white"
                            : "bg-g1/10 text-g1 group-hover:bg-g1 group-hover:text-white"
                        }`}
                      >
                        {kelebihan.length}
                      </span>
                    </button>

                    {/* Tab 4: Kekurangan */}
                    <button
                      type="button"
                      id="tab-kekurangan"
                      onClick={() => setActiveTab("kekurangan")}
                      className={`group flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-sm font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-[0.98] ${
                        activeTab === "kekurangan"
                          ? "bg-g1 text-white border border-g2 shadow-sm shadow-g1/25 hover:opacity-80 active:opacity-60"
                          : "text-dark/70 border border-transparent hover:border-g1/40 hover:text-g1 hover:bg-white hover:opacity-80 active:opacity-60 hover:shadow-xs hover:-translate-y-0.5"
                      }`}
                    >
                      <LordIcon
                        name="CrossCircle"
                        size={18}
                        trigger="hover"
                        target="button"
                        primaryColor={activeTab === "kekurangan" ? "#ffffff" : "#0A9863"}
                        secondaryColor={activeTab === "kekurangan" ? "#ffffff" : "#0A9863"}
                      />
                      <span>Kekurangan</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-200 ${
                          activeTab === "kekurangan"
                            ? "bg-white/20 text-white"
                            : "bg-g1/10 text-g1 group-hover:bg-g1 group-hover:text-white"
                        }`}
                      >
                        {kekurangan.length}
                      </span>
                    </button>
                  </div>

                  {/* TAB CONTENT: 1. SPESIFIKASI */}
                  {activeTab === "spesifikasi" && (
                    <div className="flex flex-col gap-4 w-full">
                      <div className="self-stretch px-3.5 py-2 bg-brand-background rounded-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 text-g1 flex items-center justify-center shrink-0">
                            <LordIcon name="Setting" size={20} primaryColor="#0A9863" />
                          </div>
                          <div>
                            <span className="text-g1 text-sm md:text-base font-semibold font-sans">
                              Detail Spesifikasi Teknis
                            </span>
                          </div>
                        </div>

                        {/* Add Spec Row Button */}
                        <Button
                          type="button"
                          onClick={handleAddDetail}
                          text="Tambah Spesifikasi"
                          variant="fill"
                          size="sm"
                          rightIcon="Add"
                          className="shrink-0 cursor-pointer"
                        />
                      </div>

                      {details.length === 0 ? (
                        <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-6 text-center bg-brand-background/20 rounded-2xl border border-dashed border-white-80">
                          Belum ada spesifikasi teknis. Klik tombol <span className="text-g1 font-semibold">+ Tambah Spesifikasi</span> untuk menambahkan.
                        </div>
                      ) : (
                        <div className="flex flex-col divide-y divide-g1/10 w-full">
                          {details.map((item, index) => (
                            <div
                              key={index}
                              className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full py-4 first:pt-1 last:pb-1"
                            >
                              <InputBox
                                label={
                                  <span>
                                    Judul Spesifikasi <span className="text-g1">#{index + 1}</span>
                                  </span>
                                }
                                placeholder="Masukkan judul spesifikasi..."
                                value={item.title}
                                onChange={(e) => handleUpdateDetail(index, "title", e.target.value)}
                                containerClassName="w-full md:w-64 shrink-0 max-w-none"
                              />

                              <DescriptionBox
                                label={
                                  <span>
                                    Nilai Spesifikasi <span className="text-g1">#{index + 1}</span>
                                  </span>
                                }
                                placeholder="Masukkan nilai atau penjelasan spesifikasi..."
                                value={item.value}
                                onChange={(e) => handleUpdateDetail(index, "value", e.target.value)}
                                rows={2}
                                containerClassName="flex-1 max-w-none"
                              />

                              <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDetail(index)}
                                  className="size-9 bg-red-state hover:bg-red-state/90 border border-red-300 hover:border-red-400 text-white rounded-full flex justify-center items-center hover:opacity-80 active:opacity-60 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs shrink-0"
                                  title="Hapus Spesifikasi"
                                >
                                  <LordIcon name="Delete" size={16} primaryColor="#FFFFFF" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: 2. COCOK UNTUK */}
                  {activeTab === "suitable" && (
                    <div className="flex flex-col gap-6 w-full">
                      {/* Highlight Image Upload (Single Image Only) */}
                      <UploadFile
                        label="Highlight Image"
                        descriptionPrefix="Ukuran Disarankan"
                        descriptionValue="(800px * 600px)"
                        previewLayout="large"
                        multiple={false}
                        defaultImageUrl={highlightImageUrl || undefined}
                        defaultImageLabel="Highlight Image Saat Ini"
                        onRemoveDefaultImage={() => {
                          if (highlightImageUrl) {
                            setRemovedHighlightUrls((prev) => [...prev, highlightImageUrl]);
                          }
                          setHighlightImageUrl(null);
                          setHighlightImageFile(null);
                          setHighlightImageRemoved(true);
                        }}
                        onSelectMediaUrl={(url) => {
                          if (highlightImageUrl && highlightImageUrl !== url) {
                            setRemovedHighlightUrls((prev) => [...prev, highlightImageUrl]);
                          }
                          setHighlightImageUrl(url);
                          setHighlightImageFile(null);
                          setHighlightImageRemoved(false);
                        }}
                        onFilesSelected={(files: File[]) => {
                          if (files.length > 0) {
                            setHighlightImageFile(files[0]);
                            setHighlightImageUrl(URL.createObjectURL(files[0]));
                            setHighlightImageRemoved(false);
                          } else {
                            setHighlightImageFile(null);
                            setHighlightImageUrl(null);
                            setHighlightImageRemoved(true);
                          }
                        }}
                        className="max-w-none w-full"
                      />

                      {/* Section Divider */}
                      <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

                      <div className="self-stretch px-3.5 py-2 bg-brand-background rounded-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 text-g1 flex items-center justify-center shrink-0">
                            <LordIcon name="Global" size={20} primaryColor="#0A9863" />
                          </div>
                          <div>
                            <span className="text-g1 text-sm md:text-base font-semibold font-sans">
                              Rekomendasi Penggunaan (Cocok Untuk)
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleAddSuitable}
                          text="Tambah Rekomendasi"
                          variant="fill"
                          size="sm"
                          rightIcon="Add"
                          className="shrink-0 cursor-pointer"
                        />
                      </div>

                      {suitableFor.length === 0 ? (
                        <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-6 text-center bg-brand-background/20 rounded-2xl border border-dashed border-white-80">
                          Belum ada rekomendasi penggunaan. Klik tombol <span className="text-g1 font-semibold">+ Tambah Rekomendasi</span> untuk menambahkan.
                        </div>
                      ) : (
                        <div className="flex flex-col divide-y divide-g1/10 w-full">
                          {suitableFor.map((item, index) => (
                            <div
                              key={index}
                              className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full py-4 first:pt-1 last:pb-1"
                            >
                              <InputBox
                                label={
                                  <span>
                                    Judul Rekomendasi <span className="text-g1">#{index + 1}</span>
                                  </span>
                                }
                                placeholder="Masukkan judul rekomendasi..."
                                value={item.title}
                                onChange={(e) => handleUpdateSuitable(index, "title", e.target.value)}
                                containerClassName="w-full md:w-64 shrink-0 max-w-none"
                              />

                              <DescriptionBox
                                label={
                                  <span>
                                    Penjelasan Rekomendasi <span className="text-g1">#{index + 1}</span>
                                  </span>
                                }
                                placeholder="Masukkan penjelasan rekomendasi..."
                                value={item.value}
                                onChange={(e) => handleUpdateSuitable(index, "value", e.target.value)}
                                rows={2}
                                containerClassName="flex-1 max-w-none"
                              />

                              <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSuitable(index)}
                                  className="size-9 bg-red-state hover:bg-red-state/90 border border-red-300 hover:border-red-400 text-white rounded-full flex justify-center items-center hover:opacity-80 active:opacity-60 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs shrink-0"
                                  title="Hapus Rekomendasi"
                                >
                                  <LordIcon name="Delete" size={16} primaryColor="#FFFFFF" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: 3. KELEBIHAN */}
                  {activeTab === "kelebihan" && (
                    <div className="flex flex-col gap-4 w-full">
                      <div className="self-stretch px-3.5 py-2 bg-brand-background rounded-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 text-g1 flex items-center justify-center shrink-0">
                            <LordIcon name="CheckCircle" size={20} primaryColor="#0A9863" />
                          </div>
                          <div>
                            <span className="text-g1 text-sm md:text-base font-semibold font-sans">
                              Kelebihan & Keunggulan Produk
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleAddKelebihan}
                          text="Tambah Kelebihan"
                          variant="fill"
                          size="sm"
                          rightIcon="Add"
                          className="shrink-0 cursor-pointer"
                        />
                      </div>

                      {kelebihan.length === 0 ? (
                        <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-6 text-center bg-brand-background/20 rounded-2xl border border-dashed border-white-80">
                          Belum ada poin kelebihan. Klik tombol <span className="text-g1 font-semibold">+ Tambah Kelebihan</span> untuk menambahkan.
                        </div>
                      ) : (
                        <div className="flex flex-col divide-y divide-g1/10 w-full">
                          {kelebihan.map((item, index) => (
                            <div
                              key={index}
                              className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full py-4 first:pt-1 last:pb-1"
                            >
                              <InputBox
                                label={
                                  <span>
                                    Judul Kelebihan <span className="text-g1">#{index + 1}</span>
                                  </span>
                                }
                                placeholder="Masukkan judul kelebihan..."
                                value={item.title}
                                onChange={(e) => handleUpdateKelebihan(index, "title", e.target.value)}
                                containerClassName="w-full md:w-64 shrink-0 max-w-none"
                              />

                              <DescriptionBox
                                label={
                                  <span>
                                    Penjelasan Kelebihan <span className="text-g1">#{index + 1}</span>
                                  </span>
                                }
                                placeholder="Masukkan penjelasan kelebihan..."
                                value={item.value}
                                onChange={(e) => handleUpdateKelebihan(index, "value", e.target.value)}
                                rows={2}
                                containerClassName="flex-1 max-w-none"
                              />

                              <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKelebihan(index)}
                                  className="size-9 bg-red-state hover:bg-red-state/90 border border-red-300 hover:border-red-400 text-white rounded-full flex justify-center items-center hover:opacity-80 active:opacity-60 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs shrink-0"
                                  title="Hapus Kelebihan"
                                >
                                  <LordIcon name="Delete" size={16} primaryColor="#FFFFFF" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: 4. KEKURANGAN */}
                  {activeTab === "kekurangan" && (
                    <div className="flex flex-col gap-4 w-full">
                      <div className="self-stretch px-3.5 py-2 bg-brand-background rounded-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 text-g1 flex items-center justify-center shrink-0">
                            <LordIcon name="CrossCircle" size={20} primaryColor="#0A9863" />
                          </div>
                          <div>
                            <span className="text-g1 text-sm md:text-base font-semibold font-sans">
                              Kekurangan / Hal yang Perlu Diperhatikan
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleAddKekurangan}
                          text="Tambah Catatan"
                          variant="fill"
                          size="sm"
                          rightIcon="Add"
                          className="shrink-0 cursor-pointer"
                        />
                      </div>

                      {kekurangan.length === 0 ? (
                        <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-6 text-center bg-brand-background/20 rounded-2xl border border-dashed border-white-80">
                          Belum ada poin catatan/kekurangan. Klik tombol <span className="text-g1 font-semibold">+ Tambah Catatan</span> untuk menambahkan.
                        </div>
                      ) : (
                        <div className="flex flex-col divide-y divide-g1/10 w-full">
                          {kekurangan.map((item, index) => (
                            <div
                              key={index}
                              className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full py-4 first:pt-1 last:pb-1"
                            >
                              <InputBox
                                label={
                                  <span>
                                    Judul Catatan <span className="text-g1">#{index + 1}</span>
                                  </span>
                                }
                                placeholder="Masukkan judul catatan / kekurangan..."
                                value={item.title}
                                onChange={(e) => handleUpdateKekurangan(index, "title", e.target.value)}
                                containerClassName="w-full md:w-64 shrink-0 max-w-none"
                              />

                              <DescriptionBox
                                label={
                                  <span>
                                    Penjelasan Catatan <span className="text-g1">#{index + 1}</span>
                                  </span>
                                }
                                placeholder="Masukkan penjelasan catatan / kekurangan..."
                                value={item.value}
                                onChange={(e) => handleUpdateKekurangan(index, "value", e.target.value)}
                                rows={2}
                                containerClassName="flex-1 max-w-none"
                              />

                              <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKekurangan(index)}
                                  className="size-9 bg-red-state hover:bg-red-state/90 border border-red-300 hover:border-red-400 text-white rounded-full flex justify-center items-center hover:opacity-80 active:opacity-60 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs shrink-0"
                                  title="Hapus Catatan"
                                >
                                  <LordIcon name="Delete" size={16} primaryColor="#FFFFFF" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Divider */}
              <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

              {/* Action Buttons */}
              <div className="self-stretch flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-2 w-full">
                <Button
                  type="button"
                  onClick={() => router.push("/kelola-produk")}
                  text="Batal"
                  variant="outline"
                  className="w-full sm:w-36 cursor-pointer"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  text={submitting ? "Menyimpan..." : id ? "Perbarui Produk" : "Simpan Produk"}
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
