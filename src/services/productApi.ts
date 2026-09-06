import { supabase } from "@/lib/supabase";

export interface SupabaseProductRow {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  detail_product: any | null;
  suitable_for: any | null;
  kelebihan: any | null;
  kekurangan: any | null;
  product_image_url: string[] | null;
  highlight_img_url: string | null;
  created_at: string;
  edited_at: string;
}

export interface ProductLookupQuery {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface CreateProductPayload {
  title: string;
  category?: string | null;
  description?: string | null;
  detail_product?: any | null;
  suitable_for?: any | null;
  kelebihan?: any | null;
  kekurangan?: any | null;
  product_image_url?: string[] | null;
  highlight_img_url?: string | null;
}

export interface EditProductPayload {
  title?: string;
  category?: string | null;
  description?: string | null;
  detail_product?: any | null;
  suitable_for?: any | null;
  kelebihan?: any | null;
  kekurangan?: any | null;
  product_image_url?: string[] | null;
  highlight_img_url?: string | null;
}

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

/**
 * Lookup / Fetch all products from Supabase `public.product` table
 */
export async function getProducts(params?: ProductLookupQuery): Promise<SupabaseProductRow[]> {
  let query = supabase
    .from("product")
    .select("*")
    .order("created_at", { ascending: false });

  if (params?.category) {
    query = query.eq("category", params.category);
  }

  if (params?.search) {
    query = query.or(`title.ilike.%${params.search}%,category.ilike.%${params.search}%`);
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset && params?.limit) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products lookup from Supabase:", error.message || error);
    throw error;
  }

  return (data as SupabaseProductRow[]) || [];
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string): Promise<SupabaseProductRow | null> {
  if (!isValidUuid(id)) {
    console.warn(`[Supabase] Product ID '${id}' is not a valid UUID. Skipping Supabase fetch.`);
    return null;
  }

  const { data, error } = await supabase
    .from("product")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message || error);
    return null;
  }

  return data as SupabaseProductRow;
}

/**
 * Add / Create a new product in Supabase `public.product` table
 */
export async function addProduct(payload: CreateProductPayload): Promise<SupabaseProductRow> {
  const insertData = {
    title: payload.title,
    category: payload.category || null,
    description: payload.description || null,
    detail_product: payload.detail_product || null,
    suitable_for: payload.suitable_for || null,
    kelebihan: payload.kelebihan || null,
    kekurangan: payload.kekurangan || null,
    product_image_url: payload.product_image_url || null,
    highlight_img_url: payload.highlight_img_url || null,
  };

  const { data, error } = await supabase
    .from("product")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error adding product to Supabase:", error.message || error);
    throw error;
  }

  return data as SupabaseProductRow;
}

/**
 * Edit / Update an existing product by ID in Supabase `public.product` table
 */
export async function editProduct(
  id: string,
  payload: EditProductPayload
): Promise<SupabaseProductRow | null> {
  if (!isValidUuid(id)) {
    console.warn(`[Supabase] Product ID '${id}' is a local mock ID (not a valid UUID). Skipping Supabase database update.`);
    return null;
  }

  const updateData: Record<string, any> = {
    edited_at: new Date().toISOString(),
  };

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.category !== undefined) updateData.category = payload.category;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.detail_product !== undefined) updateData.detail_product = payload.detail_product;
  if (payload.suitable_for !== undefined) updateData.suitable_for = payload.suitable_for;
  if (payload.kelebihan !== undefined) updateData.kelebihan = payload.kelebihan;
  if (payload.kekurangan !== undefined) updateData.kekurangan = payload.kekurangan;
  if (payload.product_image_url !== undefined) updateData.product_image_url = payload.product_image_url;
  if (payload.highlight_img_url !== undefined) updateData.highlight_img_url = payload.highlight_img_url;

  const { data, error } = await supabase
    .from("product")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error editing product ID ${id} in Supabase:`, error.message || error);
    throw error;
  }

  return data as SupabaseProductRow;
}

/**
 * Delete a product by ID from Supabase `public.product` table
 */
export async function deleteProduct(id: string): Promise<boolean> {
  if (!isValidUuid(id)) {
    console.warn(`[Supabase] Product ID '${id}' is not a valid UUID. Skipping Supabase delete.`);
    return true;
  }

  const { error } = await supabase
    .from("product")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting product ID ${id} from Supabase:`, error.message || error);
    throw error;
  }

  return true;
}
