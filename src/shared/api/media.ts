import JSZip from "jszip";
import { uploadFileToServer, deleteFileFromServer } from "@/shared/api/upload";

export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileSize?: string;
  uploadedAt?: string;
  createdAt?: string;
}

export interface MediaListResponse {
  data: MediaItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const LOCAL_STORAGE_KEY = "lyfline_media_items";

export function getStoredMediaList(): MediaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read media list from localStorage:", err);
    return [];
  }
}

export function saveStoredMediaList(list: MediaItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save media list to localStorage:", err);
  }
}

/**
 * Format bytes to readable string (e.g. 1.25 MB, 320 KB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Convert any image file to WebP format using HTML5 Canvas in the browser.
 */
export async function convertImageToWebP(
  file: File | Blob,
  fileName: string,
  quality: number = 0.85
): Promise<{ dataUrl: string; webpFileName: string; fileSize: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create canvas context for WebP conversion."));
          return;
        }

        ctx.drawImage(img, 0, 0);

        // Export as WebP DataURL
        const webpDataUrl = canvas.toDataURL("image/webp", quality);

        // Generate clean webp filename
        const baseName = fileName.replace(/\.[^/.]+$/, "");
        const webpFileName = `${baseName}.webp`;

        // Estimate size from Base64 Data URL length
        const base64Length = webpDataUrl.length - (webpDataUrl.indexOf(",") + 1);
        const byteSize = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl: webpDataUrl,
          webpFileName,
          fileSize: formatBytes(byteSize),
        });
      };
      img.onerror = () => reject(new Error("Failed to load image for WebP conversion."));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload single image to server (with fallback to local WebP conversion).
 */
export async function uploadImage(file: File, folder: string = "media"): Promise<string> {
  try {
    const uploadedUrl = await uploadFileToServer(file, folder);
    return uploadedUrl;
  } catch (err) {
    console.warn("Server upload failed, falling back to client WebP:", err);
    const { dataUrl } = await convertImageToWebP(file, file.name);
    return dataUrl;
  }
}

/**
 * Delete image by ID or URL.
 */
export async function deleteImage(identifier: string): Promise<void> {
  const current = getStoredMediaList();
  const target = current.find((item) => item.id === identifier || item.url === identifier);
  if (target?.url) {
    await deleteFileFromServer(target.url);
  }
  const updated = current.filter((item) => item.id !== identifier && item.url !== identifier);
  saveStoredMediaList(updated);
}

/**
 * Unpack and process a .ZIP archive of images, uploading each to server.
 */
export async function processZipFile(
  zipFile: File,
  folder: string = "media",
  onProgress?: (progress: { current: number; total: number; currentFileName: string }) => void
): Promise<MediaItem[]> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);

  // Filter image files inside the ZIP
  const imageFiles: { path: string; file: JSZip.JSZipObject }[] = [];
  const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".svg", ".gif"];

  loadedZip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    // Skip macOS metadata folders
    if (relativePath.startsWith("__MACOSX/") || relativePath.includes("/.")) return;

    const lower = relativePath.toLowerCase();
    if (validExtensions.some((ext) => lower.endsWith(ext))) {
      imageFiles.push({ path: relativePath, file: zipEntry });
    }
  });

  if (imageFiles.length === 0) {
    throw new Error("No supported image files found inside the ZIP archive.");
  }

  const results: MediaItem[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const entry = imageFiles[i];
    const cleanFileName = entry.path.split("/").pop() || `image_${i + 1}.png`;

    onProgress?.({
      current: i + 1,
      total: imageFiles.length,
      currentFileName: cleanFileName,
    });

    const blob = await entry.file.async("blob");
    let fileUrl = "";
    let fileSizeStr = "";

    try {
      const fileObj = new File([blob], cleanFileName, { type: blob.type || "image/png" });
      fileUrl = await uploadFileToServer(fileObj, folder);
      fileSizeStr = formatBytes(blob.size);
    } catch {
      const { dataUrl, fileSize } = await convertImageToWebP(blob, cleanFileName);
      fileUrl = dataUrl;
      fileSizeStr = fileSize;
    }

    const mediaItem: MediaItem = {
      id: `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      url: fileUrl,
      fileName: cleanFileName,
      fileSize: fileSizeStr,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    results.push(mediaItem);
  }

  return results;
}

/**
 * Fetch media items with search and pagination support.
 */
export async function fetchMediaList(
  optionsOrCategory?:
    | {
        folder?: string;
        page?: number;
        limit?: number;
        search?: string;
      }
    | string
): Promise<MediaListResponse> {
  const allMedia = getStoredMediaList();

  let search = "";
  let page = 1;
  let limit = allMedia.length || 10;

  if (typeof optionsOrCategory === "object" && optionsOrCategory !== null) {
    search = optionsOrCategory.search || "";
    page = optionsOrCategory.page || 1;
    limit = optionsOrCategory.limit || 50;
  }

  const filtered = allMedia.filter((item) =>
    item.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
    },
  };
}
