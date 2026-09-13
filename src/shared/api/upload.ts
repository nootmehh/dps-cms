/**
 * Unified Upload Service for DPS CMS
 * Works in both local development (localhost) and production VPS environments.
 */

/**
 * Clean and normalize API URL from environment variable.
 * Removes unwanted wrapper characters like [ ] or extra quotes.
 */
export function sanitizeApiUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  let cleaned = rawUrl.trim();
  // Strip square brackets if user wrote [http://...]
  cleaned = cleaned.replace(/^\[+/, "").replace(/\]+$/, "").trim();
  // Strip quotes
  cleaned = cleaned.replace(/^["']+|["']+$/g, "").trim();
  // Strip trailing slash
  cleaned = cleaned.replace(/\/+$/, "");
  return cleaned;
}

/**
 * Determine the endpoint URL to send uploads to.
 * Targets the dedicated dps-server on VPS (http://103.127.135.206:3000/api/upload).
 */
export function getUploadEndpoint(): string {
  const envUrl = sanitizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

  if (envUrl) {
    return envUrl.endsWith("/api/upload") ? envUrl : `${envUrl}/api/upload`;
  }

  // Fallback to VPS dps-server
  return "http://103.127.135.206:3000/api/upload";
}

/**
 * Determine the health check URL for the VPS server.
 */
export function getHealthEndpoint(): string {
  const uploadEndpoint = getUploadEndpoint();
  return uploadEndpoint.replace(/\/api\/upload.*$/, "") + "/api/health";
}

/**
 * Check if the VPS server is reachable and active.
 * Uses a short 4-second timeout to quickly verify availability before doing any browser conversion or upload.
 */
export async function checkVpsHealth(timeoutMs: number = 4000): Promise<boolean> {
  const healthUrl = getHealthEndpoint();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch {
      // ignore
    }
  }, timeoutMs);

  try {
    const res = await fetch(healthUrl, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

export interface UploadResult {
  url: string;
  relativeUrl: string;
  fileName: string;
  originalName: string;
  fileSize?: string;
  mimeType?: string;
}

export const UPLOAD_TIMEOUT_MS = 20000; // 20-second timeout
export const UPLOAD_TIMEOUT_MESSAGE = "Upload gagal: Koneksi ke server VPS timeout (tidak merespons). Pastikan server VPS aktif.";

/**
 * Dispatches a global event for upload errors so notification toasts can display it anywhere.
 */
export function notifyUploadError(message: string = UPLOAD_TIMEOUT_MESSAGE): void {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("dps-upload-error", {
          detail: {
            message,
            type: "error",
          },
        })
      );
    } catch {
      // ignore
    }
  }
}

/**
 * Upload single file to server.
 * Strictly uploads to VPS dps-server. Throws descriptive error if VPS fails or times out.
 *
 * @param file File or Blob to upload
 * @param folder Subfolder (e.g. "products", "articles", "services", "media", "site")
 * @returns Public URL of the uploaded file on VPS
 */
export async function uploadFileToServer(
  file: File | Blob,
  folder: string = "media"
): Promise<string> {
  const formData = new FormData();

  if (file instanceof File) {
    formData.append("file", file, file.name);
  } else {
    formData.append("file", file, `upload_${Date.now()}.webp`);
  }
  formData.append("folder", folder);

  const endpoint = getUploadEndpoint();
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    try {
      controller.abort();
    } catch {
      // ignore
    }
  }, UPLOAD_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      const errorMsg = `Upload ke VPS gagal (${res.status}): ${errorText || res.statusText || "Internal Server Error"}`;
      notifyUploadError(errorMsg);
      throw new Error(errorMsg);
    }

    const json = await res.json();
    if (json && json.url) {
      return json.url;
    }
    if (json && json.data && json.data[0]?.url) {
      return json.data[0].url;
    }
    if (json && json.relativeUrl) {
      return json.relativeUrl;
    }

    const formatError = "Format respons API upload VPS tidak valid (URL berkas tidak ditemukan).";
    notifyUploadError(formatError);
    throw new Error(formatError);
  } catch (err: any) {
    clearTimeout(timeoutId);
    let errorMessage = err?.message || "Gagal mengunggah berkas ke server VPS.";

    if (timedOut || err?.name === "AbortError" || err?.message?.includes("aborted")) {
      errorMessage = UPLOAD_TIMEOUT_MESSAGE;
    } else if (err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError")) {
      errorMessage = `Upload gagal: Tidak dapat menghubungi server VPS di ${endpoint}. Periksa status VPS.`;
    }

    console.error("Upload to VPS failed:", errorMessage);
    notifyUploadError(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Upload multiple files to server.
 */
export async function uploadMultipleFilesToServer(
  files: File[],
  folder: string = "media"
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  files.forEach((f) => formData.append("files", f, f.name));
  formData.append("folder", folder);

  const baseEndpoint = getUploadEndpoint();
  const endpoint = baseEndpoint.endsWith("/multiple") ? baseEndpoint : `${baseEndpoint}/multiple`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch {
      // ignore
    }
  }, UPLOAD_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data.map((item: any) => item.url || item.relativeUrl);
      }
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn("Batch upload endpoint failed, trying sequential single upload:", err);
  }

  // Sequential upload fallback to uploadFileToServer (which strictly pushes to VPS)
  const results: string[] = [];
  for (const f of files) {
    const url = await uploadFileToServer(f, folder);
    results.push(url);
  }
  return results;
}

/**
 * Check if an image URL was a manual upload (e.g. products, services, articles)
 * and NOT an asset managed by the Media Library or external URL.
 */
export function isManualUploadUrl(fileUrl?: string | null): boolean {
  if (!fileUrl) return false;
  const trimmed = fileUrl.trim();

  // Ignore local blob/data URLs and external placeholder URLs
  if (
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    trimmed.includes("images.unsplash.com")
  ) {
    return false;
  }

  // Never delete media library items when unlinked from products or services
  if (trimmed.includes("/uploads/media/") || trimmed.includes("/media/")) {
    return false;
  }

  // Dedicated manual upload folders
  if (
    trimmed.includes("/uploads/products/") ||
    trimmed.includes("/uploads/services/") ||
    trimmed.includes("/uploads/articles/") ||
    trimmed.includes("/products/") ||
    trimmed.includes("/services/") ||
    trimmed.includes("/articles/")
  ) {
    return true;
  }

  return false;
}

/**
 * Delete uploaded file from server disk.
 */
export async function deleteFileFromServer(fileUrl: string): Promise<boolean> {
  if (!fileUrl) return false;

  // Don't attempt to delete blob: or external placeholder URLs from disk
  if (fileUrl.startsWith("blob:") || fileUrl.startsWith("data:") || fileUrl.includes("images.unsplash.com")) {
    return true;
  }

  const endpoint = getUploadEndpoint();
  try {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: fileUrl }),
    });
    return res.ok;
  } catch (err) {
    console.warn("Delete file from server request failed:", err);
    return false;
  }
}
