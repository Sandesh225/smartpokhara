import * as z from "zod";

export const formSchema = z.object({
  title: z.string().min(5, "Title is too short").max(100),
  category_id: z.string().min(1, "Please select a category"),
  subcategory_id: z.string().optional().nullable(),
  priority: z.enum(["critical", "urgent", "high", "medium", "low"]).default("medium"),
  is_anonymous: z.boolean().default(false),
  ward_id: z.string().min(1, "Please select a ward"),
  address_text: z.string().min(5, "Address is required"),
  landmark: z.string().optional().nullable(),
  location_point: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }).nullable(),
  description: z.string().min(20, "Please provide more details"),
});

export type FormData = z.infer<typeof formSchema>;