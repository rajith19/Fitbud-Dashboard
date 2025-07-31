// src/utils/validation.ts

import type { FormErrors, AuthFormData } from "@/types";

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation requirements
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

/**
 * Validate email format
 */
export function validateEmail(email: string): string | undefined {
  if (!email) {
    return "Email is required";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address";
  }
  return undefined;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Password is required";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!PASSWORD_REGEX.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
  }
  return undefined;
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return undefined;
}

/**
 * Validate full name
 */
export function validateFullName(fullName: string): string | undefined {
  if (!fullName) {
    return "Full name is required";
  }
  if (fullName.trim().length < 2) {
    return "Full name must be at least 2 characters long";
  }
  if (fullName.trim().length > 100) {
    return "Full name must be less than 100 characters";
  }
  return undefined;
}

/**
 * Validate user role
 */
export function validateRole(role: string): string | undefined {
  const validRoles = ["admin", "moderator", "user"];
  if (!role) {
    return "Role is required";
  }
  if (!validRoles.includes(role)) {
    return "Please select a valid role";
  }
  return undefined;
}

/**
 * Comprehensive form validation for authentication forms
 */
export function validateAuthForm(
  data: AuthFormData,
  isSignUp: boolean = false
): FormErrors {
  const errors: FormErrors = {};

  // Email validation
  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }

  // Password validation
  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  // Password confirmation validation (only for sign up)
  if (isSignUp && data.confirmPassword !== undefined) {
    const confirmPasswordError = validatePasswordConfirmation(
      data.password,
      data.confirmPassword
    );
    if (confirmPasswordError) {
      errors.confirmPassword = confirmPasswordError;
    }
  }

  // Full name validation (only for sign up)
  if (isSignUp && data.full_name !== undefined) {
    const fullNameError = validateFullName(data.full_name);
    if (fullNameError) {
      errors.full_name = fullNameError;
    }
  }

  return errors;
}

/**
 * Check if form has any validation errors
 */
export function hasFormErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((error) => error !== undefined);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Validate block reason
 */
export function validateBlockReason(reason: string): string | undefined {
  if (reason && reason.length > 500) {
    return "Block reason must be less than 500 characters";
  }
  return undefined;
}
