// ============================================================================
// FILE: lib/utils/validation.ts
// Centralized validation utilities + Zod schemas
// ============================================================================

import { z } from "zod";

// ============================================================================
// SECTION 1 — Generic Form Validation Utilities (non-Zod)
// These are still used in login / register / profile forms
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email) return { isValid: false, error: "Email is required" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { isValid: false, error: "Password is required" };

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone) return { isValid: true }; // Phone is optional

  const phoneRegex = /^9\d{9}$/; // Nepal 10-digit phone
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      error: "Invalid phone number (must be 10 digits starting with 9)",
    };
  }

  return { isValid: true };
}

export function validateRequired(
  value: string,
  fieldName: string
): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  return { isValid: true };
}

// ============================================================================
// SECTION 2 — ZOD SCHEMAS FOR COMPLEX FORMS (React-Hook-Form Integration)
// ============================================================================

/**
 * Complaint Schema
 * Matches your NEW multi-step form & backend API requirements
 */
export const complaintSchema = z.object({
  category_id: z.string().min(1, "Please select a category"),
  subcategory_id: z.string().optional(),

  ward_id: z.string().min(1, "Please select your ward"),

  title: z
    .string()
    .min(10, "Title must be at least 10 characters long")
    .max(200, "Title cannot exceed 200 characters")
    .refine(
      (v) => v.trim().length >= 10,
      "Title must contain meaningful content"
    ),

  description: z
    .string()
    .min(50, "Description must be at least 50 characters long")
    .max(2000, "Description cannot exceed 2000 characters")
    .refine(
      (v) => v.trim().length >= 50,
      "Description must contain meaningful content"
    ),

  address_text: z.string().max(500, "Address too long").optional(),
  landmark: z.string().max(200, "Landmark too long").optional(),

  attachments: z
    .array(z.instanceof(File))
    .max(5, "You can upload a maximum of 5 files")
    .optional()
    .refine(
      (files) =>
        !files || files.every((file) => file.size <= 10 * 1024 * 1024),
      "Each file must be less than 10MB"
    )
    .refine(
      (files) => {
        if (!files) return true;
        const allowed = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "application/pdf",
        ];
        return files.every((file) => allowed.includes(file.type));
      },
      "Only images (JPEG, PNG, WebP, GIF) and PDF files are allowed"
    ),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;

/**
 * Feedback Schema
 */
export const feedbackSchema = z.object({
  rating: z
    .number()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5"),

  feedback: z.string().max(1000, "Feedback too long").optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

// ============================================================================
// END OF FILE
// ============================================================================
