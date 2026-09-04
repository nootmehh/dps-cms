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

  // Dynamic Material & Peralatan (Separated Category and Name)
  const [materialPeralatan, setMaterialPeralatan] = useState<ServiceMaterialItem[]>([
    { category: "", name: "" },
  ]);

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

  // Material & Peralatan handlers (Separated Category and Name)
  const handleAddMaterial = () => {
    setMaterialPeralatan((prev) => [...prev, { category: "", name: "" }]);
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
    const cleanedMaterial = materialPeralatan.filter((m) => m.category.trim() || m.name.trim());
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

                {/* 2. KEUNGGULAN LAYANAN (KEUNGGULAN) */}
                <div className="flex flex-col gap-4 w-full">
                  <div className="self-stretch px-4 py-3 bg-g1/10 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 text-g1 flex items-center justify-center">
                        <LordIcon name="Check" size={20} primaryColor="#0A9863" />
                      </div>
                      <div>
                        <span className="text-g1 text-sm md:text-base font-semibold font-sans">
                          Keunggulan Layanan
                        </span>
                        <span className="text-dark/50 text-xs md:text-sm font-normal font-sans">
                          {" "}
                          (Poin-poin nilai plus dan profesionalitas pengerjaan)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddKeunggulan}
                      className="h-9 px-3 bg-white hover:bg-g1/15 text-g1 rounded-full border border-g1/20 flex items-center justify-center gap-1.5 text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs shrink-0"
                      title="Tambah Keunggulan"
                    >
                      <LordIcon name="Add" size={16} primaryColor="#0A9863" />
                      <span>Tambah Keunggulan</span>
                    </button>
                  </div>

                  {keunggulan.length === 0 ? (
                    <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-2">
                      Belum ada poin keunggulan. Klik tombol <span className="text-g1 font-semibold">+ Tambah Keunggulan</span> untuk menambahkan.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      {keunggulan.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full p-4 bg-brand-background/40 rounded-2xl border border-white-80"
                        >
                          <InputBox
                            label={`Judul Keunggulan #${index + 1}`}
                            placeholder="cth. Material Bersertifikat TKDN / Aplikator Berpengalaman"
                            value={item.title}
                            onChange={(e) => handleUpdateKeunggulan(index, "title", e.target.value)}
                            containerClassName="w-full md:w-64 shrink-0 max-w-none"
                          />

                          <DescriptionBox
                            label={`Penjelasan Keunggulan #${index + 1}`}
                            placeholder="cth. Menggunakan cat coldplastic bersertifikat Tingkat Komponen Dalam Negeri (TKDN)..."
                            value={item.description}
                            onChange={(e) => handleUpdateKeunggulan(index, "description", e.target.value)}
                            rows={2}
                            containerClassName="flex-1 max-w-none"
                          />

                          <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveKeunggulan(index)}
                              className="size-11 bg-red-state/10 hover:bg-red-state text-red-state hover:text-white rounded-full flex justify-center items-center transition-all cursor-pointer"
                              title="Hapus Keunggulan"
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

                {/* 3. MATERIAL & PERALATAN YANG DIGUNAKAN (SEPARATED CATEGORY AND MATERIAL) */}
                <div className="flex flex-col gap-4 w-full">
                  <div className="self-stretch px-4 py-3 bg-blue-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 text-blue-600 flex items-center justify-center">
                        <LordIcon name="Setting" size={20} primaryColor="#2563EB" />
                      </div>
                      <div>
                        <span className="text-blue-700 text-sm md:text-base font-semibold font-sans">
                          Material & Peralatan yang Digunakan
                        </span>
                        <span className="text-dark/50 text-xs md:text-sm font-normal font-sans">
                          {" "}
                          (Kategori Material & Nama Material/Item Terpisah)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMaterial}
                      className="h-9 px-3 bg-white hover:bg-blue-50 text-blue-600 rounded-full border border-blue-200 flex items-center justify-center gap-1.5 text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs shrink-0"
                      title="Tambah Material / Peralatan"
                    >
                      <LordIcon name="Add" size={16} primaryColor="#2563EB" />
                      <span>Tambah Material</span>
                    </button>
                  </div>

                  {materialPeralatan.length === 0 ? (
                    <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-2">
                      Belum ada material/peralatan. Klik tombol <span className="text-blue-600 font-semibold">+ Tambah Material</span> untuk menambahkan.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      {materialPeralatan.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full p-4 bg-brand-background/40 rounded-2xl border border-white-80"
                        >
                          <InputBox
                            label={`Kategori Material #${index + 1}`}
                            placeholder="cth. Material Marka Jalan – Cat Marka Jalan / Perlengkapan Jalan"
                            value={item.category}
                            onChange={(e) => handleUpdateMaterial(index, "category", e.target.value)}
                            containerClassName="w-full md:w-72 shrink-0 max-w-none"
                          />

                          <DescriptionBox
                            label={`Nama Material / Peralatan #${index + 1}`}
                            placeholder="cth. Cat Coldplastic Merk DPS / Glass Beads / Traffic Cone"
                            value={item.name}
                            onChange={(e) => handleUpdateMaterial(index, "name", e.target.value)}
                            rows={2}
                            containerClassName="flex-1 max-w-none"
                          />

                          <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(index)}
                              className="size-11 bg-red-state/10 hover:bg-red-state text-red-state hover:text-white rounded-full flex justify-center items-center transition-all cursor-pointer"
                              title="Hapus Material"
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

                {/* 4. FAQ / PERTANYAAN UMUM (FAQ) */}
                <div className="flex flex-col gap-4 w-full">
                  <div className="self-stretch px-4 py-3 bg-purple-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 text-purple-600 flex items-center justify-center">
                        <LordIcon name="Global" size={20} primaryColor="#9333EA" />
                      </div>
                      <div>
                        <span className="text-purple-700 text-sm md:text-base font-semibold font-sans">
                          FAQ (Pertanyaan yang Sering Diajukan)
                        </span>
                        <span className="text-dark/50 text-xs md:text-sm font-normal font-sans">
                          {" "}
                          (Tanya Jawab seputar layanan)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="h-9 px-3 bg-white hover:bg-purple-50 text-purple-600 rounded-full border border-purple-200 flex items-center justify-center gap-1.5 text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs shrink-0"
                      title="Tambah FAQ"
                    >
                      <LordIcon name="Add" size={16} primaryColor="#9333EA" />
                      <span>Tambah FAQ</span>
                    </button>
                  </div>

                  {faq.length === 0 ? (
                    <div className="text-dark/40 text-sm font-normal font-sans pl-2 py-2">
                      Belum ada FAQ. Klik tombol <span className="text-purple-600 font-semibold">+ Tambah FAQ</span> untuk menambahkan.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      {faq.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row items-stretch md:items-start gap-3 w-full p-4 bg-brand-background/40 rounded-2xl border border-white-80"
                        >
                          <InputBox
                            label={`Pertanyaan (Tanya / Q) #${index + 1}`}
                            placeholder="cth. Berapa lama cat marka jalan kering setelah diaplikasikan?"
                            value={item.question}
                            onChange={(e) => handleUpdateFaq(index, "question", e.target.value)}
                            containerClassName="w-full md:w-72 shrink-0 max-w-none"
                          />

                          <DescriptionBox
                            label={`Jawaban (Jawab / A) #${index + 1}`}
                            placeholder="cth. Tergantung jenis cat yang digunakan; cat coldplastic umumnya kering dalam waktu singkat..."
                            value={item.answer}
                            onChange={(e) => handleUpdateFaq(index, "answer", e.target.value)}
                            rows={2}
                            containerClassName="flex-1 max-w-none"
                          />

                          <div className="h-11 md:mt-7 flex items-center shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveFaq(index)}
                              className="size-11 bg-red-state/10 hover:bg-red-state text-red-state hover:text-white rounded-full flex justify-center items-center transition-all cursor-pointer"
                              title="Hapus FAQ"
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
