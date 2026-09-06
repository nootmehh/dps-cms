export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileSize?: string;
  createdAt?: string;
}

export async function fetchMediaList(category: string = "media"): Promise<{ data: MediaItem[] }> {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("lyfline_media_items") : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { data: parsed };
      }
    }
  } catch (e) {
    console.error("Error reading stored media items", e);
  }

  return {
    data: [],
  };
}
