"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SellerStatus, ModerationStatus } from "@/types/database";

/**
 * Validates if the current user is an admin.
 * Throws an error if not authorized.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  
  return supabase;
}

export async function getDashboardStats() {
  const supabase = await requireAdmin();

  const [
    { count: usersCount },
    { count: buyersCount },
    { count: sellersCount },
    { count: activeSellersCount },
    { count: pendingSellersCount },
    { count: pendingProductsCount },
    { count: totalOrdersCount }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "buyer"),
    supabase.from("sellers").select("*", { count: "exact", head: true }),
    supabase.from("sellers").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("sellers").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("moderation_status", "pending_review"),
    supabase.from("orders").select("*", { count: "exact", head: true })
  ]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count: approvedTodayCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("moderation_status", "approved")
    .gte("updated_at", startOfDay.toISOString());

  // GMV Calculation with Pagination to bypass 1000 limit
  let gmv = 0;
  let hasMore = true;
  let page = 0;
  const pageSize = 1000;

  while (hasMore) {
    const { data: pageOrders, error } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      console.error("Error fetching orders for GMV:", error);
      hasMore = false;
      break;
    }

    if (pageOrders && pageOrders.length > 0) {
      gmv += pageOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
      
      if (pageOrders.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  // Revenue Calculation
  let commissionPercentage = 10.0;
  const { data: settings } = await supabase
    .from("marketplace_settings")
    .select("commission_percentage")
    .eq("id", 1)
    .maybeSingle();
    
  if (settings?.commission_percentage) {
    commissionPercentage = Number(settings.commission_percentage);
  }

  const totalRevenue = gmv * (commissionPercentage / 100);

  return {
    gmv,
    totalRevenue,
    totalOrders: totalOrdersCount || 0,
    usersCount: usersCount || 0,
    buyersCount: buyersCount || 0,
    sellersCount: sellersCount || 0,
    activeSellersCount: activeSellersCount || 0,
    pendingProductsCount: pendingProductsCount || 0,
    pendingFlagsCount: (pendingSellersCount || 0) + (pendingProductsCount || 0),
    productsApprovedToday: approvedTodayCount || 0
  };
}

export async function getPendingSellers() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("sellers")
    .select(`
      id,
      store_name,
      business_type,
      created_at
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);
    
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSellerStatus(sellerId: string, status: SellerStatus, reason?: string) {
  const supabase = await requireAdmin();
  
  const updateData: any = { status };
  if (reason !== undefined) {
    updateData.rejection_reason = reason;
  }

  const { error } = await supabase
    .from("sellers")
    .update(updateData)
    .eq("id", sellerId);

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/sellers");
}

export async function getAdminProducts(status?: string, sellerId?: string) {
  const supabase = await requireAdmin();
  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      moderation_status,
      created_at,
      sellers ( store_name ),
      product_images ( image_url, is_primary )
    `)
    .order("created_at", { ascending: false })
    .limit(50);
    
  if (status && status !== "all") {
    query = query.eq("moderation_status", status);
  } else if (!status) {
    query = query.eq("moderation_status", "pending_review");
  }

  if (sellerId) {
    query = query.eq("seller_id", sellerId);
  }
    
  const { data, error } = await query;
    
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProductModerationStatus(productId: string, status: ModerationStatus, reason?: string) {
  const supabase = await requireAdmin();
  
  const updateData: any = { moderation_status: status };
  if (reason !== undefined) {
    updateData.rejection_reason = reason;
  }

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", productId);

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/products");
}

export async function getAdminOrders() {
  const supabase = await requireAdmin();
  
  // Note: the existing Order type expects full profile/seller relations.
  // We'll fetch basic order info first to construct the overview.
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      order_status,
      payment_status,
      created_at,
      profiles ( full_name )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data;
}

export async function getApprovedSellers() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("sellers")
    .select(`
      id,
      store_name,
      business_type,
      status,
      created_at,
      profiles ( full_name ),
      products ( id )
    `)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(100);
    
  if (error) throw new Error(error.message);
  
  // Map the results to include a product count
  return data.map((seller: any) => ({
    ...seller,
    product_count: seller.products ? seller.products.length : 0
  }));
}

export async function getSuspendedSellers() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("sellers")
    .select(`
      id,
      store_name,
      business_type,
      status,
      rejection_reason,
      updated_at,
      profiles ( full_name )
    `)
    .eq("status", "suspended")
    .order("updated_at", { ascending: false })
    .limit(100);
    
  if (error) throw new Error(error.message);
  return data;
}

export async function suspendSeller(sellerId: string, reason: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("sellers")
    .update({ 
      status: "suspended",
      rejection_reason: reason
    })
    .eq("id", sellerId);

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/sellers");
}

export async function restoreSeller(sellerId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("sellers")
    .update({ 
      status: "approved",
      rejection_reason: null
    })
    .eq("id", sellerId);

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/sellers");
}

export async function getSellerDetails(sellerId: string) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("sellers")
    .select(`
      id,
      store_name,
      business_type,
      status,
      created_at,
      profiles ( id, full_name, email ),
      products ( id, name, price, moderation_status, created_at ),
      order_items ( order_id )
    `)
    .eq("id", sellerId)
    .single();

  if (error) throw new Error(error.message);
  
  // Calculate unique order count
  const orderCount = data.order_items ? new Set(data.order_items.map((item: any) => item.order_id)).size : 0;
  
  return {
    ...data,
    orderCount
  };
}

// User Management Actions

function getAdminClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getAdminUsers(query?: string, roleFilter?: string) {
  await requireAdmin();
  const adminClient = getAdminClient();

  const { data: { users }, error: authError } = await adminClient.auth.admin.listUsers();
  if (authError) throw new Error(authError.message);

  const { data: profiles, error: profileError } = await adminClient.from("profiles").select("*");
  if (profileError) throw new Error(profileError.message);

  let mergedUsers = users.map((user: any) => {
    const profile = profiles.find((p: any) => p.id === user.id);
    return {
      id: user.id,
      email: user.email,
      name: profile?.full_name || "Unknown",
      role: profile?.role || "buyer",
      joined: user.created_at,
      status: user.banned_until ? "suspended" : "active"
    };
  });

  if (query) {
    const q = query.toLowerCase();
    mergedUsers = mergedUsers.filter((u: any) => 
      u.name.toLowerCase().includes(q) || 
      (u.email && u.email.toLowerCase().includes(q))
    );
  }

  if (roleFilter && roleFilter !== "all") {
    mergedUsers = mergedUsers.filter((u: any) => u.role === roleFilter);
  }

  return mergedUsers;
}

export async function suspendUser(userId: string) {
  const supabase = await requireAdmin();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  if (currentUser?.id === userId) {
    throw new Error("You cannot suspend your own account.");
  }
  
  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/users");
}

export async function reactivateUser(userId: string) {
  await requireAdmin();
  
  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/users");
}
