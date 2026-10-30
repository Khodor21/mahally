/**
 * Secure Image Upload Helper
 * Handles client-side image upload with validation and error handling
 */

export interface UploadResult {
  urls: string[];
  paths: string[];
  count: number;
}

export interface UploadError {
  success: false;
  message: string;
}

// ─── Client-Side Validation ───────────────────────────────────────────────────
const MAX_FILE_SIZE = 400 * 1024; // 400KB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ─── Client-Side Resize ───────────────────────────────────────────────────────
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;

async function resizeImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;

      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve(file);
        return;
      }

      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      const newWidth = Math.round(width * ratio);
      const newHeight = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

/**
 * Validate a single file before upload
 */
function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" is too large. Maximum size is 400KB.`;
  }

  if (file.size === 0) {
    return `File "${file.name}" is empty.`;
  }

  return null;
}

/**
 * Upload one or more images to the server
 * @param files - Array of File objects to upload
 * @returns Promise with uploaded URLs and paths
 */
export async function uploadImages(files: File[]): Promise<UploadResult> {
  // Resize first
  const resized = await Promise.all(files.map(resizeImage));

  // Validate after resize
  for (const file of resized) {
    const error = validateFile(file);
    if (error) throw new Error(error);
  }

  const formData = new FormData();
  resized.forEach((file) => formData.append("files", file));

  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to upload images");
  }

  return {
    urls: json.urls,
    paths: json.paths,
    count: json.count,
  };
}

/**
 * Delete an image from storage
 * @param path - The storage path of the image (returned from upload)
 */
export async function deleteImage(path: string): Promise<void> {
  const res = await fetch(
    `/api/upload-image?path=${encodeURIComponent(path)}`,
    {
      method: "DELETE",
    },
  );

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to delete image");
  }
}

/**
 * Helper to extract path from Supabase public URL
 * Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
 */
export function extractPathFromUrl(
  url: string,
  bucketName: string = "Mahally Images",
): string | null {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/");
    const bucketIndex = pathSegments.indexOf(bucketName);

    if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
      return pathSegments.slice(bucketIndex + 1).join("/");
    }

    return null;
  } catch {
    return null;
  }
}
