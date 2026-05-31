import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  category_id: z.string().min(1, "Category is required"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  compare_at_price: z.coerce.number().optional().nullable(),
  stock_quantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).default("active"),
  featured: z.boolean().default(false),
  images: z.array(z.string().url()).optional()
});

export type ProductFormValues = z.infer<typeof productSchema>;