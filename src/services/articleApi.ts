import { supabase } from "@/lib/supabase";

export interface SupabaseArticleRow {
  id: string;
  title: string;
  category: string | null;
  content: string | null;
  created_at: string;
  edited_at: string;
}

export interface ArticleLookupQuery {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface CreateArticlePayload {
  title: string;
  category?: string | null;
  content?: string | null;
}

export interface EditArticlePayload {
  title?: string;
  category?: string | null;
  content?: string | null;
}

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

/**
 * Lookup / Fetch all articles from Supabase `public.article` table
 */
export async function getArticles(params?: ArticleLookupQuery): Promise<SupabaseArticleRow[]> {
  let query = supabase
    .from("article")
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
    console.error("Error fetching articles lookup from Supabase:", error.message || error);
    throw error;
  }

  return (data as SupabaseArticleRow[]) || [];
}

/**
 * Fetch a single article by ID
 */
export async function getArticleById(id: string): Promise<SupabaseArticleRow | null> {
  if (!isValidUuid(id)) {
    console.warn(`[Supabase] Article ID '${id}' is not a valid UUID. Skipping Supabase fetch.`);
    return null;
  }

  const { data, error } = await supabase
    .from("article")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching article with ID ${id}:`, error.message || error);
    return null;
  }

  return data as SupabaseArticleRow;
}

/**
 * Add / Create a new article in Supabase `public.article` table
 */
export async function addArticle(payload: CreateArticlePayload): Promise<SupabaseArticleRow> {
  const insertData = {
    title: payload.title,
    category: payload.category || null,
    content: payload.content || null,
  };

  const { data, error } = await supabase
    .from("article")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error adding article to Supabase:", error.message || error);
    throw error;
  }

  return data as SupabaseArticleRow;
}

/**
 * Edit / Update an existing article by ID in Supabase `public.article` table
 */
export async function editArticle(
  id: string,
  payload: EditArticlePayload
): Promise<SupabaseArticleRow | null> {
  if (!isValidUuid(id)) {
    console.warn(`[Supabase] Article ID '${id}' is a local mock ID (not a valid UUID). Skipping Supabase database update.`);
    return null;
  }

  const updateData: Record<string, any> = {
    edited_at: new Date().toISOString(),
  };

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.category !== undefined) updateData.category = payload.category;
  if (payload.content !== undefined) updateData.content = payload.content;

  const { data, error } = await supabase
    .from("article")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error editing article ID ${id} in Supabase:`, error.message || error);
    throw error;
  }

  return data as SupabaseArticleRow;
}

/**
 * Delete an article by ID from Supabase `public.article` table
 */
export async function deleteArticle(id: string): Promise<boolean> {
  if (!isValidUuid(id)) {
    console.warn(`[Supabase] Article ID '${id}' is not a valid UUID. Skipping Supabase delete.`);
    return true;
  }

  const { error } = await supabase
    .from("article")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting article ID ${id} from Supabase:`, error.message || error);
    throw error;
  }

  return true;
}
