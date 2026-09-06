import {
  addProduct as addSupabaseProduct,
  editProduct as editSupabaseProduct,
  deleteProduct as deleteSupabaseProduct,
  getProducts as getSupabaseProducts,
  getProductById as getSupabaseProductById,
  isValidUuid,
} from "@/services/productApi";

export interface ProductDetailItem {
  title: string;
  value: string;
}

export interface ProductFeatureItem {
  title: string;
  value: string;
}

export interface ProductPayload {
  id?: string | number;
  title: string;
  category: string;
  categoryVariant?: string;
  imageUrl?: string | null;
  description: string;
  detailProduct: ProductDetailItem[];
  suitableFor: string[];
  kelebihan: ProductFeatureItem[];
  kekurangan: ProductFeatureItem[];
  createdAt?: string;
}

const STORAGE_KEY = "dps_products_data";

export const DEFAULT_PRODUCT_CATEGORIES = [
  "Material Marka Jalan – Bahan Campuran Cat",
  "Perlengkapan Keselamatan Jalan – Rambu Petunjuk Arah",
  "Perlengkapan Keselamatan Jalan – Alat Bantu Pandang Pengemudi",
  "Perlengkapan Pengaturan Lalu Lintas Sementara",
  "Material Marka Jalan – Reflektor Jalan",
  "Perlengkapan Pengendali Kecepatan Kendaraan",
  "Perlengkapan Jalan – Signage/Papan Informasi",
  "Perlengkapan Pengaturan Lalu Lintas Sementara/Fleksibel",
  "Perlengkapan Pembatas Jalan/Pengaman Area Kerja",
  "Perlengkapan Pengaman Jalan – Pagar Pengaman",
  "Material Marka Jalan – Cat Marka Jalan (Solvent Based)",
  "Perlengkapan Elektrikal Jalan – Pencahayaan",
  "Material Perawatan & Perbaikan Jalan",
  "Perlengkapan Area Parkir",
];

export const CATEGORY_VARIANT_MAP: Record<string, string> = {
  "Material Marka Jalan – Bahan Campuran Cat": "green",
  "Perlengkapan Keselamatan Jalan – Rambu Petunjuk Arah": "blue",
  "Perlengkapan Keselamatan Jalan – Alat Bantu Pandang Pengemudi": "yellow",
  "Perlengkapan Pengaturan Lalu Lintas Sementara": "orange",
  "Material Marka Jalan – Reflektor Jalan": "green",
  "Perlengkapan Pengendali Kecepatan Kendaraan": "purple",
  "Perlengkapan Jalan – Signage/Papan Informasi": "blue",
  "Perlengkapan Pengaturan Lalu Lintas Sementara/Fleksibel": "orange",
  "Perlengkapan Pembatas Jalan/Pengaman Area Kerja": "red",
  "Perlengkapan Pengaman Jalan – Pagar Pengaman": "purple",
  "Material Marka Jalan – Cat Marka Jalan (Solvent Based)": "green",
  "Perlengkapan Elektrikal Jalan – Pencahayaan": "yellow",
  "Material Perawatan & Perbaikan Jalan": "blue",
  "Perlengkapan Area Parkir": "purple",
};

export const INITIAL_PRODUCTS_DATA: ProductPayload[] = [];

export function getStoredProducts(): ProductPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredProducts(products: ProductPayload[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to localStorage", e);
    }
  }
}

export async function getConsistingProductCategories(): Promise<string[]> {
  const cats = new Set<string>();
  try {
    const supabaseProducts = await getSupabaseProducts();
    supabaseProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
  } catch {
    // ignore
  }
  const products = getStoredProducts();
  products.forEach((p) => {
    if (p.category) cats.add(p.category);
  });
  return Array.from(cats);
}

export async function getProductById(id: string | number): Promise<ProductPayload | null> {
  const strId = String(id);
  if (isValidUuid(strId)) {
    try {
      const row = await getSupabaseProductById(strId);
      if (row) {
        return {
          id: row.id,
          title: row.title,
          category: row.category || "Umum",
          categoryVariant: CATEGORY_VARIANT_MAP[row.category || ""] || "green",
          imageUrl: row.product_image_url?.[0] || row.highlight_img_url || null,
          description: row.description || "",
          detailProduct: row.detail_product || [],
          suitableFor: row.suitable_for || [],
          kelebihan: row.kelebihan || [],
          kekurangan: row.kekurangan || [],
          createdAt: row.created_at,
        };
      }
    } catch (e) {
      console.warn("Supabase fetch product by id failed:", e);
    }
  }

  const products = getStoredProducts();
  const found = products.find((p) => String(p.id) === strId);
  return found || null;
}

export async function addProduct(
  data: Omit<ProductPayload, "id" | "createdAt">,
  imageFile?: File | null
): Promise<ProductPayload> {
  const products = getStoredProducts();
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let imageUrl = data.imageUrl || null;
  if (imageFile) {
    imageUrl = URL.createObjectURL(imageFile);
  }

  // Sync to Supabase
  try {
    const supabaseRow = await addSupabaseProduct({
      title: data.title,
      category: data.category,
      description: data.description,
      detail_product: data.detailProduct,
      suitable_for: data.suitableFor,
      kelebihan: data.kelebihan,
      kekurangan: data.kekurangan,
      product_image_url: imageUrl ? [imageUrl] : null,
      highlight_img_url: imageUrl || null,
    });

    const newProduct: ProductPayload = {
      ...data,
      id: supabaseRow?.id || String(Date.now()),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
      createdAt: formattedDate,
      categoryVariant: data.categoryVariant || CATEGORY_VARIANT_MAP[data.category] || "green",
    };
    const updated = [newProduct, ...products];
    saveStoredProducts(updated);
    return newProduct;
  } catch (err: any) {
    const errorDetails = err?.message || err?.details || err?.hint || (typeof err === "string" ? err : JSON.stringify(err));
    console.error("Supabase addProduct failed:", errorDetails);
    throw new Error(errorDetails);
  }
}

export async function editProduct(
  id: string | number,
  data: Partial<ProductPayload>,
  imageFile?: File | null,
  imageRemoved?: boolean
): Promise<ProductPayload> {
  const products = getStoredProducts();
  let updatedProduct: ProductPayload | null = null;

  const updated = products.map((product) => {
    if (String(product.id) === String(id)) {
      let finalImageUrl = product.imageUrl;
      if (imageRemoved) {
        finalImageUrl = null;
      }
      if (imageFile) {
        finalImageUrl = URL.createObjectURL(imageFile);
      } else if (data.imageUrl !== undefined) {
        finalImageUrl = data.imageUrl;
      }

      const nextCategory = data.category !== undefined ? data.category : product.category;

      updatedProduct = {
        ...product,
        ...data,
        imageUrl: finalImageUrl,
        categoryVariant:
          data.categoryVariant || CATEGORY_VARIANT_MAP[nextCategory] || product.categoryVariant || "green",
      };
      return updatedProduct;
    }
    return product;
  });

  if (!updatedProduct) {
    throw new Error(`Product with id ${id} not found.`);
  }

  const targetProduct: ProductPayload = updatedProduct;
  saveStoredProducts(updated);

  // Sync to Supabase
  try {
    await editSupabaseProduct(String(id), {
      title: data.title,
      category: data.category,
      description: data.description,
      detail_product: data.detailProduct,
      suitable_for: data.suitableFor,
      kelebihan: data.kelebihan,
      kekurangan: data.kekurangan,
      product_image_url: targetProduct.imageUrl ? [targetProduct.imageUrl] : null,
      highlight_img_url: targetProduct.imageUrl || null,
    });
  } catch (err: any) {
    const errorDetails = err?.message || err?.details || err?.hint || (typeof err === "string" ? err : JSON.stringify(err));
    console.error(`Supabase editProduct failed for ID ${id}:`, errorDetails);
    throw new Error(`Supabase Error: ${errorDetails}`);
  }

  return targetProduct;
}

export async function deleteProduct(id: string | number): Promise<void> {
  const strId = String(id);
  await deleteSupabaseProduct(strId);

  const products = getStoredProducts();
  const nextProducts = products.filter((p) => String(p.id) !== strId);
  saveStoredProducts(nextProducts);
}
