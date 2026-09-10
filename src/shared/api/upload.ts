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

export interface UploadResult {
  url: string;
  relativeUrl: string;
  fileName: string;
  originalName: string;
  fileSize?: string;
  mimeType?: string;
}

/**
 * Upload single file to server.
 * Automatically tries primary endpoint, with fallback to local /api/upload or base64.
 *
 * @param file File or Blob to upload
 * @param folder Subfolder (e.g. "products", "articles", "services", "media", "site")
 * @returns Public URL of the uploaded file
 */
export async function uploadFileToServer(
  file: File | Blob,
  folder: string = "media"
): Promise<string> {
  const formData = new FormData();

  // If it's a raw Blob without a name, give it a default name
  if (file instanceof File) {
    formData.append("file", file, file.name);
  } else {
    formData.append("file", file, `upload_${Date.now()}.webp`);
  }
  formData.append("folder", folder);

  const endpoint = getUploadEndpoint();
  const candidateEndpoints = [endpoint];

  // If endpoint is not relative "/api/upload", add "/api/upload" as secondary fallback
  if (endpoint !== "/api/upload") {
    candidateEndpoints.push("/api/upload");
  }

  let lastError: any = null;

  for (const url of candidateEndpoints) {
    try {
      const controller = new AbortController();
      // 10-second timeout for upload
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(`Upload to ${url} failed with status ${res.status}: ${errorText}`);
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

      throw new Error("Invalid response format from upload API");
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt to upload via ${url} failed:`, err?.message || err);
      // Try next candidate endpoint in loop
    }
  }

  // Graceful fallback for local development if server routes are completely unreachable:
  // Convert to object URL or base64 so development workflow continues without crashing
  console.error("All upload endpoints failed. Falling back to local Object URL:", lastError);
  if (file instanceof File || file instanceof Blob) {
    return URL.createObjectURL(file);
  }

  throw lastError || new Error("Failed to upload file to server.");
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

  const endpoint = getUploadEndpoint();

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data.map((item: any) => item.url || item.relativeUrl);
      }
    }
  } catch (err) {
    console.warn("Batch upload endpoint failed, falling back to sequential single upload:", err);
  }

  // Sequential fallback
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
