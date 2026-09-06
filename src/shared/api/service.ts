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
    supabaseServices.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
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
        let materialItems: ServiceMaterialItem[] = [];
        if (supabaseRow.product_id && supabaseRow.product_id.length > 0) {
          try {
            const allProds = await getSupabaseProducts();
            materialItems = supabaseRow.product_id.map((pid) => {
              const foundProd = allProds.find((p) => String(p.id) === String(pid));
              return {
                productId: pid,
                category: foundProd?.category || "Produk Katalog",
                name: foundProd?.title || `Produk #${pid.slice(0, 8)}`,
                imageUrl: foundProd?.product_image_url?.[0] || foundProd?.highlight_img_url || null,
              };
            });
          } catch {
            materialItems = supabaseRow.product_id.map((pid) => ({
              productId: pid,
              category: "Produk Katalog",
              name: `Produk #${pid.slice(0, 8)}`,
              imageUrl: null,
            }));
          }
        }

        return {
          id: supabaseRow.id,
          title: supabaseRow.title,
          category: supabaseRow.category || "Umum",
          categoryVariant: SERVICE_CATEGORY_VARIANT_MAP[supabaseRow.category || ""] || "green",
          imageUrl: supabaseRow.service_image_url?.[0] || null,
          keunggulan: supabaseRow.keunggulan || [],
          materialPeralatan: materialItems,
          faq: supabaseRow.faq || [],
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

export async function addService(
  data: Omit<ServicePayload, "id" | "createdAt">,
  imageFile?: File | null
): Promise<ServicePayload> {
  const services = getStoredServices();
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let imageUrl = data.imageUrl || null;
  if (imageFile) {
    imageUrl = URL.createObjectURL(imageFile);
  }

  // Extract product IDs from materialPeralatan
  const productIds = (data.materialPeralatan || [])
    .map((m) => (m.productId ? String(m.productId) : null))
    .filter((id): id is string => Boolean(id));

  // Sync to Supabase
  try {
    const supabaseRow = await addSupabaseService({
      title: data.title,
      category: data.category,
      keunggulan: data.keunggulan,
      faq: data.faq,
      product_id: productIds.length > 0 ? productIds : null,
      service_image_url: imageUrl ? [imageUrl] : null,
    });
    const newService: ServicePayload = {
      ...data,
      id: supabaseRow?.id || String(Date.now()),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
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
  imageFile?: File | null,
  imageRemoved?: boolean
): Promise<ServicePayload> {
  const services = getStoredServices();
  let updatedService: ServicePayload | null = null;

  const updated = services.map((service) => {
    if (String(service.id) === String(id)) {
      let finalImageUrl = service.imageUrl;
      if (imageRemoved) {
        finalImageUrl = null;
      }
      if (imageFile) {
        finalImageUrl = URL.createObjectURL(imageFile);
      } else if (data.imageUrl !== undefined) {
        finalImageUrl = data.imageUrl;
      }

      const nextCategory = data.category !== undefined ? data.category : service.category;

      updatedService = {
        ...service,
        ...data,
        imageUrl: finalImageUrl,
        categoryVariant:
          data.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[nextCategory] || service.categoryVariant || "green",
      };
      return updatedService;
    }
    return service;
  });

  if (!updatedService) {
    throw new Error(`Service with id ${id} not found.`);
  }

  const targetService: ServicePayload = updatedService;
  saveStoredServices(updated);

  // Sync to Supabase
  try {
    const materialList: ServiceMaterialItem[] = data.materialPeralatan || targetService.materialPeralatan || [];
    const productIds = materialList
      .map((m: ServiceMaterialItem) => (m.productId ? String(m.productId) : null))
      .filter((pid: string | null): pid is string => Boolean(pid));

    await editSupabaseService(String(id), {
      title: data.title,
      category: data.category,
      keunggulan: data.keunggulan,
      faq: data.faq,
      product_id: productIds.length > 0 ? productIds : null,
      service_image_url: targetService.imageUrl ? [targetService.imageUrl] : null,
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
  await deleteSupabaseService(strId);

  const services = getStoredServices();
  const nextServices = services.filter((s) => String(s.id) !== strId);
  saveStoredServices(nextServices);
}
