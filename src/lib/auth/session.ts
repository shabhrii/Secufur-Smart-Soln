import { createClient } from "@/lib/supabase/server";
import { type Session, type User } from "@/types/auth";

export async function getServerSession(): Promise<Session> {
  const supabase = await createClient();
  
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return { user: null, accessToken: null };
    }
    
    // Attempt to fetch profile for role mapping
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
      
    const user: User = {
      id: session.user.id,
      email: session.user.email!,
      role: profile?.role || "BUYER",
      createdAt: session.user.created_at,
      updatedAt: session.user.updated_at || session.user.created_at,
    };
    
    return {
      user,
      accessToken: session.access_token,
    };
  } catch (error) {
    console.error("Error fetching server session:", error);
    return { user: null, accessToken: null };
  }
}
