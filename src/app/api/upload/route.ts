import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir, unlink, stat } from "fs/promises";
import fsSync from "fs";
import path from "path";

/**
 * Format bytes to readable size string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Clean and sanitize folder name to prevent directory traversal
 */
function sanitizeFolder(folder?: string | null): string {
  if (!folder) return "media";
  const cleaned = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || "media";
}

/**
 * Clean filename and ensure safe characters
 */
function sanitizeFileName(fileName: string): string {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  const safeBase = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  return `${safeBase}${ext.toLowerCase()}`;
}

/**
 * Resolve target filesystem directory for uploads.
 * Handles:
 * - Explicit UPLOAD_DIR env variable
 * - Running from /home/ideatecore/client/dps (parent repo root containing dps-cms)
 * - Standard Next.js project root (dps-cms)
 */
function getUploadTargetDir(folder: string): { diskDir: string; publicSubPath: string } {
  const cleanFolder = sanitizeFolder(folder);
  const publicSubPath = path.join("uploads", cleanFolder);

  // 1. Explicit environment variable override
  if (process.env.UPLOAD_DIR) {
    const customClean = process.env.UPLOAD_DIR.replace(/^\[|\]$/g, "").trim();
    return {
      diskDir: path.resolve(customClean, cleanFolder),
      publicSubPath,
    };
  }

  // 2. Running from repo root where dps-cms is a subdirectory (e.g. /home/ideatecore/client/dps)
  const candidateSubdir = path.join(process.cwd(), "dps-cms", "public");
  if (fsSync.existsSync(candidateSubdir)) {
    return {
      diskDir: path.join(candidateSubdir, publicSubPath),
      publicSubPath,
    };
  }

  // 3. Standard Next.js root (e.g. process.cwd() is dps-cms)
  return {
    diskDir: path.join(process.cwd(), "public", publicSubPath),
    publicSubPath,
  };
}

/**
 * Determine external base URL for serving uploaded static files
 */
function getBaseUrl(request: NextRequest): string {
  // Check NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BASE_URL first
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/^\[|\]$/g, "").trim();
  if (envApiUrl) {
    try {
      const parsed = new URL(envApiUrl);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      // Ignore invalid URL parse
    }
  }

  // Fallback to request host headers
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * CORS headers helper
 */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/**
 * POST /api/upload
 * Handles single or multiple file uploads via multipart/form-data
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const folder = (formData.get("folder") as string) || "media";

    // Collect files from either 'file' or 'files'
    const files: File[] = [];
    const singleFile = formData.get("file");
    if (singleFile instanceof File) {
      files.push(singleFile);
    }

    const multipleFiles = formData.getAll("files");
    for (const item of multipleFiles) {
      if (item instanceof File) {
        files.push(item);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files found in request" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { diskDir, publicSubPath } = getUploadTargetDir(folder);

    // Ensure upload directory exists
    await mkdir(diskDir, { recursive: true });

    const baseUrl = getBaseUrl(request);
    const uploadedResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());

      const rawName = file.name || `upload_${Date.now()}_${i}.bin`;
      const cleanOriginal = sanitizeFileName(rawName);
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanOriginal}`;

      const filePath = path.join(diskDir, uniqueName);
      await writeFile(filePath, buffer);

      // Web-accessible URL path (normalized with forward slashes)
      const webPath = `/${publicSubPath.replace(/\\/g, "/")}/${uniqueName}`;
      const fullUrl = `${baseUrl}${webPath}`;

      uploadedResults.push({
        url: fullUrl,
        relativeUrl: webPath,
        fileName: uniqueName,
        originalName: rawName,
        fileSize: formatBytes(buffer.length),
        mimeType: file.type || "application/octet-stream",
      });
    }

    // Return single object if 1 file was uploaded via 'file', otherwise array
    if (files.length === 1 && !formData.has("files")) {
      return NextResponse.json(
        {
          success: true,
          ...uploadedResults[0],
        },
        { headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: uploadedResults,
        count: uploadedResults.length,
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error("Error in /api/upload POST handler:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process file upload",
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * DELETE /api/upload
 * Removes an uploaded file from disk
 */
export async function DELETE(request: NextRequest) {
  try {
    let targetUrl = "";

    // Check query params
    const searchUrl = request.nextUrl.searchParams.get("url");
    if (searchUrl) {
      targetUrl = searchUrl;
    } else {
      // Check JSON body
      try {
        const body = await request.json();
        targetUrl = body.url || body.filePath || "";
      } catch {
        // Body may be empty
      }
    }

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: "Missing 'url' parameter" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Extract path starting from /uploads/
    const uploadsIndex = targetUrl.indexOf("/uploads/");
    if (uploadsIndex === -1) {
      // Not a local uploads file or cannot be safely removed
      return NextResponse.json(
        { success: true, message: "URL is external or not a local upload, ignored" },
        { headers: corsHeaders() }
      );
    }

    const relativeUploadsPath = targetUrl.substring(uploadsIndex + 1); // e.g. "uploads/media/file.webp"

    // Prevent path traversal
    const safeRelative = path.normalize(relativeUploadsPath).replace(/^(\.\.[\/\\])+/, "");

    // Resolve target on disk
    const candidateSubdir = path.join(process.cwd(), "dps-cms", "public");
    let fullDiskPath = path.join(process.cwd(), "public", safeRelative);
    if (fsSync.existsSync(candidateSubdir)) {
      fullDiskPath = path.join(candidateSubdir, safeRelative);
    }

    if (fsSync.existsSync(fullDiskPath)) {
      await unlink(fullDiskPath);
      return NextResponse.json(
        { success: true, message: "File deleted successfully" },
        { headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, message: "File not found on disk, reference cleared" },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error("Error in /api/upload DELETE handler:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete file" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
