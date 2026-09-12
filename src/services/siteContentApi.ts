import { supabase } from "@/lib/supabase";

export interface GalleryItem {
  id?: string;
  url: string;
  title?: string;
  category?: string;
}

export interface TestimonialItem {
  id?: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  avatar_url?: string;
}

export interface SocialMediaItem {
  type: string;
  link: string;
  url?: string;
}

export type SocialMediaLinks = SocialMediaItem[] | Record<string, string>;

export interface LegalityItem {
  id?: string | number;
  question: string;
  answer: string;
}

export type LegalityDoc = LegalityItem;

export interface SiteContentRow {
  id?: string;
  hero_img_url: string | null;
  partner_img_url: string[] | null;
  about_image_url: string | null;
  about_description_short: string | null;
  about_description_long: string | null;
  more_title: string | null;
  gallery: GalleryItem[] | null;
  value_satisfy_customer: string | number | null;
  value_finished_services: string | number | null;
  value_product_produced: string | number | null;
  value_years_experience: string | number | null;
  testimonials: TestimonialItem[] | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  social_media: SocialMediaLinks | null;
  whatsapp_url: string | null;
  vision_img_url: string | null;
  vision: string | null;
  mission: string[] | null;
  legality: LegalityItem[] | null;
  created_at?: string;
  edited_at?: string;
}

const STORAGE_KEY = "dps_site_content_cache";

export const DEFAULT_SITE_CONTENT: SiteContentRow = {
  hero_img_url: null,
  partner_img_url: [],
  about_image_url: null,
  about_description_short: null,
  about_description_long: null,
  more_title: null,
  gallery: [],
  value_satisfy_customer: null,
  value_finished_services: null,
  value_product_produced: null,
  value_years_experience: null,
  testimonials: [],
  phone: null,
  email: null,
  address: null,
  social_media: null,
  whatsapp_url: null,
  vision_img_url: null,
  vision: null,
  mission: [],
  legality: [],
};


export async function getSiteContent(): Promise<SiteContentRow> {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("Supabase fetch site_content warning:", error.message);
      return getCachedSiteContent();
    }

    if (data) {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      return data as SiteContentRow;
    }

    return getCachedSiteContent();
  } catch (err) {
    console.error("Error in getSiteContent:", err);
    return getCachedSiteContent();
  }
}

export const sanitizeInteger = (val: any): number | null => {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "number") return isNaN(val) ? null : Math.round(val);
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9]/g, "");
    if (!cleaned) return null;
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

export async function updateSiteContent(
  payload: Partial<SiteContentRow>,
  contentId?: string
): Promise<SiteContentRow> {
  const cleanPayload: Record<string, any> = { ...payload };
  delete cleanPayload.created_at;
  delete cleanPayload.edited_at;

  // Ensure PostgreSQL integer fields in site_content receive number or null
  if ("value_satisfy_customer" in cleanPayload) {
    cleanPayload.value_satisfy_customer = sanitizeInteger(cleanPayload.value_satisfy_customer);
  }
  if ("value_finished_services" in cleanPayload) {
    cleanPayload.value_finished_services = sanitizeInteger(cleanPayload.value_finished_services);
  }
  if ("value_product_produced" in cleanPayload) {
    cleanPayload.value_product_produced = sanitizeInteger(cleanPayload.value_product_produced);
  }
  if ("value_years_experience" in cleanPayload) {
    cleanPayload.value_years_experience = sanitizeInteger(cleanPayload.value_years_experience);
  }

  const executeSave = async (dataToSave: Record<string, any>): Promise<SiteContentRow> => {
    // If we have an existing content ID, update it
    if (contentId) {
      const { data, error } = await supabase
        .from("site_content")
        .update(dataToSave)
        .eq("id", contentId)
        .select()
        .single();

      if (error) throw error;
      return data as SiteContentRow;
    }

    // Otherwise, check if a record already exists in DB
    const { data: existing, error: findError } = await supabase
      .from("site_content")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) throw findError;

    if (existing?.id) {
      const { data, error } = await supabase
        .from("site_content")
        .update(dataToSave)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as SiteContentRow;
    } else {
      // First time initialization: insert new row
      const { data, error } = await supabase
        .from("site_content")
        .insert([{ ...DEFAULT_SITE_CONTENT, ...dataToSave }])
        .select()
        .single();

      if (error) throw error;
      return data as SiteContentRow;
    }
  };

  try {
    let result: SiteContentRow;
    try {
      result = await executeSave(cleanPayload);
    } catch (primaryErr: any) {
      // If DB schema doesn't have vision_img_url yet, gracefully retry without it
      if (
        primaryErr?.code === "PGRST204" &&
        primaryErr?.message?.includes("vision_img_url")
      ) {
        console.warn("vision_img_url column missing in DB, saving without it...");
        const fallback = { ...cleanPayload };
        delete fallback.vision_img_url;
        result = await executeSave(fallback);
      } else {
        throw primaryErr;
      }
    }

    if (result && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    }

    return result;
  } catch (err: any) {
    console.error("Error in updateSiteContent:", err);
    // Cache locally as safety net
    if (typeof window !== "undefined") {
      const cached = getCachedSiteContent();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...cached, ...cleanPayload, edited_at: new Date().toISOString() })
      );
    }
    // Re-throw so page notifications accurately inform the user of DB status
    throw err;
  }
}

function getCachedSiteContent(): SiteContentRow {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached site content:", e);
      }
    }
  }
  return DEFAULT_SITE_CONTENT;
}
