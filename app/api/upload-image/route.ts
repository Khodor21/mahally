// app/api/upload-image/route.ts (or equivalent path)
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/store";
import crypto from "crypto";

// ─── Security Constants ───────────────────────────────────────────────────────
const MAX_FILE_SIZE = 400 * 1024;
const MAX_FILES_PER_REQUEST = 7;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"] as const;

// Rate limiting map (in-memory - use Redis in production)
const uploadRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_UPLOADS_PER_MINUTE = 10;

// ─── Image Validation ─────────────────────────────────────────────────────────
function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as any);
}

function validateFileExtension(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ? ALLOWED_EXTENSIONS.includes(ext as any) : false;
}

function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts and special characters
  return filename
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 100); // Limit filename length
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = uploadRateLimit.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    uploadRateLimit.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= MAX_UPLOADS_PER_MINUTE) {
    return false;
  }

  userLimit.count += 1;
  return true;
}

// ─── POST: Upload Images ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await requireStoreSession();

    // 2. Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many upload requests. Please wait a moment.",
        },
        { status: 429 },
      );
    }

    // 3. Parse form data
    const formData = await req.formData();

    // Support both "file" (singular, sent by current frontend) and "files" (plural)
    const singularFiles = formData.getAll("file") as File[];
    const pluralFiles = formData.getAll("files") as File[];
    const files = [...singularFiles, ...pluralFiles];

    // 4. Validate request
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files provided" },
        { status: 400 },
      );
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${MAX_FILES_PER_REQUEST} files allowed per request`,
        },
        { status: 400 },
      );
    }

    // 5. Process each file
    const uploadedUrls: string[] = [];
    const uploadedPaths: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!validateMimeType(file.type)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid file type: ${file.name}. Only JPEG, PNG, WebP, and GIF are allowed.`,
          },
          { status: 400 },
        );
      }

      // Validate file extension
      if (!validateFileExtension(file.name)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid file extension: ${file.name}`,
          },
          { status: 400 },
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: `File too large: ${file.name}. Maximum size is 400KB.`,
          },
          { status: 400 },
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Empty file: ${file.name}`,
          },
          { status: 400 },
        );
      }

      // Generate secure filename
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const randomBytes = crypto.randomBytes(16).toString("hex");
      const timestamp = Date.now();
      const secureFileName = sanitizeFilename(
        `${timestamp}-${randomBytes}.${fileExt}`,
      );

      // Create path: {storeId}/{secureFileName}
      const filePath = `${user.id}/${secureFileName}`;

      // Convert File to ArrayBuffer then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Supabase Storage (using admin client - bypasses RLS)
      const { data, error } = await supabaseAdmin.storage
        .from("Mahally Images") // Replace with your actual bucket name
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
          cacheControl: "3600", // Cache for 1 hour
        });

      if (error) {
        console.error("Supabase upload error:", error);

        // Clean up any previously uploaded files in this batch
        if (uploadedPaths.length > 0) {
          await supabaseAdmin.storage
            .from("Mahally Images")
            .remove(uploadedPaths);
        }

        return NextResponse.json(
          {
            success: false,
            message: `Failed to upload ${file.name}: ${error.message}`,
          },
          { status: 500 },
        );
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from("Mahally Images")
        .getPublicUrl(data.path);

      uploadedUrls.push(urlData.publicUrl);
      uploadedPaths.push(data.path);
    }

    // 6. Return success response
    return NextResponse.json({
      success: true,
      url: uploadedUrls[0], // Added for frontend compatibility (SettingsPanel.tsx expects data.url)
      urls: uploadedUrls,
      paths: uploadedPaths,
      count: uploadedUrls.length,
    });
  } catch (err: any) {
    console.error("Upload error:", err);

    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      {
        success: false,
        message: isAuth ? "Unauthorized" : "Internal server error",
      },
      { status: isAuth ? 401 : 500 },
    );
  }
}

// ─── DELETE: Remove Image ─────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await requireStoreSession();

    // 2. Get path from query params
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { success: false, message: "No path provided" },
        { status: 400 },
      );
    }

    // 3. Security check: ensure the file belongs to this store
    if (!path.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: You can only delete your own images",
        },
        { status: 403 },
      );
    }

    // 4. Delete from storage
    const { error } = await supabaseAdmin.storage
      .from("Mahally Images")
      .remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete image" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message },
      { status: isAuth ? 401 : 500 },
    );
  }
}
