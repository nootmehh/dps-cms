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
  getServiceById,
  addService,
  editService,
  getConsistingServiceCategories,
  DEFAULT_SERVICE_CATEGORIES,
  SERVICE_CATEGORY_VARIANT_MAP,
  type ServiceKeunggulanItem,
  type ServiceMaterialItem,
  type ServiceFAQItem,
} from "../../shared/api/service";
import { getStoredProducts, type ProductPayload } from "../../shared/api/product";

export interface ManageServiceFormProps {
  id?: string;
}

export default function ManageServiceForm({ id }: ManageServiceFormProps) {
  const router = useRouter();

  // Basic Info
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(DEFAULT_SERVICE_CATEGORIES[0]);
  const [categoryVariant, setCategoryVariant] = useState<string>("green");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  // Dynamic Keunggulan
  const [keunggulan, setKeunggulan] = useState<ServiceKeunggulanItem[]>([
    { title: "", description: "" },
  ]);

  // Dynamic Material & Peralatan (Linked with Product Catalog)
  const [materialPeralatan, setMaterialPeralatan] = useState<ServiceMaterialItem[]>([
    { category: "", name: "" },
  ]);

  // Products from catalog
  const [catalogProducts, setCatalogProducts] = useState<ProductPayload[]>([]);

  // Dynamic FAQ
  const [faq, setFaq] = useState<ServiceFAQItem[]>([
    { question: "", answer: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>(DEFAULT_SERVICE_CATEGORIES);

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

  // Load catalog products
  useEffect(() => {
    try {
      const prods = getStoredProducts();
      setCatalogProducts(prods);
    } catch (err) {
      console.error("Error loading products from catalog", err);
    }
  }, []);

  // Load existing categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const existing = await getConsistingServiceCategories();
        const merged = Array.from(new Set([...DEFAULT_SERVICE_CATEGORIES, ...existing]));
        setAvailableCategories(merged);
      } catch (err) {
        console.error("Error loading service categories", err);
      }
    };
    loadCategories();
  }, []);

  // Load service if editing
  useEffect(() => {
    if (!id) return;

    const loadService = async () => {
      setLoading(true);
      try {
        const service = await getServiceById(id);
        if (service) {
          setTitle(service.title || "");
          setCategory(service.category || DEFAULT_SERVICE_CATEGORIES[0]);
          setCategoryVariant(
            service.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[service.category] || "green"
          );
          setDescription(service.description || "");
          setImageUrl(service.imageUrl || null);

          if (service.keunggulan && service.keunggulan.length > 0) {
            setKeunggulan(service.keunggulan);
          }
          if (service.materialPeralatan && service.materialPeralatan.length > 0) {
            setMaterialPeralatan(service.materialPeralatan);
          }
          if (service.faq && service.faq.length > 0) {
            setFaq(service.faq);
          }

          if (service.category && !availableCategories.includes(service.category)) {
            setAvailableCategories((prev) => Array.from(new Set([...prev, service.category])));
          }
        } else {
          showNotif("Layanan tidak ditemukan.", "error");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Gagal memuat data layanan.";
        showNotif(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  // Keunggulan handlers
  const handleAddKeunggulan = () => {
    setKeunggulan((prev) => [...prev, { title: "", description: "" }]);
  };
  const handleUpdateKeunggulan = (index: number, field: "title" | "description", val: string) => {
    setKeunggulan((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const handleRemoveKeunggulan = (index: number) => {
    setKeunggulan((prev) => prev.filter((_, i) => i !== index));
  };

  // Material & Peralatan handlers (Linked to Katalog Produk)
  const handleAddMaterial = (productId?: string) => {
    if (productId) {
      const found = catalogProducts.find((p) => String(p.id) === String(productId));
      if (found) {
        setMaterialPeralatan((prev) => [
          ...prev,
          {
            productId: String(found.id),
            category: found.category,
            name: found.title,
            imageUrl: found.imageUrl || null,
          },
        ]);
        return;
      }
    }
    setMaterialPeralatan((prev) => [
      ...prev,
      { productId: undefined, category: "", name: "", imageUrl: null },
    ]);
  };

  const handleSelectProductForMaterial = (index: number, selectedId: string) => {
    if (!selectedId || selectedId === "manual") {
      setMaterialPeralatan((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          productId: undefined,
        };
        return next;
      });
      return;
    }

    const found = catalogProducts.find((p) => String(p.id) === String(selectedId));
    if (found) {
      setMaterialPeralatan((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          productId: String(found.id),
          category: found.category,
          name: found.title,
          imageUrl: found.imageUrl || null,
        };
        return next;
      });
    }
  };

  const handleUpdateMaterial = (index: number, field: "category" | "name", val: string) => {
    setMaterialPeralatan((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterialPeralatan((prev) => prev.filter((_, i) => i !== index));
  };

  // FAQ handlers
  const handleAddFaq = () => {
    setFaq((prev) => [...prev, { question: "", answer: "" }]);
  };
  const handleUpdateFaq = (index: number, field: "question" | "answer", val: string) => {
    setFaq((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const handleRemoveFaq = (index: number) => {
    setFaq((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showNotif("Nama / Judul layanan wajib diisi.", "error");
      return;
    }

    if (!category.trim()) {
      showNotif("Kategori layanan wajib dipilih.", "error");
      return;
    }

    // Clean data
    const cleanedKeunggulan = keunggulan.filter((k) => k.title.trim() || k.description.trim());
    const cleanedMaterial = materialPeralatan
      .filter((m) => m.category.trim() || m.name.trim() || m.productId)
      .map((m) => ({
        productId: m.productId ? String(m.productId) : undefined,
        category: m.category.trim(),
        name: m.name.trim(),
        imageUrl: m.imageUrl || null,
      }));
    const cleanedFaq = faq.filter((f) => f.question.trim() || f.answer.trim());

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category: category.trim(),
        categoryVariant: categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[category.trim()] || "green",
        description: description.trim(),
        imageUrl: imageUrl,
        keunggulan: cleanedKeunggulan,
        materialPeralatan: cleanedMaterial,
        faq: cleanedFaq,
      };

      if (id) {
        await editService(id, payload, imageFile, imageRemoved);
        showNotif(`Layanan "${title.trim()}" berhasil diperbarui!`, "success");
      } else {
        await addService(payload, imageFile);
        showNotif(`Layanan "${title.trim()}" berhasil ditambahkan!`, "success");
      }

      // Return to services list page
      setTimeout(() => {
        router.push("/kelola-layanan");
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menyimpan layanan.";
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
        <Sidebar activeId="services" />

        {/* Main Content Card */}
        <div className="flex-1 p-6 md:p-8 bg-white rounded-[32px] border border-white-80 shadow-xs flex flex-col justify-start items-start gap-6 w-full overflow-hidden">
          {/* Back Button */}
          <Button
            type="button"
            onClick={() => router.push("/kelola-layanan")}
            text="Kembali"
            leftIcon="Left 1"
            variant="ghost-green"
            className="cursor-pointer"
          />

          {/* Header Block */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="text-dark/40 text-xs md:text-sm font-normal font-sans tracking-wider uppercase">
              FORMULIR LAYANAN
            </div>
            <h1 className="text-g1 text-2xl md:text-3xl font-bold font-sans">
              {id ? "Edit Layanan" : "Tambah Layanan Baru"}
            </h1>
            <p className="text-dark/70 text-sm font-normal font-sans">
              Lengkapi informasi layanan jasa, keunggulan pengerjaan, material/peralatan yang digunakan, dan FAQ.
            </p>
          </div>

          {/* Divider */}
          <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

          {loading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-g1">
              <div className="w-10 h-10 border-4 border-g1 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-sans text-dark/60">Memuat data layanan...</span>
            </div>
          ) : (
            /* Form Area */
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
              <div className="flex flex-col gap-6">
                {/* 1. INFORMASI UTAMA LAYANAN */}
                <div className="flex flex-col gap-5">
                  <div className="text-dark text-base font-bold font-sans flex items-center gap-2">
                    <div className="size-2 rounded-full bg-g1" />
                    Informasi Utama Layanan
                  </div>

                  {/* Service Image Upload with Large Preview */}
                  <UploadFile
                    label="Foto / Banner Layanan"
                    descriptionPrefix="Ukuran Disarankan"
                    descriptionValue="(800px * 600px)"
                    previewLayout="large"
                    multiple={false}
                    defaultImageUrl={imageUrl || undefined}
                    defaultImageLabel="Foto Layanan Saat Ini"
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

                  {/* Service Title */}
                  <InputBox
                    label={
                      <span>
                        Nama / Judul Layanan <span className="text-red-state">*</span>
                      </span>
                    }
                    placeholder="mis. Pengecatan Marka Jalan"
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
                          Kategori Layanan <span className="text-red-state">*</span>
                        </span>
                      }
                      placeholder="Pilih atau ketik kategori layanan..."
                      options={availableCategories.map((c) => ({ value: c, label: c }))}
                      value={category}
                      onChange={(val) => {
                        setCategory(val);
                        if (SERVICE_CATEGORY_VARIANT_MAP[val]) {
                          setCategoryVariant(SERVICE_CATEGORY_VARIANT_MAP[val]);
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

                  {/* Service Description */}
                  <DescriptionBox
                    label="Deskripsi Lengkap Layanan"
                    placeholder="Tuliskan deskripsi lengkap mengenai ruang lingkup, metode pengerjaan, dan standar layanan..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    containerClassName="max-w-none"
                  />
                </div>

                {/* Section Divider */}
                <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

                {/* 2. KEUNGGULAN LAYANAN */}
                <div className="flex flex-col gap-3 w-full">
                  {/* Header — standalone rounded bar */}
                  <div className="px-4 py-3 bg-g1/10 rounded-2xl flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LordIcon name="Check" size={20} primaryColor="#0A9863" />
                      <span className="text-g1 text-sm md:text-base font-semibold font-sans">Keunggulan Layanan</span>
                      <span className="text-dark/50 text-xs md:text-sm font-normal font-sans hidden sm:inline">(Nilai plus & profesionalitas)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKeunggulan}
                      className="size-9 bg-white hover:bg-g1/10 text-g1 rounded-xl border border-g1/20 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title="Tambah Keunggulan"
                    >
                      <LordIcon name="Add" size={18} primaryColor="#0A9863" />
                    </button>
                  </div>
                  {/* Items — wrapped inside rounded cards */}
                  {keunggulan.length === 0 ? (
                    <p className="text-dark/40 text-sm font-sans pl-1">
                      Klik <span className="text-g1 font-semibold">+</span> untuk menambah poin keunggulan.
                    </p>
                  ) : (
                    keunggulan.map((item, index) => (
                      <div key={index} className="p-4 bg-g1/[0.03] border border-g1/20 rounded-2xl flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full">
                        <InputBox
                          label={`Judul Keunggulan #${index + 1}`}
                          placeholder="cth. Material Bersertifikat TKDN"
                          value={item.title}
                          onChange={(e) => handleUpdateKeunggulan(index, "title", e.target.value)}
                          containerClassName="w-full md:w-64 shrink-0 max-w-none"
                        />
                        <DescriptionBox
                          label={`Penjelasan #${index + 1}`}
                          placeholder="cth. Menggunakan cat coldplastic bersertifikat TKDN..."
                          value={item.description}
                          onChange={(e) => handleUpdateKeunggulan(index, "description", e.target.value)}
                          rows={2}
                          containerClassName="flex-1 max-w-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveKeunggulan(index)}
                          className="size-10 shrink-0 bg-red-state hover:opacity-80 text-white rounded-xl flex justify-center items-center transition-all cursor-pointer shadow-sm mt-7"
                          title="Hapus"
                        >
                          <LordIcon name="Delete" size={18} primaryColor="#ffffff" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Section Divider */}
                <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

                {/* 3. MATERIAL & PERALATAN */}
                <div className="flex flex-col gap-3 w-full">
                  {/* Header — standalone rounded bar */}
                  <div className="px-4 py-3 bg-g1/10 rounded-2xl flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LordIcon name="Setting" size={20} primaryColor="#0A9863" />
                      <span className="text-g1 text-sm md:text-base font-semibold font-sans">Material & Peralatan</span>
                      <span className="text-dark/50 text-xs md:text-sm font-normal font-sans hidden sm:inline">(Tautkan ID Katalog Produk atau manual)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddMaterial()}
                      className="size-9 bg-white hover:bg-g1/10 text-g1 rounded-xl border border-g1/20 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title="Tambah Material"
                    >
                      <LordIcon name="Add" size={18} primaryColor="#0A9863" />
                    </button>
                  </div>

                  {/* Items — wrapped inside rounded cards */}
                  {materialPeralatan.length === 0 ? (
                    <p className="text-dark/40 text-sm font-sans pl-1">
                      Klik <span className="text-g1 font-semibold">+</span> untuk menambah material/peralatan.
                    </p>
                  ) : (
                    materialPeralatan.map((item, index) => {
                      const linkedProduct = item.productId
                        ? catalogProducts.find((p) => String(p.id) === String(item.productId))
                        : undefined;
                      return (
                        <div key={index} className="p-4 bg-g1/[0.03] border border-g1/20 rounded-2xl flex flex-col gap-3 w-full">
                          {/* Badge row + delete */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-g1/50 font-mono">#{index + 1}</span>
                              {item.productId ? (
                                <Badge text={`ID Produk: #${item.productId}`} variant="green" showDot={true} />
                              ) : (
                                <Badge text="Input Manual" variant="gray" showDot={false} />
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(index)}
                              className="size-10 bg-red-state hover:opacity-80 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                              title="Hapus"
                            >
                              <LordIcon name="Delete" size={16} primaryColor="#ffffff" />
                            </button>
                          </div>

                          {/* Catalog Picker */}
                          <Dropdown
                            label={
                              <span className="flex items-center gap-1.5">
                                <span>Ambil dari Katalog Produk</span>
                                <span className="text-xs font-normal text-dark/50">(pilih ID → nama & kategori otomatis terisi)</span>
                              </span>
                            }
                            placeholder="Pilih atau cari produk dari katalog..."
                            options={[
                              {
                                value: "manual",
                                label: (
                                  <div className="flex items-center gap-2 py-1 text-dark/70">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">Manual</span>
                                    <span>Input Manual (Tanpa Tautan Katalog)</span>
                                  </div>
                                ),
                                searchLabel: "Input Manual Kustom Tanpa Tautan Katalog",
                              },
                              ...catalogProducts.map((p) => ({
                                value: String(p.id),
                                label: (
                                  <div className="flex items-center gap-2.5 py-1">
                                    <span className="px-2 py-0.5 rounded-full bg-g1/10 text-g1 text-xs font-bold font-mono shrink-0">
                                      ID: #{p.id}
                                    </span>
                                    <span className="text-dark font-medium truncate">{p.title}</span>
                                    <span className="text-dark/40 text-xs truncate">({p.category})</span>
                                  </div>
                                ),
                                searchLabel: `[ID #${p.id}] ${p.title} ${p.category}`,
                              })),
                            ]}
                            value={item.productId ? String(item.productId) : "manual"}
                            onChange={(val) => handleSelectProductForMaterial(index, val)}
                            multiple={false}
                            containerClassName="w-full max-w-none"
                          />

                          {/* Linked Product Preview */}
                          {linkedProduct && (
                            <div className="flex items-center gap-3 p-2.5 bg-g1/10 rounded-xl border border-g1/20">
                              {linkedProduct.imageUrl ? (
                                <img src={linkedProduct.imageUrl} alt={linkedProduct.title} className="size-10 rounded-lg object-cover border border-g1/20 shrink-0" />
                              ) : (
                                <div className="size-10 rounded-lg bg-g1/15 text-g1 flex items-center justify-center text-xs font-bold shrink-0">#{linkedProduct.id}</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-dark truncate">{linkedProduct.title}</div>
                                <div className="text-xs text-dark/50 truncate">{linkedProduct.category}</div>
                              </div>
                              <span className="text-[11px] text-g1 bg-white px-2 py-0.5 rounded-full border border-g1/20 font-medium shrink-0">
                                Tersinkron ✓
                              </span>
                            </div>
                          )}

                          {/* Category + Name fields */}
                          <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 w-full">
                            <InputBox
                              label="Kategori Material"
                              placeholder="cth. Cat Marka Jalan"
                              value={item.category}
                              onChange={(e) => handleUpdateMaterial(index, "category", e.target.value)}
                              containerClassName="w-full md:w-80 shrink-0 max-w-none"
                            />
                            <InputBox
                              label="Nama Material / Peralatan"
                              placeholder="cth. Cat Coldplastic Merk DPS"
                              value={item.name}
                              onChange={(e) => handleUpdateMaterial(index, "name", e.target.value)}
                              containerClassName="flex-1 max-w-none"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Section Divider */}
                <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

                {/* 4. FAQ */}
                <div className="flex flex-col gap-3 w-full">
                  {/* Header — standalone rounded bar */}
                  <div className="px-4 py-3 bg-g1/10 rounded-2xl flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LordIcon name="Global" size={20} primaryColor="#0A9863" />
                      <span className="text-g1 text-sm md:text-base font-semibold font-sans">FAQ</span>
                      <span className="text-dark/50 text-xs md:text-sm font-normal font-sans hidden sm:inline">(Pertanyaan yang Sering Diajukan)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="size-9 bg-white hover:bg-g1/10 text-g1 rounded-xl border border-g1/20 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title="Tambah FAQ"
                    >
                      <LordIcon name="Add" size={18} primaryColor="#0A9863" />
                    </button>
                  </div>

                  {/* Items — wrapped inside rounded cards */}
                  {faq.length === 0 ? (
                    <p className="text-dark/40 text-sm font-sans pl-1">
                      Klik <span className="text-g1 font-semibold">+</span> untuk menambah FAQ.
                    </p>
                  ) : (
                    faq.map((item, index) => (
                      <div key={index} className="p-4 bg-g1/[0.03] border border-g1/20 rounded-2xl flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full">
                        <InputBox
                          label={`Pertanyaan (Q) #${index + 1}`}
                          placeholder="cth. Berapa lama cat marka jalan kering?"
                          value={item.question}
                          onChange={(e) => handleUpdateFaq(index, "question", e.target.value)}
                          containerClassName="w-full md:w-72 shrink-0 max-w-none"
                        />
                        <DescriptionBox
                          label={`Jawaban (A) #${index + 1}`}
                          placeholder="cth. Tergantung jenis cat; coldplastic umumnya kering dalam waktu singkat..."
                          value={item.answer}
                          onChange={(e) => handleUpdateFaq(index, "answer", e.target.value)}
                          rows={2}
                          containerClassName="flex-1 max-w-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(index)}
                          className="size-10 shrink-0 bg-red-state hover:opacity-80 text-white rounded-xl flex justify-center items-center transition-all cursor-pointer shadow-sm mt-7"
                          title="Hapus"
                        >
                          <LordIcon name="Delete" size={18} primaryColor="#ffffff" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Form Divider */}
              <div className="self-stretch h-px bg-g1/10" aria-hidden="true" />

              {/* Action Buttons */}
              <div className="self-stretch flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-2 w-full">
                <Button
                  type="button"
                  onClick={() => router.push("/kelola-layanan")}
                  text="Batal"
                  variant="ghost-green"
                  className="w-full sm:w-36 cursor-pointer"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  text={submitting ? "Menyimpan..." : id ? "Perbarui Layanan" : "Simpan Layanan"}
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
