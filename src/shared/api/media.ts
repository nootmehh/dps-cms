import JSZip from "jszip";
import {
  uploadFileToServer,
  deleteFileFromServer,
  checkVpsHealth,
  notifyUploadError,
  getUploadEndpoint,
} from "@/shared/api/upload";

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

// In-memory media cache for current application runtime (never saved to localStorage)
let memoryMediaItems: MediaItem[] = [];

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
 * Convert any image File to an optimized WebP File in the browser using HTML5 Canvas.
 * Produces a real binary File object for network transmission (never saved to localStorage or converted to base64).
 */
export async function convertImageFileToWebP(
  file: File,
  quality: number = 0.85
): Promise<File> {
  // If already WebP, return as-is
  if (file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")) {
    return file;
  }

  // Only convert image formats
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Browser only
  if (typeof window === "undefined") {
    return file;
  }

  return new Promise((resolve) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      return resolve(file);
    }

    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const webpFileName = `${baseName}.webp`;
            const webpFile = new File([blob], webpFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      } catch (err) {
        console.warn("Canvas WebP conversion failed, sending original file:", err);
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Upload single image strictly to VPS server:
 * 1. Checks if VPS is active/healthy first.
 * 2. Converts image to WebP format in browser.
 * 3. Uploads the WebP binary file to VPS.
 * Throws directly if VPS is offline or upload fails.
 */
export async function uploadImage(file: File, folder: string = "media"): Promise<string> {
  // Step 1: Check VPS health first
  const isOnline = await checkVpsHealth();
  if (!isOnline) {
    const errorMsg = "Server VPS tidak aktif atau tidak merespons. Unggahan dibatalkan.";
    notifyUploadError(errorMsg);
    throw new Error(errorMsg);
  }

  // Step 2: Convert to WebP in browser before uploading
  const webpFile = await convertImageFileToWebP(file);

  // Step 3: Send WebP binary file to VPS
  const uploadedUrl = await uploadFileToServer(webpFile, folder);

  // Keep in runtime memory for current session
  const newMediaItem: MediaItem = {
    id: webpFile.name,
    url: uploadedUrl,
    fileName: webpFile.name,
    fileSize: formatBytes(webpFile.size),
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  memoryMediaItems = [newMediaItem, ...memoryMediaItems.filter((m) => m.url !== uploadedUrl)];

  return uploadedUrl;
}

/**
 * Delete image by ID or URL from VPS server.
 */
export async function deleteImage(identifier: string): Promise<void> {
  const target = memoryMediaItems.find((item) => item.id === identifier || item.url === identifier);
  const targetUrl = target?.url || identifier;

  if (targetUrl) {
    await deleteFileFromServer(targetUrl);
  }

  memoryMediaItems = memoryMediaItems.filter(
    (item) => item.id !== identifier && item.url !== identifier
  );
}

/**
 * Unpack and process a .ZIP archive of images:
 * 1. Checks if VPS is active/healthy first.
 * 2. Converts each extracted image to WebP in browser.
 * 3. Uploads each WebP binary file directly to VPS.
 */
export async function processZipFile(
  zipFile: File,
  folder: string = "media",
  onProgress?: (progress: { current: number; total: number; currentFileName: string }) => void
): Promise<MediaItem[]> {
  // Step 1: Check VPS health first
  const isOnline = await checkVpsHealth();
  if (!isOnline) {
    const errorMsg = "Server VPS tidak aktif atau tidak merespons. Proses arsip ZIP dibatalkan.";
    notifyUploadError(errorMsg);
    throw new Error(errorMsg);
  }

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
    throw new Error("Tidak ditemukan berkas gambar yang didukung di dalam arsip ZIP.");
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
    const rawFile = new File([blob], cleanFileName, { type: blob.type || "image/png" });

    // Step 2: Convert to WebP in browser
    const webpFile = await convertImageFileToWebP(rawFile);

    // Step 3: Upload WebP to VPS
    const fileUrl = await uploadFileToServer(webpFile, folder);
    const fileSizeStr = formatBytes(webpFile.size);

    const mediaItem: MediaItem = {
      id: webpFile.name,
      url: fileUrl,
      fileName: webpFile.name,
      fileSize: fileSizeStr,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    results.push(mediaItem);
  }

  memoryMediaItems = [...results, ...memoryMediaItems];
  return results;
}

/**
 * Fetch media items from centralized VPS server (never from localStorage).
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
  const folder =
    typeof optionsOrCategory === "object" && optionsOrCategory !== null
      ? optionsOrCategory.folder || "media"
      : typeof optionsOrCategory === "string"
      ? optionsOrCategory
      : "media";

  let search = "";
  let page = 1;
  let limit = 50;

  if (typeof optionsOrCategory === "object" && optionsOrCategory !== null) {
    search = optionsOrCategory.search || "";
    page = optionsOrCategory.page || 1;
    limit = optionsOrCategory.limit || 50;
  }

  let serverItems: MediaItem[] = [];

  try {
    const endpoint = getUploadEndpoint();
    const res = await fetch(`${endpoint}?folder=${encodeURIComponent(folder)}`, {
      method: "GET",
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        serverItems = json.data.map((item: any) => ({
          id: item.id || item.fileName || item.url,
          url: item.url,
          fileName: item.fileName || item.name || "media.webp",
          fileSize: item.fileSize || "",
          uploadedAt: item.uploadedAt || item.createdAt || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("Failed to fetch media list from VPS:", err);
  }

  // Merge server items with any memory items from current session
  const combinedMap = new Map<string, MediaItem>();
  for (const item of serverItems) {
    combinedMap.set(item.url, item);
  }
  for (const item of memoryMediaItems) {
    if (!combinedMap.has(item.url)) {
      combinedMap.set(item.url, item);
    }
  }

  const allMedia = Array.from(combinedMap.values());

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
