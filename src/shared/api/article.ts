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

const DEFAULT_ARTICLES: ArticlePayload[] = [
  {
    id: "1",
    title: "Standar Keselamatan Pemasangan Guardrail di Jalan Tol Indonesia",
    titleIndonesia: "Standar Keselamatan Pemasangan Guardrail di Jalan Tol Indonesia",
    category: ["Keselamatan Jalan", "Konstruksi"],
    categoryColor: ["Green", "Blue"],
    content: "<p>Analisis regulasi teknis pemasangan pagar pengaman jalan tol sesuai spesifikasi Bina Marga.</p>",
    contentIndonesia: "<p>Analisis regulasi teknis pemasangan pagar pengaman jalan tol sesuai spesifikasi Bina Marga.</p>",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    createdAt: "25 Agu 2024, 08:30",
    author: "Tim Redaksi DPS",
  },
  {
    id: "2",
    title: "Pentingnya Marka Termoplastik untuk Visibilitas Malam Hari",
    titleIndonesia: "Pentingnya Marka Termoplastik untuk Visibilitas Malam Hari",
    category: ["Inovasi Marka", "Perlengkapan Jalan"],
    categoryColor: ["Blue", "Yellow"],
    content: "<p>Kelebihan kandungan glass beads reflektif pada cat marka jalan panas terhadap keselamatan berkendara.</p>",
    contentIndonesia: "<p>Kelebihan kandungan glass beads reflektif pada cat marka jalan panas terhadap keselamatan berkendara.</p>",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
    createdAt: "21 Agu 2024, 13:15",
    author: "Ir. Hendra Wijaya",
  },
  {
    id: "3",
    title: "Efisiensi PJU Tenaga Surya untuk Pengurangan Emisi Karbon",
    titleIndonesia: "Efisiensi PJU Tenaga Surya untuk Pengurangan Emisi Karbon",
    category: ["Teknologi Hijau", "Penerangan"],
    categoryColor: ["Yellow", "Green"],
    content: "<p>Pemanfaatan lampu PJU solar cell dalam proyek infrastruktur jalan ramah lingkungan.</p>",
    contentIndonesia: "<p>Pemanfaatan lampu PJU solar cell dalam proyek infrastruktur jalan ramah lingkungan.</p>",
    imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
    createdAt: "17 Agu 2024, 10:00",
    author: "Siti Rahmawati",
  },
];

function getStoredArticles(): ArticlePayload[] {
  if (typeof window === "undefined") return DEFAULT_ARTICLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ARTICLES));
      return DEFAULT_ARTICLES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ARTICLES;
  } catch {
    return DEFAULT_ARTICLES;
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
  const articles = getStoredArticles();
  const cats = new Set<string>();
  articles.forEach((a) => {
    (a.category || []).forEach((c) => cats.add(c));
  });
  return Array.from(cats);
}

export async function getArticleById(id: string | number): Promise<ArticlePayload | null> {
  const articles = getStoredArticles();
  const found = articles.find((a) => String(a.id) === String(id));
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

  const newArticle: ArticlePayload = {
    ...data,
    id: String(Date.now()),
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    createdAt: formattedDate,
    author: data.author || "Super Admin",
  };

  const updated = [newArticle, ...articles];
  saveStoredArticles(updated);
  return newArticle;
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

  saveStoredArticles(updated);
  return updatedArticle;
}
