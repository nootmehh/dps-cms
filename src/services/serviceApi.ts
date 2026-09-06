import { supabase } from "@/lib/supabase";

export interface SupabaseServiceRow {
  id: string;
  title: string;
  category: string | null;
  keunggulan: { title: string; description: string }[] | null;
  faq: { question: string; answer: string }[] | null;
  product_id: string[] | null;
  service_image_url: string[] | null;
  created_at: string;
  edited_at: string;
}

export interface ServiceLookupQuery {
  search?: string;
  category?: string;
  productId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateServicePayload {
  title: string;
  category?: string | null;
  keunggulan?: { title: string; description: string }[] | null;
  faq?: { question: string; answer: string }[] | null;
  product_id?: string[] | null;
  service_image_url?: string[] | null;
}

export interface EditServicePayload {
  title?: string;
  category?: string | null;
  keunggulan?: { title: string; description: string }[] | null;
  faq?: { question: string; answer: string }[] | null;
  product_id?: string[] | null;
  service_image_url?: string[] | null;
}

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Utility to check if string is a valid PostgreSQL UUID
 */
export function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

/**
 * Fetch all services or search/filter services from Supabase `public.services`
 */
export async function getServices(params?: ServiceLookupQuery): Promise<SupabaseServiceRow[]> {
  let query = supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  if (params?.category) {
    query = query.eq("category", params.category);
  }

  if (params?.search) {
    query = query.or(`title.ilike.%${params.search}%,category.ilike.%${params.search}%`);
  }

  if (params?.productId && isValidUuid(params.productId)) {
    query = query.contains("product_id", [params.productId]);
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset && params?.limit) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching services lookup from Supabase:", error);
    throw error;
  }

  return (data as SupabaseServiceRow[]) || [];
}

/**
 * Fetch a single service by ID
 */
export async function getServiceById(id: string): Promise<SupabaseServiceRow | null> {
  if (!isValidUuid(id)) {
    console.warn(`[Supabase] ID '${id}' is not a valid UUID. Skipping Supabase fetch.`);
    return null;
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    return null;
  }

  return data as SupabaseServiceRow;
}

/**
 * Add / Create a new service in Supabase table `public.services`
 */
export async function addService(payload: CreateServicePayload): Promise<SupabaseServiceRow> {
  // Filter product_id to only include valid UUIDs for PostgreSQL uuid[] column
  const validProductIds = payload.product_id
    ? payload.product_id.filter(isValidUuid)
    : null;

  const insertData = {
    title: payload.title,
    category: payload.category || null,
    keunggulan: payload.keunggulan || null,
    faq: payload.faq || null,
    product_id: validProductIds && validProductIds.length > 0 ? validProductIds : null,
    service_image_url: payload.service_image_url || null,
  };

  const { data, error } = await supabase
    .from("services")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error adding service to Supabase:", error.message || error);
    throw error;
  }

  return data as SupabaseServiceRow;
}

/**
 * Edit / Update an existing service by ID in Supabase table `public.services`
 */
export async function editService(
  id: string,
  payload: EditServicePayload
): Promise<SupabaseServiceRow | null> {
  if (!isValidUuid(id)) {
    console.warn(`[Supabase] Service ID '${id}' is a local mock ID (not a valid UUID). Skipping Supabase database update.`);
    return null;
  }

  const updateData: Record<string, any> = {
    edited_at: new Date().toISOString(),
  };

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.category !== undefined) updateData.category = payload.category;
  if (payload.keunggulan !== undefined) updateData.keunggulan = payload.keunggulan;
  if (payload.faq !== undefined) updateData.faq = payload.faq;

  if (payload.product_id !== undefined) {
    const validProductIds = payload.product_id
      ? payload.product_id.filter(isValidUuid)
      : null;
    updateData.product_id = validProductIds && validProductIds.length > 0 ? validProductIds : null;
  }

  if (payload.service_image_url !== undefined) {
    updateData.service_image_url = payload.service_image_url;
  }

  const { data, error } = await supabase
    .from("services")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error editing service ID ${id} in Supabase:`, error.message || error);
    throw error;
  }

  return data as SupabaseServiceRow;
}

/**
 * Delete a service by ID from Supabase table `public.services`
 */
export async function deleteService(id: string): Promise<boolean> {
  if (!isValidUuid(id)) {
    console.warn(`[Supabase] Service ID '${id}' is not a valid UUID. Skipping Supabase delete.`);
    return true;
  }

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting service ID ${id} from Supabase:`, error.message || error);
    throw error;
  }

  return true;
}
