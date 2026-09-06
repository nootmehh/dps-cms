import { supabase } from "@/lib/supabase";

export interface SeoSettingsRow {
  id?: string;
  site_title_default: string;
  meta_description_default: string;
  auto_generate_sitemap: boolean;
  ga_connected: boolean;
  ga_measurement_id?: string | null;
  created_at?: string;
  edited_at?: string;
}

export interface PageMetaRow {
  id: string;
  page_name: string;
  route_path: string;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  created_at?: string;
  edited_at?: string;
}

export interface UpdateSeoSettingsPayload {
  site_title_default?: string;
  meta_description_default?: string;
  auto_generate_sitemap?: boolean;
  ga_connected?: boolean;
  ga_measurement_id?: string | null;
}

export interface UpdatePageMetaPayload {
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string | null;
}

const DEFAULT_SETTINGS: SeoSettingsRow = {
  site_title_default: "Dua Putra Srikandi - Jasa & Produk Marka Jalan",
  meta_description_default:
    "Spesialis pengecatan marka jalan, perlengkapan jalan, dan fasilitas keselamatan lalu lintas terpercaya.",
  auto_generate_sitemap: true,
  ga_connected: false,
  ga_measurement_id: null,
};

const DEFAULT_PAGE_METAS: PageMetaRow[] = [
  {
    id: "beranda",
    page_name: "Beranda",
    route_path: "/",
    meta_title: "Beranda - Dua Putra Srikandi",
    meta_description: "Halaman utama Dua Putra Srikandi penyedia jasa & produk marka jalan.",
    keywords: "marka jalan, kontraktor jalan, perlengkapan jalan",
  },
  {
    id: "layanan",
    page_name: "Kelola layanan",
    route_path: "/layanan",
    meta_title: "Layanan Marka Jalan",
    meta_description: "Layanan pengecatan marka dan fasilitas lalu lintas.",
    keywords: "jasa marka, pengecatan jalan",
  },
  {
    id: "produk",
    page_name: "Kelola produk",
    route_path: "/produk",
    meta_title: "Katalog Produk Marka Jalan",
    meta_description: "Produk perlengkapan dan peralatan marka jalan berkualitas.",
    keywords: "cat marka, thermoplastic, perlengkapan jalan",
  },
  {
    id: "artikel",
    page_name: "Artikel",
    route_path: "/artikel",
    meta_title: "Artikel & Berita Konstruksi",
    meta_description: "Kumpulan artikel dan wawasan teknologi marka jalan.",
    keywords: "berita marka, keselamatan jalan",
  },
];

/**
 * Fetch general SEO settings from Supabase `public.seo_settings`
 */
export async function getSeoSettings(): Promise<SeoSettingsRow> {
  try {
    const { data, error } = await supabase.from("seo_settings").select("*").limit(1);

    if (error) {
      console.warn("Supabase fetch seo_settings warning:", error.message || error);
      return DEFAULT_SETTINGS;
    }

    if (data && data.length > 0) {
      return data[0] as SeoSettingsRow;
    }

    return DEFAULT_SETTINGS;
  } catch (err) {
    console.error("Error fetching seo_settings from Supabase:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update general SEO settings in Supabase `public.seo_settings`
 */
export async function updateSeoSettings(
  payload: UpdateSeoSettingsPayload,
  existingId?: string
): Promise<SeoSettingsRow> {
  const updateData: Record<string, any> = {
    site_title_default: payload.site_title_default,
    meta_description_default: payload.meta_description_default,
    auto_generate_sitemap: payload.auto_generate_sitemap,
    ga_connected: payload.ga_connected,
    ga_measurement_id: payload.ga_measurement_id ?? null,
    edited_at: new Date().toISOString(),
  };

  if (existingId && existingId !== "default") {
    const { data, error } = await supabase
      .from("seo_settings")
      .update(updateData)
      .eq("id", existingId)
      .select()
      .single();

    if (error) {
      console.error("Error updating seo_settings in Supabase:", error.message || error);
      throw error;
    }

    return data as SeoSettingsRow;
  }

  // If no existing row, insert new
  const { data, error } = await supabase
    .from("seo_settings")
    .insert([updateData])
    .select()
    .single();

  if (error) {
    console.error("Error inserting seo_settings in Supabase:", error.message || error);
    throw error;
  }

  return data as SeoSettingsRow;
}

/**
 * Fetch all page meta items from Supabase `public.page_meta`
 */
export async function getPageMetas(): Promise<PageMetaRow[]> {
  try {
    const { data, error } = await supabase.from("page_meta").select("*").order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase fetch page_meta warning:", error.message || error);
      return DEFAULT_PAGE_METAS;
    }

    if (data && data.length > 0) {
      return data as PageMetaRow[];
    }

    return DEFAULT_PAGE_METAS;
  } catch (err) {
    console.error("Error fetching page_meta from Supabase:", err);
    return DEFAULT_PAGE_METAS;
  }
}

/**
 * Update a specific page meta row by ID or route_path in Supabase
 */
export async function updatePageMeta(
  id: string,
  payload: UpdatePageMetaPayload
): Promise<PageMetaRow> {
  const updateData = {
    meta_title: payload.meta_title ?? null,
    meta_description: payload.meta_description ?? null,
    keywords: payload.keywords ?? null,
    edited_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("page_meta")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating page_meta ID ${id} in Supabase:`, error.message || error);
    throw error;
  }

  return data as PageMetaRow;
}
