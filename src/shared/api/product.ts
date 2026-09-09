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

export interface ProductSuitableItem {
  title: string;
  value: string;
}

export interface ProductPayload {
  id?: string | number;
  title: string;
  category: string;
  categoryVariant?: string;
  imageUrl?: string | null;
  highlightImgUrl?: string | null;
  description: string;
  detailProduct: ProductDetailItem[];
  suitableFor: ProductSuitableItem[];
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
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed reading stored products", e);
    return [];
  }
}

export function saveStoredProducts(products: ProductPayload[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error("Failed saving stored products", e);
  }
}

export async function getConsistingProductCategories(): Promise<string[]> {
  const cats = new Set<string>();
  try {
    const supabaseProducts = await getSupabaseProducts();
    if (supabaseProducts && supabaseProducts.length > 0) {
      supabaseProducts.forEach((p) => {
        if (p.category) cats.add(p.category);
      });
      return Array.from(cats);
    }
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
          categoryVariant: row.category_color?.toLowerCase() || CATEGORY_VARIANT_MAP[row.category || ""] || "green",
          imageUrl: row.product_image_url?.[0] || row.highlight_img_url || null,
          highlightImgUrl: row.highlight_img_url || null,
          description: row.description || "",
          detailProduct: row.detail_product || [],
          suitableFor: Array.isArray(row.suitable_for)
            ? row.suitable_for.map((item: any) =>
                typeof item === "string"
                  ? { title: item, value: "" }
                  : { title: item.title || "", value: item.value || item.description || "" }
              )
            : [],
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

import { uploadFileToServer } from "@/shared/api/upload";

export async function addProduct(
  data: Omit<ProductPayload, "id" | "createdAt">,
  imageFile?: File | null,
  highlightImageFile?: File | null
): Promise<ProductPayload> {
  const products = getStoredProducts();
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let imageUrl = data.imageUrl || null;
  if (imageFile) {
    try {
      imageUrl = await uploadFileToServer(imageFile, "products");
    } catch (err) {
      console.warn("Upload product image failed, falling back to blob:", err);
      imageUrl = URL.createObjectURL(imageFile);
    }
  }

  let highlightImgUrl = data.highlightImgUrl || null;
  if (highlightImageFile) {
    try {
      highlightImgUrl = await uploadFileToServer(highlightImageFile, "products");
    } catch (err) {
      console.warn("Upload highlight image failed, falling back to blob:", err);
      highlightImgUrl = URL.createObjectURL(highlightImageFile);
    }
  }

  // Sync to Supabase
  try {
    const supabaseRow = await addSupabaseProduct({
      title: data.title,
      category: data.category,
      category_color: data.categoryVariant || CATEGORY_VARIANT_MAP[data.category] || "green",
      description: data.description,
      detail_product: data.detailProduct,
      suitable_for: data.suitableFor,
      kelebihan: data.kelebihan,
      kekurangan: data.kekurangan,
      product_image_url: imageUrl ? [imageUrl] : null,
      highlight_img_url: highlightImgUrl || null,
    });

    const newProduct: ProductPayload = {
      ...data,
      id: supabaseRow?.id || String(Date.now()),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
      highlightImgUrl: highlightImgUrl || null,
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
  imageRemoved?: boolean,
  highlightImageFile?: File | null,
  highlightImageRemoved?: boolean
): Promise<ProductPayload> {
  const products = getStoredProducts();
  let updatedProduct: ProductPayload | null = null;

  let uploadedImageUrl: string | null = null;
  if (imageFile) {
    try {
      uploadedImageUrl = await uploadFileToServer(imageFile, "products");
    } catch (err) {
      console.warn("Upload product image failed, falling back to blob:", err);
      uploadedImageUrl = URL.createObjectURL(imageFile);
    }
  }

  let uploadedHighlightUrl: string | null = null;
  if (highlightImageFile) {
    try {
      uploadedHighlightUrl = await uploadFileToServer(highlightImageFile, "products");
    } catch (err) {
      console.warn("Upload highlight image failed, falling back to blob:", err);
      uploadedHighlightUrl = URL.createObjectURL(highlightImageFile);
    }
  }

  const updated = products.map((product) => {
    if (String(product.id) === String(id)) {
      let finalImageUrl = product.imageUrl;
      if (imageRemoved) {
        finalImageUrl = null;
      }
      if (imageFile && uploadedImageUrl) {
        finalImageUrl = uploadedImageUrl;
      } else if (data.imageUrl !== undefined) {
        finalImageUrl = data.imageUrl;
      }

      let finalHighlightImgUrl = product.highlightImgUrl;
      if (highlightImageRemoved) {
        finalHighlightImgUrl = null;
      }
      if (highlightImageFile && uploadedHighlightUrl) {
        finalHighlightImgUrl = uploadedHighlightUrl;
      } else if (data.highlightImgUrl !== undefined) {
        finalHighlightImgUrl = data.highlightImgUrl;
      }

      const nextCategory = data.category !== undefined ? data.category : product.category;

      updatedProduct = {
        ...product,
        ...data,
        imageUrl: finalImageUrl,
        highlightImgUrl: finalHighlightImgUrl,
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
      category_color: targetProduct.categoryVariant,
      description: data.description,
      detail_product: data.detailProduct,
      suitable_for: data.suitableFor,
      kelebihan: data.kelebihan,
      kekurangan: data.kekurangan,
      product_image_url: targetProduct.imageUrl ? [targetProduct.imageUrl] : null,
      highlight_img_url: targetProduct.highlightImgUrl || null,
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
