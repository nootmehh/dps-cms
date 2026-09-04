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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  // Dynamic Specification / Detail Product (Key-Value)
  const [details, setDetails] = useState<ProductDetailItem[]>([
    { title: "Kisaran Harga", value: "" },
    { title: "Kemasan", value: "" },
    { title: "Pemakaian", value: "" },
    { title: "Aplikasi", value: "" },
    { title: "Spesifikasi", value: "" },
  ]);

  // Suitable For list
  const [suitableFor, setSuitableFor] = useState<string[]>([
    "",
    "",
  ]);

  // Kelebihan list
  const [kelebihan, setKelebihan] = useState<ProductFeatureItem[]>([
    { title: "", value: "" },
  ]);

  // Kekurangan list
  const [kekurangan, setKekurangan] = useState<ProductFeatureItem[]>([
    { title: "", value: "" },
  ]);

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
        const merged = Array.from(new Set([...DEFAULT_PRODUCT_CATEGORIES, ...existing]));
        setAvailableCategories(merged);
      } catch (err) {
        console.error("Error loading product categories", err);
      }
    };
    loadCategories();
  }, []);

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
          setImageUrl(product.imageUrl || null);

          if (product.detailProduct && product.detailProduct.length > 0) {
            setDetails(product.detailProduct);
          }
          if (product.suitableFor && product.suitableFor.length > 0) {
            setSuitableFor(product.suitableFor);
          }
          if (product.kelebihan && product.kelebihan.length > 0) {
            setKelebihan(product.kelebihan);
          }
          if (product.kekurangan && product.kekurangan.length > 0) {
            setKekurangan(product.kekurangan);
          }

          if (product.category && !availableCategories.includes(product.category)) {
            setAvailableCategories((prev) => Array.from(new Set([...prev, product.category])));
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
    setSuitableFor((prev) => [...prev, ""]);
  };
  const handleUpdateSuitable = (index: number, val: string) => {
    setSuitableFor((prev) => {
      const next = [...prev];
      next[index] = val;
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

    if (!description.trim()) {
      showNotif("Deskripsi produk wajib diisi.", "error");
      return;
    }

    // Filter out empty rows
    const cleanedDetails = details.filter((d) => d.title.trim() || d.value.trim());
    const cleanedSuitable = suitableFor.map((s) => s.trim()).filter(Boolean);
    const cleanedKelebihan = kelebihan.filter((k) => k.title.trim() || k.value.trim());
    const cleanedKekurangan = kekurangan.filter((k) => k.title.trim() || k.value.trim());

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category: category.trim(),
        categoryVariant: categoryVariant || CATEGORY_VARIANT_MAP[category.trim()] || "green",
        description: description.trim(),
        imageUrl: imageUrl,
        detailProduct: cleanedDetails,
        suitableFor: cleanedSuitable,
        kelebihan: cleanedKelebihan,
        kekurangan: cleanedKekurangan,
      };

      if (id) {
        await editProduct(id, payload, imageFile, imageRemoved);
        showNotif(`Produk "${title.trim()}" berhasil diperbarui!`, "success");
      } else {
        await addProduct(payload, imageFile);
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
      <main className="w-full max-w-[1440px] px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Sidebar Component */}
        <Sidebar activeId="products" />

        {/* Main Content Card */}
        <div className="flex-1 p-6 md:p-8 bg-white rounded-[32px] border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Back Button */}
          <Button
            type="button"
            onClick={() => router.push("/kelola-produk")}
            text="Kembali"
            leftIcon="Left 1"
            variant="ghost-green"
            className="cursor-pointer"
          />

          {/* Header Block */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="text-dark/40 text-xs md:text-sm font-normal font-sans tracking-wider uppercase">
              FORMULIR PRODUK
            </div>
            <h1 className="text-g1 text-2xl md:text-3xl font-bold font-sans">
              {id ? "Edit Produk" : "Tambah Produk Baru"}
            </h1>
            <p className="text-dark/70 text-sm font-normal font-sans">
              Lengkapi informasi produk, spesifikasi detail, kelebihan, kekurangan, dan rekomendasi penggunaan.
            </p>
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
                  <div className="text-dark text-base font-bold font-sans flex items-center gap-2">
                    <div className="size-2 rounded-full bg-g1" />
                    Informasi Utama Produk
                  </div>

                  {/* Product Image Upload with Large Preview */}
                  <UploadFile
                    label="Foto / Gambar Produk"
                    descriptionPrefix="Ukuran Disarankan"
                    descriptionValue="(800px * 600px)"
                    previewLayout="large"
                    multiple={false}
                    defaultImageUrl={imageUrl || undefined}
                    defaultImageLabel="Gambar Produk Saat Ini"
                    onRemoveDefaultImage={() => {
                      setImageUrl(null);
                      setImageFile(null);
                      setImageRemoved(true);
                    }}
                    onFilesSelected={(files: File[]) => {
                      if (files.length > 0) {
                        setImageFile(files[0]);
                        setImageUrl(URL.createObjectURL(files[0]));
                        setImageRemoved(false);
                      } else {
                        setImageFile(null);
                        setImageUrl(null);
                        setImageRemoved(true);
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
                    placeholder="mis. Glass Beads (Butiran Kaca Reflektif Marka Jalan)"
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
                    placeholder="Tuliskan deskripsi lengkap mengenai fungsi, kegunaan, dan standar mutu produk..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    containerClassName="max-w-none"
                    required
                  />
                </div>

                {/* Section Divider */}
                <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

                {/* 2. SPESIFIKASI DETAIL PRODUK (DETAIL_PRODUCT_TITLE & DETAIL_PRODUCT_VALUE) */}
                <div className="flex flex-col gap-4 w-full">
                  <div className="self-stretch px-4 py-3 bg-g1/10 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 text-g1 flex items-center justify-center">
                        <LordIcon name="Setting" size={20} primaryColor="#0A9863" />
                      </div>
                      <div>
                        <span className="text-g1 text-sm md:text-base font-semibold font-sans">
                          Detail Spesifikasi Teknis (Spesifikasi / Detail Produk)
                        </span>
                        <span className="text-dark/50 text-xs md:text-sm font-normal font-sans">
                          {" "}
                          (Key - Value)
                        </span>
                      </div>
                    </div>

                    {/* Add Spec Row Button */}
                    <button
                      type="button"
                      onClick={handleAddDetail}
                      className="h-9 px-3 bg-white hover:bg-g1/15 text-g1 rounded-full border border-g1/20 flex items-center justify-center gap-1.5 text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs shrink-0"
                      title="Tambah Spesifikasi"
                    >
                      <LordIcon name="Add" size={16} primaryColor="#0A9863" />
                      <span>Tambah Spesifikasi</span>
                    </button>
                  </div>

                  {details.length === 0 ? (
                    <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-2">
                      Belum ada spesifikasi teknis. Klik tombol <span className="text-g1 font-semibold">+ Tambah Spesifikasi</span> untuk menambahkan (misal: Kisaran Harga, Kemasan, Pemakaian, Aplikasi, Spesifikasi).
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      {details.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full p-4 bg-brand-background/40 rounded-2xl border border-white-80"
                        >
                          <InputBox
                            label={`Judul Spesifikasi #${index + 1}`}
                            placeholder="cth. Kisaran Harga / Kemasan / Spesifikasi"
                            value={item.title}
                            onChange={(e) => handleUpdateDetail(index, "title", e.target.value)}
                            containerClassName="w-full md:w-64 shrink-0 max-w-none"
                          />

                          <DescriptionBox
                            label={`Nilai Spesifikasi #${index + 1}`}
                            placeholder="cth. Rp20.000 – Rp35.000/kg / Tipe drop-on maupun premix, standar AASHTO M247..."
                            value={item.value}
                            onChange={(e) => handleUpdateDetail(index, "value", e.target.value)}
                            rows={2}
                            containerClassName="flex-1 max-w-none"
                          />

                          <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveDetail(index)}
                              className="size-11 bg-red-state/10 hover:bg-red-state text-red-state hover:text-white rounded-full flex justify-center items-center transition-all cursor-pointer"
                              title="Hapus Spesifikasi"
                            >
                              <LordIcon name="Delete" size={18} primaryColor="currentColor" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section Divider */}
                <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

                {/* 3. REKOMENDASI PENGGUNAAN / COCOK UNTUK (SUITABLE_FOR) */}
                <div className="flex flex-col gap-4 w-full">
                  <div className="self-stretch px-4 py-3 bg-blue-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 text-blue-600 flex items-center justify-center">
                        <LordIcon name="Global" size={20} primaryColor="#2563EB" />
                      </div>
                      <div>
                        <span className="text-blue-700 text-sm md:text-base font-semibold font-sans">
                          Rekomendasi Penggunaan / Cocok Untuk (Suitable For)
                        </span>
                        <span className="text-dark/50 text-xs md:text-sm font-normal font-sans">
                          {" "}
                          (Daftar skenario atau jenis proyek yang cocok)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSuitable}
                      className="h-9 px-3 bg-white hover:bg-blue-50 text-blue-600 rounded-full border border-blue-200 flex items-center justify-center gap-1.5 text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs shrink-0"
                      title="Tambah Rekomendasi"
                    >
                      <LordIcon name="Add" size={16} primaryColor="#2563EB" />
                      <span>Tambah Rekomendasi</span>
                    </button>
                  </div>

                  {suitableFor.length === 0 ? (
                    <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-2">
                      Belum ada rekomendasi penggunaan. Klik tombol <span className="text-blue-600 font-semibold">+ Tambah Rekomendasi</span> untuk menambahkan.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      {suitableFor.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full p-4 bg-brand-background/40 rounded-2xl border border-white-80"
                        >
                          <DescriptionBox
                            label={`Rekomendasi #${index + 1}`}
                            placeholder="cth. Proyek Pengecatan Marka Jalan: Digunakan bersamaan dengan jasa pengecatan marka jalan..."
                            value={item}
                            onChange={(e) => handleUpdateSuitable(index, e.target.value)}
                            rows={2}
                            containerClassName="flex-1 max-w-none"
                          />

                          <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveSuitable(index)}
                              className="size-11 bg-red-state/10 hover:bg-red-state text-red-state hover:text-white rounded-full flex justify-center items-center transition-all cursor-pointer"
                              title="Hapus Rekomendasi"
                            >
                              <LordIcon name="Delete" size={18} primaryColor="currentColor" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section Divider */}
                <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

                {/* 4. KELEBIHAN / KEUNGGULAN PRODUK (KELEBIHAN_TITLE & KELEBIHAN_VALUE) */}
                <div className="flex flex-col gap-4 w-full">
                  <div className="self-stretch px-4 py-3 bg-emerald-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 text-emerald-600 flex items-center justify-center">
                        <LordIcon name="Check" size={20} primaryColor="#059669" />
                      </div>
                      <div>
                        <span className="text-emerald-700 text-sm md:text-base font-semibold font-sans">
                          Kelebihan & Keunggulan Produk
                        </span>
                        <span className="text-dark/50 text-xs md:text-sm font-normal font-sans">
                          {" "}
                          (Judul & Penjelasan Kelebihan)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddKelebihan}
                      className="h-9 px-3 bg-white hover:bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 flex items-center justify-center gap-1.5 text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs shrink-0"
                      title="Tambah Kelebihan"
                    >
                      <LordIcon name="Add" size={16} primaryColor="#059669" />
                      <span>Tambah Kelebihan</span>
                    </button>
                  </div>

                  {kelebihan.length === 0 ? (
                    <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-2">
                      Belum ada poin kelebihan. Klik tombol <span className="text-emerald-600 font-semibold">+ Tambah Kelebihan</span>.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      {kelebihan.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full p-4 bg-brand-background/40 rounded-2xl border border-white-80"
                        >
                          <InputBox
                            label={`Judul Kelebihan #${index + 1}`}
                            placeholder="cth. Meningkatkan Visibilitas & Keselamatan"
                            value={item.title}
                            onChange={(e) => handleUpdateKelebihan(index, "title", e.target.value)}
                            containerClassName="w-full md:w-64 shrink-0 max-w-none"
                          />

                          <DescriptionBox
                            label={`Penjelasan Kelebihan #${index + 1}`}
                            placeholder="cth. Meningkatkan visibilitas dan keselamatan berkendara pada malam hari..."
                            value={item.value}
                            onChange={(e) => handleUpdateKelebihan(index, "value", e.target.value)}
                            rows={2}
                            containerClassName="flex-1 max-w-none"
                          />

                          <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveKelebihan(index)}
                              className="size-11 bg-red-state/10 hover:bg-red-state text-red-state hover:text-white rounded-full flex justify-center items-center transition-all cursor-pointer"
                              title="Hapus Kelebihan"
                            >
                              <LordIcon name="Delete" size={18} primaryColor="currentColor" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section Divider */}
                <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

                {/* 5. KEKURANGAN / HAL YANG PERLU DIPERHATIKAN (KEKURANGAN_TITLE & KEKURANGAN_VALUE) */}
                <div className="flex flex-col gap-4 w-full">
                  <div className="self-stretch px-4 py-3 bg-amber-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 text-amber-600 flex items-center justify-center">
                        <LordIcon name="Lock" size={20} primaryColor="#D97706" />
                      </div>
                      <div>
                        <span className="text-amber-700 text-sm md:text-base font-semibold font-sans">
                          Kekurangan / Hal yang Perlu Diperhatikan
                        </span>
                        <span className="text-dark/50 text-xs md:text-sm font-normal font-sans">
                          {" "}
                          (Judul & Penjelasan Kekurangan / Catatan Aplikasi)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddKekurangan}
                      className="h-9 px-3 bg-white hover:bg-amber-50 text-amber-600 rounded-full border border-amber-200 flex items-center justify-center gap-1.5 text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs shrink-0"
                      title="Tambah Kekurangan"
                    >
                      <LordIcon name="Add" size={16} primaryColor="#D97706" />
                      <span>Tambah Kekurangan</span>
                    </button>
                  </div>

                  {kekurangan.length === 0 ? (
                    <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-2">
                      Belum ada poin catatan/kekurangan. Klik tombol <span className="text-amber-600 font-semibold">+ Tambah Kekurangan</span>.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      {kekurangan.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full p-4 bg-brand-background/40 rounded-2xl border border-white-80"
                        >
                          <InputBox
                            label={`Judul Kekurangan / Catatan #${index + 1}`}
                            placeholder="cth. Daya Reflektif Menurun Seiring Waktu"
                            value={item.title}
                            onChange={(e) => handleUpdateKekurangan(index, "title", e.target.value)}
                            containerClassName="w-full md:w-64 shrink-0 max-w-none"
                          />

                          <DescriptionBox
                            label={`Penjelasan Kekurangan / Catatan #${index + 1}`}
                            placeholder="cth. Daya reflektif menurun akibat gesekan roda kendaraan dan kotoran jalan..."
                            value={item.value}
                            onChange={(e) => handleUpdateKekurangan(index, "value", e.target.value)}
                            rows={2}
                            containerClassName="flex-1 max-w-none"
                          />

                          <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveKekurangan(index)}
                              className="size-11 bg-red-state/10 hover:bg-red-state text-red-state hover:text-white rounded-full flex justify-center items-center transition-all cursor-pointer"
                              title="Hapus Kekurangan"
                            >
                              <LordIcon name="Delete" size={18} primaryColor="currentColor" />
                            </button>
                          </div>
                        </div>
                      ))}
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
                  variant="ghost-green"
                  className="w-full sm:w-36 cursor-pointer"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  text={submitting ? "Menyimpan..." : id ? "Perbarui Produk" : "Simpan Produk"}
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
