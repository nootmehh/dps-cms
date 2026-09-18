import {
  addArticle as addSupabaseArticle,
  editArticle as editSupabaseArticle,
  deleteArticle as deleteSupabaseArticle,
  getArticles as getSupabaseArticles,
  getArticleById as getSupabaseArticleById,
  isValidUuid,
} from "@/services/articleApi";

export interface ArticlePayload {
  id?: string | number;
  title: string;
  titleIndonesia?: string;
  category: string[];
  categoryColor: string[];
  content: string;
  contentIndonesia?: string;
  imageUrl?: string | null;
  createdAt?: string;
  editedAt?: string;
  author?: string;
}

const STORAGE_KEY = "dps_articles_data";

function getStoredArticles(): ArticlePayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredArticles(articles: ArticlePayload[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    } catch (e) {
      console.error("Failed to save articles to localStorage", e);
    }
  }
}

export async function getArticleCategoryColorMap(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const supabaseArticles = await getSupabaseArticles();
    if (supabaseArticles && supabaseArticles.length > 0) {
      supabaseArticles.forEach((a) => {
        if (a.category && a.category.trim()) {
          a.category.split(",").forEach((c) => {
            const trimmed = c.trim();
            if (trimmed) {
              const col = (a.category_color || "").trim().toLowerCase();
              if (col && !map[trimmed]) {
                map[trimmed] = col;
              } else if (!map[trimmed]) {
                map[trimmed] = "green";
              }
            }
          });
        }
      });
      if (Object.keys(map).length > 0) {
        return map;
      }
    }
  } catch (err) {
    console.warn("Could not fetch article categories from Supabase:", err);
  }

  const articles = getStoredArticles();
  articles.forEach((a) => {
    (a.category || []).forEach((c, idx) => {
      const trimmed = c?.trim();
      if (trimmed && !map[trimmed]) {
        map[trimmed] = (a.categoryColor?.[idx] || a.categoryColor?.[0] || "green").toLowerCase();
      }
    });
  });

  return map;
}

export async function getConsistingCategories(): Promise<string[]> {
  const colorMap = await getArticleCategoryColorMap();
  return Object.keys(colorMap);
}

export async function getArticleById(id: string | number): Promise<ArticlePayload | null> {
  const strId = String(id);
  if (isValidUuid(strId)) {
    try {
      const row = await getSupabaseArticleById(strId);
      if (row) {
        const fetchedArticle: ArticlePayload = {
          id: row.id,
          title: row.title,
          category: row.category ? [row.category] : ["Umum"],
          categoryColor: [row.category_color?.toLowerCase() || "green"],
          content: row.content || "",
          imageUrl: row.img_url || null,
          createdAt: row.created_at,
          author: "Admin",
        };

        const stored = getStoredArticles();
        if (!stored.some((a) => String(a.id) === strId)) {
          saveStoredArticles([fetchedArticle, ...stored]);
        }

        return fetchedArticle;
      }
    } catch (e) {
      console.warn("Supabase fetch article by id failed:", e);
    }
  }

  const articles = getStoredArticles();
  const found = articles.find((a) => String(a.id) === strId);
  return found || null;
}

import {
  uploadFileToServer,
  checkVpsHealth,
  notifyUploadError,
  deleteFileFromServer,
  isManualUploadUrl,
} from "@/shared/api/upload";
import { convertImageFileToWebP } from "@/shared/api/media";

export async function addArticle(
  data: Omit<ArticlePayload, "id" | "createdAt">,
  bannerFile?: File | null
): Promise<ArticlePayload> {
  const articles = getStoredArticles();
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let imageUrl = data.imageUrl || null;
  if (bannerFile) {
    const isOnline = await checkVpsHealth();
    if (!isOnline) {
      const errorMsg = "Server VPS tidak aktif atau tidak merespons. Unggahan artikel dibatalkan.";
      notifyUploadError(errorMsg);
      throw new Error(errorMsg);
    }
    const webpFile = await convertImageFileToWebP(bannerFile);
    imageUrl = await uploadFileToServer(webpFile, "articles");
  }

  // Sync to Supabase
  try {
    const categoryString = Array.isArray(data.category) ? data.category.join(", ") : data.category || null;
    const categoryColorVal = Array.isArray(data.categoryColor)
      ? data.categoryColor[0]?.toLowerCase() || "green"
      : (data.categoryColor as any)?.toLowerCase() || "green";

    const supabaseRow = await addSupabaseArticle({
      title: data.title,
      category: categoryString,
      category_color: categoryColorVal,
      content: data.content,
      img_url: imageUrl,
    });

    const newArticle: ArticlePayload = {
      ...data,
      id: supabaseRow?.id || String(Date.now()),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
      createdAt: formattedDate,
      author: data.author || "Super Admin",
    };
    const updated = [newArticle, ...articles];
    saveStoredArticles(updated);
    return newArticle;
  } catch (err: any) {
    const errorDetails = err?.message || err?.details || err?.hint || (typeof err === "string" ? err : JSON.stringify(err));
    console.error("Supabase addArticle failed:", errorDetails);
    throw new Error(errorDetails);
  }
}

export async function editArticle(
  id: string | number,
  data: Partial<ArticlePayload>,
  bannerFile?: File | null,
  bannerRemoved?: boolean
): Promise<ArticlePayload> {
  const articles = getStoredArticles();
  let updatedArticle: ArticlePayload | null = null;

  let uploadedBannerUrl: string | null = null;
  if (bannerFile) {
    const isOnline = await checkVpsHealth();
    if (!isOnline) {
      const errorMsg = "Server VPS tidak aktif atau tidak merespons. Pembaruan artikel dibatalkan.";
      notifyUploadError(errorMsg);
      throw new Error(errorMsg);
    }
    const webpFile = await convertImageFileToWebP(bannerFile);
    uploadedBannerUrl = await uploadFileToServer(webpFile, "articles");
  }

  const existingArticle = articles.find((a) => String(a.id) === String(id));
  const oldImageUrl = existingArticle?.imageUrl;

  const updated = articles.map((article) => {
    if (String(article.id) === String(id)) {
      let finalImageUrl = article.imageUrl;
      if (bannerRemoved) {
        finalImageUrl = null;
      }
      if (bannerFile && uploadedBannerUrl) {
        finalImageUrl = uploadedBannerUrl;
      } else if (data.imageUrl !== undefined) {
        finalImageUrl = data.imageUrl;
      }

      // If previous banner is replaced or removed, purge it from VPS disk
      if (oldImageUrl && finalImageUrl !== oldImageUrl && isManualUploadUrl(oldImageUrl)) {
        deleteFileFromServer(oldImageUrl).catch((err) =>
          console.warn(`Failed to delete obsolete article image: ${oldImageUrl}`, err)
        );
      }

      updatedArticle = {
        ...article,
        ...data,
        imageUrl: finalImageUrl,
      };
      return updatedArticle;
    }
    return article;
  });

  if (!updatedArticle) {
    let finalImageUrl = data.imageUrl !== undefined ? data.imageUrl : null;
    if (bannerRemoved) {
      finalImageUrl = null;
    }
    if (bannerFile && uploadedBannerUrl) {
      finalImageUrl = uploadedBannerUrl;
    }

    updatedArticle = {
      id: String(id),
      title: data.title || "",
      category: data.category || ["Umum"],
      categoryColor: data.categoryColor || ["green"],
      content: data.content || "",
      imageUrl: finalImageUrl,
      createdAt: new Date().toISOString(),
      author: "Admin",
      ...data,
    };
    updated.unshift(updatedArticle);
  }

  const targetArticle: ArticlePayload = updatedArticle;
  saveStoredArticles(updated);

  // Sync to Supabase
  try {
    const categoryString = Array.isArray(data.category) ? data.category.join(", ") : data.category;
    const categoryColorVal = data.categoryColor !== undefined
      ? (Array.isArray(data.categoryColor)
          ? data.categoryColor[0]?.toLowerCase() || "green"
          : (data.categoryColor as any)?.toLowerCase() || "green")
      : undefined;

    await editSupabaseArticle(String(id), {
      title: data.title,
      category: categoryString,
      category_color: categoryColorVal,
      content: data.content,
      img_url: targetArticle.imageUrl,
    });
  } catch (err: any) {
    const errorDetails = err?.message || err?.details || err?.hint || (typeof err === "string" ? err : JSON.stringify(err));
    console.error(`Database editArticle failed for ID ${id}:`, errorDetails);
    throw new Error(`Database Error: ${errorDetails}`);
  }

  return targetArticle;
}

export async function deleteArticle(id: string | number): Promise<void> {
  const strId = String(id);
  const articles = getStoredArticles();
  const existing = articles.find((a) => String(a.id) === strId);

  // Purge article image from VPS disk
  if (existing?.imageUrl && isManualUploadUrl(existing.imageUrl)) {
    deleteFileFromServer(existing.imageUrl).catch((err) =>
      console.warn(`Failed to delete article image on deletion: ${existing.imageUrl}`, err)
    );
  }

  await deleteSupabaseArticle(strId);

  const nextArticles = articles.filter((a) => String(a.id) !== strId);
  saveStoredArticles(nextArticles);
}
