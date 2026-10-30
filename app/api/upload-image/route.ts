import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";
import { requireStoreSession } from "@/lib/store";
import crypto from "crypto";

const MAX_FILE_SIZE = 400 * 1024;
const MAX_FILES_PER_REQUEST = 7;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"] as const;

const uploadRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_UPLOADS_PER_MINUTE = 10;

function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as any);
}

function validateFileExtension(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ? ALLOWED_EXTENSIONS.includes(ext as any) : false;
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 100);
}

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
  if (userLimit.count >= MAX_UPLOADS_PER_MINUTE) return false;
  userLimit.count += 1;
  return true;
}

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

export async function POST(req: NextRequest) {
  try {
    const user = await requireStoreSession();

    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many upload requests. Please wait a moment.",
        },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const files = [
      ...formData.getAll("file"),
      ...formData.getAll("files"),
    ] as File[];

    if (!files.length) {
      return NextResponse.json(
        { success: false, message: "No files provided" },
        { status: 400 },
      );
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${MAX_FILES_PER_REQUEST} files allowed`,
        },
        { status: 400 },
      );
    }

    const uploadedUrls: string[] = [];
    const uploadedPaths: string[] = [];

    for (const file of files) {
      if (!validateMimeType(file.type)) {
        return NextResponse.json(
          { success: false, message: `Invalid file type: ${file.name}` },
          { status: 400 },
        );
      }

      if (!validateFileExtension(file.name)) {
        return NextResponse.json(
          { success: false, message: `Invalid file extension: ${file.name}` },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: `File too large: ${file.name}. Max 400KB.`,
          },
          { status: 400 },
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          { success: false, message: `Empty file: ${file.name}` },
          { status: 400 },
        );
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const randomBytes = crypto.randomBytes(16).toString("hex");
      const secureFileName = sanitizeFilename(
        `${Date.now()}-${randomBytes}.${fileExt}`,
      );
      const filePath = `${user.id}/${secureFileName}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        await r2Client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: filePath,
            Body: buffer,
            ContentType: file.type,
            CacheControl: "public, max-age=31536000", // 1 سنة — أحسن من Supabase
          }),
        );
      } catch (uploadErr) {
        // cleanup ما رفع قبل
        if (uploadedPaths.length > 0) {
          await Promise.allSettled(
            uploadedPaths.map((p) =>
              r2Client.send(
                new DeleteObjectCommand({ Bucket: BUCKET, Key: p }),
              ),
            ),
          );
        }
        throw uploadErr;
      }

      uploadedUrls.push(`${PUBLIC_URL}/${filePath}`);
      uploadedPaths.push(filePath);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireStoreSession();
    const path = new URL(req.url).searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { success: false, message: "No path provided" },
        { status: 400 },
      );
    }

    if (!path.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: You can only delete your own images",
        },
        { status: 403 },
      );
    }

    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: path }));

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
