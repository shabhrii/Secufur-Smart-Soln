// Database Types representing the Supabase Schema

export type UserRole = "buyer" | "seller" | "admin";
export type SellerStatus = "pending" | "approved" | "rejected";
export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Seller {
  id: string;
  user_id: string;
  store_name: string;
  business_name: string | null;
  business_type: string | null;
  tax_id: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: SellerStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  sku: string | null;
  status: ProductStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations mapped by Supabase joins
  categories?: Category | null;
  sellers?: Seller;
  product_images?: ProductImage[];
}
