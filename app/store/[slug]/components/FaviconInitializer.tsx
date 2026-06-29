"use client";

import { useEffect } from "react";

interface FaviconInitializerProps {
  logoUrl: string | undefined;
}

export default function FaviconInitializer({
  logoUrl,
}: FaviconInitializerProps) {
  useEffect(() => {
    if (!logoUrl) {
      // Set default favicon
      addFavicon("icon", "/default-favicon.ico");
      return;
    }

    // Create an image to detect dimensions
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const aspectRatio = width / height;

      // Detect if squared, wide, or tall
      const isSquare = Math.abs(aspectRatio - 1) < 0.1; // ~square (0.9-1.1)

      // Remove existing favicons
      document
        .querySelectorAll('link[rel="icon"]')
        .forEach((el) => el.remove());
      document
        .querySelectorAll('link[rel="apple-touch-icon"]')
        .forEach((el) => el.remove());

      // Apply favicon based on aspect ratio
      if (isSquare) {
        // Use logo directly for square logos
        addFavicon("icon", logoUrl);
        addFavicon("apple-touch-icon", logoUrl);
      } else {
        // For wide/tall logos, create a square canvas crop
        createAndSetSquareFavicon(img, logoUrl);
      }
    };

    img.onerror = () => {
      // Fallback if image fails to load
      addFavicon("icon", "/default-favicon.ico");
    };

    img.src = logoUrl;

    function addFavicon(rel: string, href: string) {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (rel === "apple-touch-icon") {
        link.sizes = "180x180";
      }
      document.head.appendChild(link);
    }

    function createAndSetSquareFavicon(img: HTMLImageElement, logoUrl: string) {
      const canvas = document.createElement("canvas");
      const size = 192; // Use 192px for favicon
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set background to white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Calculate crop dimensions
      const imgWidth = img.width;
      const imgHeight = img.height;
      const minDim = Math.min(imgWidth, imgHeight);

      // Calculate source crop box (square from center of image)
      const srcX = imgWidth > imgHeight ? (imgWidth - minDim) / 2 : 0;
      const srcY = imgHeight > imgWidth ? (imgHeight - minDim) / 2 : 0;

      // Draw the cropped square image onto canvas
      ctx.drawImage(img, srcX, srcY, minDim, minDim, 0, 0, size, size);

      // Convert canvas to blob and set as favicon
      canvas.toBlob((blob) => {
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          addFavicon("icon", blobUrl);
          addFavicon("apple-touch-icon", blobUrl);
        }
      });
    }
  }, [logoUrl]);

  return null;
}
