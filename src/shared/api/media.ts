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

  // Default demo media items
  return {
    data: [
      {
        id: "1",
        fileName: "dps-campus-hero.webp",
        fileSize: "245 KB",
        url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "2",
        fileName: "students-event.webp",
        fileSize: "180 KB",
        url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "3",
        fileName: "classroom-lab.webp",
        fileSize: "320 KB",
        url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "4",
        fileName: "library-reading.webp",
        fileSize: "410 KB",
        url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      },
    ],
  };
}
