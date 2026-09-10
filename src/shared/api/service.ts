import {
  addService as addSupabaseService,
  editService as editSupabaseService,
  deleteService as deleteSupabaseService,
  getServices as getSupabaseServices,
  getServiceById as getSupabaseServiceById,
  isValidUuid,
} from "@/services/serviceApi";
import { getProducts as getSupabaseProducts } from "@/services/productApi";

export interface ServiceKeunggulanItem {
  title: string;
  description: string;
}

export interface ServiceMaterialItem {
  productId?: string | number;
  category: string;
  name: string;
  imageUrl?: string | null;
}

export interface ServiceFAQItem {
  question: string;
  answer: string;
}

export interface ServicePayload {
  id?: string | number;
  title: string;
  category: string;
  categoryVariant?: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  description?: string;
  keunggulan: ServiceKeunggulanItem[];
  materialPeralatan: ServiceMaterialItem[];
  faq: ServiceFAQItem[];
  createdAt?: string;
}

const STORAGE_KEY = "dps_services_data";

export const DEFAULT_SERVICE_CATEGORIES = [
  "Jasa Marka Jalan",
  "Jasa Perlengkapan Jalan",
  "Jasa Elektrikal Jalan",
  "Jasa Perlengkapan Area Parkir",
];

export const SERVICE_CATEGORY_VARIANT_MAP: Record<string, string> = {
  "Jasa Marka Jalan": "green",
  "Jasa Perlengkapan Jalan": "blue",
  "Jasa Elektrikal Jalan": "yellow",
  "Jasa Perlengkapan Area Parkir": "purple",
  // Backwards compatibility for older categories
  "Marka Jalan": "green",
  "Perlengkapan Jalan": "blue",
  "Elektrikal Jalan": "yellow",
  "Perlengkapan Parkir": "purple",
};

export const INITIAL_SERVICES_DATA: ServicePayload[] = [];

function normalizeServiceItem(item: ServicePayload): ServicePayload {
  return {
    ...item,
    id: String(item.id),
    categoryVariant: item.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[item.category] || "green",
    keunggulan: item.keunggulan || [],
    materialPeralatan: item.materialPeralatan || [],
    faq: item.faq || [],
  };
}

export function getStoredServices(): ServicePayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeServiceItem);
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredServices(services: ServicePayload[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    } catch (e) {
      console.error("Failed to save services to localStorage", e);
    }
  }
}

export async function getConsistingServiceCategories(): Promise<string[]> {
  const cats = new Set<string>();
  try {
    const supabaseServices = await getSupabaseServices();
    if (supabaseServices && supabaseServices.length > 0) {
      supabaseServices.forEach((s) => {
        if (s.category) cats.add(s.category);
      });
      return Array.from(cats);
    }
  } catch {
    // ignore
  }
  const services = getStoredServices();
  services.forEach((s) => {
    if (s.category) cats.add(s.category);
  });
  return Array.from(cats);
}

export async function getServiceById(id: string | number): Promise<ServicePayload | null> {
  const strId = String(id);
  if (isValidUuid(strId)) {
    try {
      const supabaseRow = await getSupabaseServiceById(strId);
      if (supabaseRow) {
        // 1. Normalize keunggulan (Supabase uses 'value' for description)
        let rawKeunggulan: any[] = [];
        if (Array.isArray(supabaseRow.keunggulan)) {
          rawKeunggulan = supabaseRow.keunggulan;
        } else if (typeof supabaseRow.keunggulan === "string") {
          try {
            rawKeunggulan = JSON.parse(supabaseRow.keunggulan);
          } catch {
            rawKeunggulan = [];
          }
        }
        const mappedKeunggulan: ServiceKeunggulanItem[] = rawKeunggulan.map((k: any) => ({
          title: k?.title || "",
          description: k?.description || k?.value || "",
        }));

        // 2. Normalize faq
        let rawFaq: any[] = [];
        if (Array.isArray(supabaseRow.faq)) {
          rawFaq = supabaseRow.faq;
        } else if (typeof supabaseRow.faq === "string") {
          try {
            rawFaq = JSON.parse(supabaseRow.faq);
          } catch {
            rawFaq = [];
          }
        }
        const mappedFaq: ServiceFAQItem[] = rawFaq.map((f: any) => ({
          question: f?.question || "",
          answer: f?.answer || "",
        }));

        // 3. Normalize product_id
        let rawProductIds: string[] = [];
        if (Array.isArray(supabaseRow.product_id)) {
          rawProductIds = supabaseRow.product_id;
        } else if (typeof supabaseRow.product_id === "string") {
          try {
            const parsed = JSON.parse(supabaseRow.product_id);
            if (Array.isArray(parsed)) rawProductIds = parsed;
          } catch {
            rawProductIds = (supabaseRow.product_id as string)
              .replace(/[{}]/g, "")
              .split(",")
              .map((s) => s.trim().replace(/^"|"$/g, ""))
              .filter(Boolean);
          }
        }

        let materialItems: ServiceMaterialItem[] = [];
        if (rawProductIds.length > 0) {
          try {
            const allProds = await getSupabaseProducts();
            materialItems = rawProductIds.map((pid) => {
              const foundProd = allProds.find((p) => String(p.id) === String(pid));
              return {
                productId: pid,
                category: foundProd?.category || "Perlengkapan Jalan",
                name: foundProd?.title || `Produk #${pid.slice(0, 8)}`,
                imageUrl: foundProd?.product_image_url?.[0] || foundProd?.highlight_img_url || null,
              };
            });
          } catch {
            materialItems = rawProductIds.map((pid) => ({
              productId: pid,
              category: "Produk Katalog",
              name: `Produk #${pid.slice(0, 8)}`,
              imageUrl: null,
            }));
          }
        }

        // 4. Normalize service_image_url
        let finalImageUrl: string | null = null;
        let finalImageUrls: string[] = [];
        const rawImg = supabaseRow.service_image_url as any;
        if (Array.isArray(rawImg) && rawImg.length > 0) {
          finalImageUrls = rawImg;
          finalImageUrl = rawImg[0];
        } else if (typeof rawImg === "string" && rawImg.trim()) {
          try {
            const parsed = JSON.parse(rawImg);
            finalImageUrls = Array.isArray(parsed) ? parsed : [rawImg];
            finalImageUrl = finalImageUrls[0] || null;
          } catch {
            finalImageUrl = rawImg;
            finalImageUrls = [rawImg];
          }
        }

        return {
          id: supabaseRow.id,
          title: supabaseRow.title,
          category: supabaseRow.category || "Umum",
          categoryVariant: supabaseRow.category_color?.toLowerCase() || SERVICE_CATEGORY_VARIANT_MAP[supabaseRow.category || ""] || "green",
          imageUrl: finalImageUrl,
          imageUrls: finalImageUrls,
          description: supabaseRow.description || "",
          keunggulan: mappedKeunggulan,
          materialPeralatan: materialItems,
          faq: mappedFaq,
          createdAt: supabaseRow.created_at,
        };
      }
    } catch (e) {
      console.warn("Supabase fetch service by id failed:", e);
    }
  }

  const services = getStoredServices();
  const found = services.find((s) => String(s.id) === strId);
  return found || null;
}

import { uploadFileToServer, deleteFileFromServer, isManualUploadUrl } from "@/shared/api/upload";

export async function addService(
  data: Omit<ServicePayload, "id" | "createdAt">,
  imageFile?: File | File[] | null
): Promise<ServicePayload> {
  const services = getStoredServices();
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const finalImageUrls: string[] = Array.isArray((data as any).imageUrls)
    ? [...(data as any).imageUrls]
    : data.imageUrl
    ? [data.imageUrl]
    : [];

  if (imageFile) {
    const filesToUpload = Array.isArray(imageFile) ? imageFile : [imageFile];
    for (const f of filesToUpload) {
      if (f) {
        try {
          const url = await uploadFileToServer(f, "services");
          finalImageUrls.push(url);
        } catch (err) {
          console.warn("Upload service image failed, falling back to blob:", err);
          finalImageUrls.push(URL.createObjectURL(f));
        }
      }
    }
  }

  // Extract product IDs from materialPeralatan
  const productIds = (data.materialPeralatan || [])
    .map((m) => (m.productId ? String(m.productId) : null))
    .filter((id): id is string => Boolean(id));

  // Sync to Supabase
  try {
    const formattedKeunggulan = (data.keunggulan || []).map((k: any) => ({
      title: k.title || "",
      value: k.value || k.description || "",
    }));

    const supabaseRow = await addSupabaseService({
      title: data.title,
      category: data.category,
      category_color: data.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[data.category] || "green",
      description: data.description || null,
      keunggulan: formattedKeunggulan as any,
      faq: data.faq,
      product_id: productIds.length > 0 ? productIds : null,
      service_image_url: finalImageUrls.length > 0 ? finalImageUrls : null,
    });
    const newService: ServicePayload = {
      ...data,
      id: supabaseRow?.id || String(Date.now()),
      imageUrl: finalImageUrls[0] || "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
      imageUrls: finalImageUrls,
      createdAt: formattedDate,
      categoryVariant: data.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[data.category] || "green",
    };
    const updated = [newService, ...services];
    saveStoredServices(updated);
    return newService;
  } catch (err: any) {
    const errorDetails = err?.message || err?.details || err?.hint || (typeof err === "string" ? err : JSON.stringify(err));
    console.error("Supabase addService failed:", errorDetails);
    throw new Error(errorDetails);
  }
}

export async function editService(
  id: string | number,
  data: Partial<ServicePayload>,
  imageFile?: File | File[] | null,
  imageRemoved?: boolean,
  removedImageUrls?: string[]
): Promise<ServicePayload> {
  const services = getStoredServices();
  const existingService = services.find((s) => String(s.id) === String(id));
  let updatedService: ServicePayload | null = null;

  const uploadedUrls: string[] = [];
  if (imageFile) {
    const filesToUpload = Array.isArray(imageFile) ? imageFile : [imageFile];
    for (const f of filesToUpload) {
      if (f) {
        try {
          const url = await uploadFileToServer(f, "services");
          uploadedUrls.push(url);
        } catch (err) {
          console.warn("Upload service image failed, falling back to blob:", err);
          uploadedUrls.push(URL.createObjectURL(f));
        }
      }
    }
  }

  let computedFinalBannerUrls: string[] = [];

  const updatedServices = services.map((service) => {
    if (String(service.id) === String(id)) {
      let finalImageUrls: string[] = [];
      if (!imageRemoved) {
        if (Array.isArray(data.imageUrls)) {
          finalImageUrls = [...data.imageUrls];
        } else if (service.imageUrls && service.imageUrls.length > 0) {
          finalImageUrls = [...service.imageUrls];
        } else if (service.imageUrl) {
          finalImageUrls = [service.imageUrl];
        }
      }
      finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      computedFinalBannerUrls = finalImageUrls;

      const finalImageUrl = finalImageUrls[0] || null;
      const nextCategory = data.category !== undefined ? data.category : service.category;

      updatedService = {
        ...service,
        ...data,
        imageUrl: finalImageUrl,
        imageUrls: finalImageUrls,
        categoryVariant:
          data.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[nextCategory] || service.categoryVariant || "green",
      };
      return updatedService;
    }
    return service;
  });

  if (!updatedService) {
    let finalImageUrls: string[] = [];
    if (!imageRemoved) {
      if (Array.isArray(data.imageUrls)) {
        finalImageUrls = [...data.imageUrls];
      } else if (data.imageUrl) {
        finalImageUrls = [data.imageUrl];
      }
    }
    finalImageUrls = [...finalImageUrls, ...uploadedUrls];
    computedFinalBannerUrls = finalImageUrls;

    const nextCategory = data.category || "Umum";
    updatedService = {
      id: String(id),
      title: data.title || "",
      category: nextCategory,
      categoryVariant:
        data.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[nextCategory] || "green",
      imageUrl: finalImageUrls[0] || null,
      imageUrls: finalImageUrls,
      description: data.description || "",
      keunggulan: data.keunggulan || [],
      materialPeralatan: data.materialPeralatan || [],
      faq: data.faq || [],
      createdAt: new Date().toISOString(),
      ...data,
    };
    updatedServices.unshift(updatedService);
  }

  // Delete obsolete manual upload images from server disk
  const previousBannerUrls = [
    ...(existingService?.imageUrls || []),
    ...(existingService?.imageUrl ? [existingService.imageUrl] : []),
    ...(removedImageUrls || []),
  ];
  const obsoleteBannerUrls = Array.from(new Set(previousBannerUrls)).filter(
    (url) => url && !computedFinalBannerUrls.includes(url)
  );

  for (const obsoleteUrl of obsoleteBannerUrls) {
    if (isManualUploadUrl(obsoleteUrl)) {
      deleteFileFromServer(obsoleteUrl).catch((err) =>
        console.warn(`Failed to delete obsolete service banner: ${obsoleteUrl}`, err)
      );
    }
  }

  const targetService: ServicePayload = updatedService;
  saveStoredServices(updatedServices);

  // Sync to Supabase
  try {
    const materialList: ServiceMaterialItem[] = data.materialPeralatan || targetService.materialPeralatan || [];
    const productIds = materialList
      .map((m: ServiceMaterialItem) => (m.productId ? String(m.productId) : null))
      .filter((pid: string | null): pid is string => Boolean(pid));

    const rawKeunggulan = data.keunggulan !== undefined ? data.keunggulan : targetService.keunggulan;
    const formattedKeunggulan = (rawKeunggulan || []).map((k: any) => ({
      title: k.title || "",
      value: k.value || k.description || "",
    }));

    const finalSyncUrls = targetService.imageUrls && targetService.imageUrls.length > 0
      ? targetService.imageUrls
      : targetService.imageUrl
      ? [targetService.imageUrl]
      : null;

    await editSupabaseService(String(id), {
      title: data.title,
      category: data.category,
      category_color: targetService.categoryVariant,
      description: data.description !== undefined ? data.description : targetService.description,
      keunggulan: formattedKeunggulan as any,
      faq: data.faq || targetService.faq,
      product_id: productIds.length > 0 ? productIds : null,
      service_image_url: finalSyncUrls,
    });
  } catch (err: any) {
    const errorDetails = err?.message || err?.details || err?.hint || (typeof err === "string" ? err : JSON.stringify(err));
    console.error(`Supabase editService failed for ID ${id}:`, errorDetails);
    throw new Error(`Supabase Error: ${errorDetails}`);
  }

  return targetService;
}

export async function deleteService(id: string | number): Promise<void> {
  const strId = String(id);
  const services = getStoredServices();
  const target = services.find((s) => String(s.id) === strId);

  if (target) {
    const allUrls = [
      ...(target.imageUrls || []),
      ...(target.imageUrl ? [target.imageUrl] : []),
    ];
    for (const url of Array.from(new Set(allUrls))) {
      if (isManualUploadUrl(url)) {
        deleteFileFromServer(url).catch((err) =>
          console.warn(`Failed to delete manual image on service deletion: ${url}`, err)
        );
      }
    }
  }

  await deleteSupabaseService(strId);
  const nextServices = services.filter((s) => String(s.id) !== strId);
  saveStoredServices(nextServices);
}
