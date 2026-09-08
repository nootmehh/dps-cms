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

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
  twitter?: string;
  tiktok?: string;
}

export interface LegalityDoc {
  id?: string;
  title: string;
  doc_number: string;
  issuer?: string;
  valid_until?: string;
  file_url?: string;
}

export interface SiteContentRow {
  id?: string;
  hero_img_url: string | null;
  partner_img_url: string[] | null;
  about_image_url: string | null;
  about_description_short: string | null;
  about_description_long: string | null;
  more_title: string | null;
  gallery: GalleryItem[] | null;
  value_satisfy_customer: number | null;
  value_finished_services: number | null;
  value_product_produced: number | null;
  value_years_experience: number | null;
  testimonials: TestimonialItem[] | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  social_media: SocialMediaLinks | null;
  whatsapp_url: string | null;
  vision: string | null;
  mission: string[] | null;
  legality: LegalityDoc[] | null;
  created_at?: string;
  edited_at?: string;
}

const STORAGE_KEY = "dps_site_content_cache";

export const DEFAULT_SITE_CONTENT: SiteContentRow = {
  hero_img_url: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=1200&q=80",
  partner_img_url: [
    "https://placehold.co/180x60/png?text=Jasa+Marga",
    "https://placehold.co/180x60/png?text=Waskita",
    "https://placehold.co/180x60/png?text=Wijaya+Karya",
    "https://placehold.co/180x60/png?text=Hutama+Karya",
  ],
  about_image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
  about_description_short:
    "CV. Dua Putra Srikandi adalah perusahaan spesialis konstruksi marka jalan, rambu lalu lintas, dan perlengkapan jalan terpercaya di Indonesia.",
  about_description_long:
    "Didirikan dengan komitmen tinggi terhadap standar keselamatan jalan nasional, Dua Putra Srikandi hadir memberikan solusi pengecatan marka jalan berkualitas tinggi (thermoplastic dan coldplastic) serta penyediaan fasilitas keselamatan jalan terlengkap untuk proyek jalan tol, arteri, kawasan industri, dan komersial.",
  more_title: "Mengapa Memilih Dua Putra Srikandi?",
  gallery: [
    {
      id: "gal-1",
      url: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80",
      title: "Pengecatan Marka Jalan Tol",
      category: "Marka Jalan",
    },
    {
      id: "gal-2",
      url: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80",
      title: "Pemasangan Guardrail & Rambu",
      category: "Perlengkapan Jalan",
    },
  ],
  value_satisfy_customer: 250,
  value_finished_services: 520,
  value_product_produced: 1400,
  value_years_experience: 12,
  testimonials: [
    {
      id: "testi-1",
      name: "Bambang Santoso",
      role: "Project Director",
      company: "PT Konstruksi Nusantara",
      content:
        "Kualitas cat marka thermoplastic dari Dua Putra Srikandi sangat tahan lama dan pengerjaannya sangat presisi sesuai spesifikasi PU.",
      rating: 5,
    },
  ],
  phone: "+62 812-3456-7890",
  email: "info@duaputrasrikandi.co.id",
  address: "Jl. Raya Industri Keselamatan No. 88, Bekasi, Jawa Barat, Indonesia",
  social_media: {
    instagram: "https://instagram.com/duaputrasrikandi",
    facebook: "https://facebook.com/duaputrasrikandi",
    linkedin: "https://linkedin.com/company/duaputrasrikandi",
    youtube: "https://youtube.com/@duaputrasrikandi",
    tiktok: "https://tiktok.com/@duaputrasrikandi",
  },
  whatsapp_url: "https://wa.me/6281234567890",
  vision:
    "Menjadi perusahaan penyedia jasa dan perlengkapan marka jalan nomor satu di Indonesia yang terdepan dalam inovasi mutu dan keselamatan.",
  mission: [
    "Memberikan hasil pengecatan marka jalan dengan standar durabilitas dan retroreflektif tertinggi.",
    "Menggunakan material ramah lingkungan dan teknologi aplikasi modern.",
    "Membangun kemitraan jangka panjang berlandaskan integritas, profesionalisme, dan ketepatan waktu.",
  ],
  legality: [
    {
      id: "leg-1",
      title: "Nomor Induk Berusaha (NIB)",
      doc_number: "0220202930192",
      issuer: "Kementerian Investasi / BKPM",
    },
    {
      id: "leg-2",
      title: "Surat Izin Usaha Jasa Konstruksi (SIUJK)",
      doc_number: "1-3275-2-00412-1",
      issuer: "LPJK Nasional",
    },
    {
      id: "leg-3",
      title: "Nomor Pokok Wajib Pajak (NPWP)",
      doc_number: "81.492.301.2-404.000",
      issuer: "Direktorat Jenderal Pajak",
    },
  ],
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

    // If no row exists yet in Supabase, create initial record
    const { data: inserted, error: insertError } = await supabase
      .from("site_content")
      .insert([DEFAULT_SITE_CONTENT])
      .select()
      .single();

    if (!insertError && inserted) {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inserted));
      }
      return inserted as SiteContentRow;
    }

    return getCachedSiteContent();
  } catch (err) {
    console.error("Error in getSiteContent:", err);
    return getCachedSiteContent();
  }
}

export async function updateSiteContent(
  payload: Partial<SiteContentRow>,
  contentId?: string
): Promise<SiteContentRow> {
  const cleanPayload = { ...payload };
  delete cleanPayload.created_at;
  delete cleanPayload.edited_at;

  try {
    let result: SiteContentRow | null = null;

    if (contentId) {
      const { data, error } = await supabase
        .from("site_content")
        .update(cleanPayload)
        .eq("id", contentId)
        .select()
        .single();

      if (error) throw error;
      result = data as SiteContentRow;
    } else {
      // Check if there is already an existing record to update
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from("site_content")
          .update(cleanPayload)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data as SiteContentRow;
      } else {
        const { data, error } = await supabase
          .from("site_content")
          .insert([{ ...DEFAULT_SITE_CONTENT, ...cleanPayload }])
          .select()
          .single();

        if (error) throw error;
        result = data as SiteContentRow;
      }
    }

    if (result && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    }

    return result || (payload as SiteContentRow);
  } catch (err) {
    console.error("Error in updateSiteContent:", err);
    // Offline / fallback handling
    const cached = getCachedSiteContent();
    const updated = {
      ...cached,
      ...cleanPayload,
      edited_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
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
