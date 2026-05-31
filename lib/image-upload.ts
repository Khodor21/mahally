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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Validate a single file before upload
 */
function validateFile(file: File): string | null {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.";
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" is too large. Maximum size is 5MB.`;
  }

  if (file.size === 0) {
    return `File "${file.name}" is empty.`;
  }

  return null; // Valid
}

/**
 * Upload one or more images to the server
 * @param files - Array of File objects to upload
 * @returns Promise with uploaded URLs and paths
 */
export async function uploadImages(files: File[]): Promise<UploadResult> {
  // Validate files before upload
  for (const file of files) {
    const error = validateFile(file);
    if (error) {
      throw new Error(error);
    }
  }

  // Create FormData
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  // Upload to server
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
      // Join all segments after bucket name
      return pathSegments.slice(bucketIndex + 1).join("/");
    }

    return null;
  } catch {
    return null;
  }
}
