"use client";

/**
 * Hook to get correct image path considering Next.js basePath
 */
export function useImagePath(relativePath: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}${relativePath}`;
}
