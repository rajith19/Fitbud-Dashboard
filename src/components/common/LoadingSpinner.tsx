// src/components/common/LoadingSpinner.tsx
"use client";

import { cn } from "@/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function LoadingSpinner({ 
  size = "md", 
  className, 
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400",
            sizeClasses[size]
          )}
        />
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Skeleton loading component for content placeholders
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-gray-200 dark:bg-gray-700 rounded",
            i === lines - 1 ? "w-3/4" : "w-full",
            lines > 1 ? "h-4 mb-2" : "h-4"
          )}
        />
      ))}
    </div>
  );
}

// Table skeleton for loading tables
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Card skeleton for loading cards
export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  );
}
