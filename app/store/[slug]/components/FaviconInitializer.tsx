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
      setFaviconDirectly("/default-favicon.ico", "/default-favicon.ico");
      return;
    }

    // Create an image to detect dimensions
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { width, height } = img;
      const aspectRatio = width / height;
      const isSquare = Math.abs(aspectRatio - 1) < 0.1;

      if (isSquare) {
        // Use logo directly for square logos
        setFaviconDirectly(logoUrl, logoUrl);
      } else {
        // For wide/tall logos, create a square canvas crop
        createAndSetSquareFavicon(img, logoUrl);
      }
    };

    img.onerror = () => {
      setFaviconDirectly("/default-favicon.ico", "/default-favicon.ico");
    };

    img.src = logoUrl;
  }, [logoUrl]);

  function setFaviconDirectly(iconUrl: string, appleTouchUrl: string) {
    // Update existing favicon links instead of creating/removing them
    let iconLink = document.querySelector(
      'link[rel="icon"]',
    ) as HTMLLinkElement | null;
    if (!iconLink) {
      iconLink = document.createElement("link");
      iconLink.rel = "icon";
      document.head.appendChild(iconLink);
    }
    iconLink.href = iconUrl;

    let appleLink = document.querySelector(
      'link[rel="apple-touch-icon"]',
    ) as HTMLLinkElement | null;
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      appleLink.sizes = "180x180";
      document.head.appendChild(appleLink);
    }
    appleLink.href = appleTouchUrl;
  }

  function createAndSetSquareFavicon(img: HTMLImageElement, logoUrl: string) {
    const canvas = document.createElement("canvas");
    const size = 192;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const imgWidth = img.width;
    const imgHeight = img.height;
    const minDim = Math.min(imgWidth, imgHeight);

    const srcX = imgWidth > imgHeight ? (imgWidth - minDim) / 2 : 0;
    const srcY = imgHeight > imgWidth ? (imgHeight - minDim) / 2 : 0;

    ctx.drawImage(img, srcX, srcY, minDim, minDim, 0, 0, size, size);

    canvas.toBlob((blob) => {
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        setFaviconDirectly(blobUrl, blobUrl);
      }
    });
  }

  return null;
}
