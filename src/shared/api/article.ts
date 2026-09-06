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
  author?: string;
}

const STORAGE_KEY = "dps_articles_data";

const DEFAULT_ARTICLES: ArticlePayload[] = [];

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

export async function getConsistingCategories(): Promise<string[]> {
  const cats = new Set<string>();
  try {
    const supabaseArticles = await getSupabaseArticles();
    supabaseArticles.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
  } catch {
    // ignore
  }
  const articles = getStoredArticles();
  articles.forEach((a) => {
    (a.category || []).forEach((c) => cats.add(c));
  });
  return Array.from(cats);
}

export async function getArticleById(id: string | number): Promise<ArticlePayload | null> {
  const strId = String(id);
  if (isValidUuid(strId)) {
    try {
      const row = await getSupabaseArticleById(strId);
      if (row) {
        return {
          id: row.id,
          title: row.title,
          category: row.category ? [row.category] : ["Umum"],
          categoryColor: ["Green"],
          content: row.content || "",
          createdAt: row.created_at,
          author: "Admin",
        };
      }
    } catch (e) {
      console.warn("Supabase fetch article by id failed:", e);
    }
  }

  const articles = getStoredArticles();
  const found = articles.find((a) => String(a.id) === strId);
  return found || null;
}

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
    imageUrl = URL.createObjectURL(bannerFile);
  }

  // Sync to Supabase
  try {
    const categoryString = Array.isArray(data.category) ? data.category.join(", ") : data.category || null;

    const supabaseRow = await addSupabaseArticle({
      title: data.title,
      category: categoryString,
      content: data.content,
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

  const updated = articles.map((article) => {
    if (String(article.id) === String(id)) {
      let finalImageUrl = article.imageUrl;
      if (bannerRemoved) {
        finalImageUrl = null;
      }
      if (bannerFile) {
        finalImageUrl = URL.createObjectURL(bannerFile);
      } else if (data.imageUrl !== undefined) {
        finalImageUrl = data.imageUrl;
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
    throw new Error(`Article with id ${id} not found.`);
  }

  const targetArticle: ArticlePayload = updatedArticle;
  saveStoredArticles(updated);

  // Sync to Supabase
  try {
    const categoryString = Array.isArray(data.category) ? data.category.join(", ") : data.category;

    await editSupabaseArticle(String(id), {
      title: data.title,
      category: categoryString,
      content: data.content,
    });
  } catch (err: any) {
    const errorDetails = err?.message || err?.details || err?.hint || (typeof err === "string" ? err : JSON.stringify(err));
    console.error(`Supabase editArticle failed for ID ${id}:`, errorDetails);
    throw new Error(`Supabase Error: ${errorDetails}`);
  }

  return targetArticle;
}

export async function deleteArticle(id: string | number): Promise<void> {
  const strId = String(id);
  await deleteSupabaseArticle(strId);

  const articles = getStoredArticles();
  const nextArticles = articles.filter((a) => String(a.id) !== strId);
  saveStoredArticles(nextArticles);
}
