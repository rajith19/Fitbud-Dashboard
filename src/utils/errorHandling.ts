// src/utils/errorHandling.ts

import { AuthError } from "@supabase/supabase-js";
import toast from "react-hot-toast";

/**
 * Custom error types
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Parse Supabase auth errors into user-friendly messages
 */
export function parseAuthError(error: AuthError): string {
  switch (error.message) {
    case "Invalid login credentials":
      return "Invalid email or password. Please check your credentials and try again.";
    case "Email not confirmed":
      return "Please check your email and click the confirmation link before signing in.";
    case "User already registered":
      return "An account with this email already exists. Please sign in instead.";
    case "Password should be at least 6 characters":
      return "Password must be at least 6 characters long.";
    case "Signup requires a valid password":
      return "Please enter a valid password.";
    case "Invalid email":
      return "Please enter a valid email address.";
    case "Email rate limit exceeded":
      return "Too many email requests. Please wait a few minutes before trying again.";
    case "Token has expired or is invalid":
      return "Your session has expired. Please sign in again.";
    default:
      return error.message || "An authentication error occurred. Please try again.";
  }
}

/**
 * Parse general API errors
 */
export function parseApiError(error: unknown): string {
  if (error instanceof AuthError) {
    return parseAuthError(error);
  }

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Handle errors with toast notifications
 */
export function handleError(error: unknown, customMessage?: string): void {
  const message = customMessage || parseApiError(error);
  toast.error(message);
  console.error("Error:", error);
}

/**
 * Handle success with toast notifications
 */
export function handleSuccess(message: string): void {
  toast.success(message);
}

/**
 * Async error wrapper for better error handling
 */
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, errorMessage);
    return null;
  }
}

/**
 * Retry mechanism for failed operations
 */
export async function withRetry<T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("connection")
    );
  }
  return false;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("rate limit") ||
      error.message.includes("too many requests")
    );
  }
  return false;
}

/**
 * Log errors for debugging (in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 Error${context ? ` in ${context}` : ""}`);
    console.error(error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    console.groupEnd();
  }
}
