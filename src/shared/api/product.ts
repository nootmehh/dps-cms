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
  imageUrls?: string[];
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
  DEFAULT_PRODUCT_CATEGORIES.forEach((c) => cats.add(c));
  try {
    const supabaseProducts = await getSupabaseProducts();
    supabaseProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
  } catch (e) {
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
        let finalImageUrls: string[] = [];
        const rawImg = row.product_image_url as any;
        if (Array.isArray(rawImg) && rawImg.length > 0) {
          finalImageUrls = rawImg;
        } else if (typeof rawImg === "string" && rawImg.trim()) {
          try {
            const parsed = JSON.parse(rawImg);
            finalImageUrls = Array.isArray(parsed) ? parsed : [rawImg];
          } catch {
            finalImageUrls = [rawImg];
          }
        }

        return {
          id: row.id,
          title: row.title,
          category: row.category || "Umum",
          categoryVariant: row.category_color?.toLowerCase() || CATEGORY_VARIANT_MAP[row.category || ""] || "green",
          imageUrl: finalImageUrls[0] || row.highlight_img_url || null,
          imageUrls: finalImageUrls,
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

import { uploadFileToServer, deleteFileFromServer, isManualUploadUrl } from "@/shared/api/upload";

export async function addProduct(
  data: Omit<ProductPayload, "id" | "createdAt">,
  imageFile?: File | File[] | null,
  highlightImageFile?: File | null
): Promise<ProductPayload> {
  const products = getStoredProducts();
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let finalImageUrls: string[] = Array.isArray((data as any).imageUrls)
    ? [...(data as any).imageUrls]
    : data.imageUrl
    ? [data.imageUrl]
    : [];

  if (imageFile) {
    const filesToUpload = Array.isArray(imageFile) ? imageFile : [imageFile];
    for (const f of filesToUpload) {
      if (f) {
        try {
          const url = await uploadFileToServer(f, "products");
          finalImageUrls.push(url);
        } catch (err) {
          console.warn("Upload product image failed, falling back to blob:", err);
          finalImageUrls.push(URL.createObjectURL(f));
        }
      }
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
      product_image_url: finalImageUrls.length > 0 ? finalImageUrls : null,
      highlight_img_url: highlightImgUrl || null,
    });

    const newProduct: ProductPayload = {
      ...data,
      id: supabaseRow?.id || String(Date.now()),
      imageUrl: finalImageUrls[0] || "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
      imageUrls: finalImageUrls,
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
  imageFile?: File | File[] | null,
  imageRemoved?: boolean,
  highlightImageFile?: File | null,
  highlightImageRemoved?: boolean,
  removedImageUrls?: string[]
): Promise<ProductPayload> {
  const products = getStoredProducts();
  const existingProduct = products.find((p) => String(p.id) === String(id));
  let updatedProduct: ProductPayload | null = null;

  let uploadedUrls: string[] = [];
  if (imageFile) {
    const filesToUpload = Array.isArray(imageFile) ? imageFile : [imageFile];
    for (const f of filesToUpload) {
      if (f) {
        try {
          const url = await uploadFileToServer(f, "products");
          uploadedUrls.push(url);
        } catch (err) {
          console.warn("Upload product image failed, falling back to blob:", err);
          uploadedUrls.push(URL.createObjectURL(f));
        }
      }
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

  let computedFinalBannerUrls: string[] = [];
  let computedFinalHighlightUrl: string | null = null;

  const updated = products.map((product) => {
    if (String(product.id) === String(id)) {
      let finalImageUrls: string[] = [];
      if (!imageRemoved) {
        if (Array.isArray(data.imageUrls)) {
          finalImageUrls = [...data.imageUrls];
        } else if (product.imageUrls && product.imageUrls.length > 0) {
          finalImageUrls = [...product.imageUrls];
        } else if (product.imageUrl) {
          finalImageUrls = [product.imageUrl];
        }
      }
      finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      computedFinalBannerUrls = finalImageUrls;

      let finalHighlightImgUrl: string | null = product.highlightImgUrl || null;
      if (highlightImageRemoved) {
        finalHighlightImgUrl = null;
      }
      if (highlightImageFile && uploadedHighlightUrl) {
        finalHighlightImgUrl = uploadedHighlightUrl;
      } else if (data.highlightImgUrl !== undefined) {
        finalHighlightImgUrl = data.highlightImgUrl || null;
      }
      computedFinalHighlightUrl = finalHighlightImgUrl;

      const nextCategory = data.category !== undefined ? data.category : product.category;

      updatedProduct = {
        ...product,
        ...data,
        imageUrl: finalImageUrls[0] || null,
        imageUrls: finalImageUrls,
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

  // Identify manual upload URLs that are no longer in finalImageUrls and delete from server
  const previousBannerUrls = [
    ...(existingProduct?.imageUrls || []),
    ...(existingProduct?.imageUrl ? [existingProduct.imageUrl] : []),
    ...(removedImageUrls || []),
  ];
  const obsoleteBannerUrls = Array.from(new Set(previousBannerUrls)).filter(
    (url) => url && !computedFinalBannerUrls.includes(url)
  );

  for (const obsoleteUrl of obsoleteBannerUrls) {
    if (isManualUploadUrl(obsoleteUrl)) {
      deleteFileFromServer(obsoleteUrl).catch((err) =>
        console.warn(`Failed to delete obsolete product banner: ${obsoleteUrl}`, err)
      );
    }
  }

  // If previous highlight image was manual upload and is no longer used, delete it
  if (
    existingProduct?.highlightImgUrl &&
    existingProduct.highlightImgUrl !== computedFinalHighlightUrl &&
    !computedFinalBannerUrls.includes(existingProduct.highlightImgUrl)
  ) {
    if (isManualUploadUrl(existingProduct.highlightImgUrl)) {
      deleteFileFromServer(existingProduct.highlightImgUrl).catch((err) =>
        console.warn(`Failed to delete obsolete highlight image: ${existingProduct.highlightImgUrl}`, err)
      );
    }
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
      product_image_url: targetProduct.imageUrls && targetProduct.imageUrls.length > 0 ? targetProduct.imageUrls : null,
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
  const products = getStoredProducts();
  const target = products.find((p) => String(p.id) === strId);

  if (target) {
    const allUrls = [
      ...(target.imageUrls || []),
      ...(target.imageUrl ? [target.imageUrl] : []),
      ...(target.highlightImgUrl ? [target.highlightImgUrl] : []),
    ];
    for (const url of Array.from(new Set(allUrls))) {
      if (isManualUploadUrl(url)) {
        deleteFileFromServer(url).catch((err) =>
          console.warn(`Failed to delete manual image on product deletion: ${url}`, err)
        );
      }
    }
  }

  await deleteSupabaseProduct(strId);
  const nextProducts = products.filter((p) => String(p.id) !== strId);
  saveStoredProducts(nextProducts);
}
