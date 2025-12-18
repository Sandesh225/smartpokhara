import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters" })
      .regex(/^[a-zA-Z\s]*$/, {
        message: "Name should only contain letters and spaces",
      }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z
      .string()
      .regex(/^(\+977)?[9][6-9]\d{8}$/, {
        message: "Please enter a valid Nepali mobile number",
      })
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must contain an uppercase letter" })
      .regex(/[a-z]/, { message: "Must contain a lowercase letter" })
      .regex(/[0-9]/, { message: "Must contain a number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;