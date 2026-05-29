import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const buyerRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type BuyerRegisterInput = z.infer<typeof buyerRegisterSchema>;

export const sellerRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  storeName: z.string().min(2, "Store name is required."),
  businessName: z.string().min(2, "Business name is required."),
  businessType: z.string().min(2, "Business type is required."),
  taxId: z.string().min(2, "Tax ID is required."),
});

export type SellerRegisterInput = z.infer<typeof sellerRegisterSchema>;

export const upgradeSellerSchema = z.object({
  storeName: z.string().min(2, "Store name is required."),
  businessName: z.string().min(2, "Business name is required."),
  businessType: z.string().min(2, "Business type is required."),
  taxId: z.string().min(2, "Tax ID is required."),
});

export type UpgradeSellerInput = z.infer<typeof upgradeSellerSchema>;
