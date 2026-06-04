// Database Types representing the Supabase Schema

export type UserRole = "buyer" | "seller" | "admin";
export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";
export type ModerationStatus = "pending_review" | "approved" | "rejected" | "hidden";
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
  rejection_reason: string | null;
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
  moderation_status: ModerationStatus;
  rejection_reason: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations mapped by Supabase joins
  categories?: Category | null;
  sellers?: Seller;
  product_images?: ProductImage[];
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  address_id: string | null;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  buyer_name?: string | null;
  buyer_email?: string | null;
  buyer_phone?: string | null;
  shipping_address_json?: Address | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  seller_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Extended types with Supabase joins for display

export interface OrderItemWithDetails extends OrderItem {
  products: {
    name: string;
    slug: string;
    product_images: { image_url: string; is_primary: boolean }[];
  } | null;
  sellers: {
    store_name: string;
  } | null;
}

export interface OrderWithItems extends Order {
  order_items: OrderItemWithDetails[];
  addresses: Address | null;
}

export interface SellerOrderItem extends OrderItem {
  products: {
    name: string;
    slug: string;
    product_images: { image_url: string; is_primary: boolean }[];
  } | null;
  orders: {
    id: string;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    created_at: string;
    total_amount: number;
    profiles: {
      full_name: string | null;
    } | null;
  } | null;
}
