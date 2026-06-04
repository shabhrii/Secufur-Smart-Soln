import { DashboardShell } from "@/components/shared/dashboard-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { UsersTable } from "@/components/admin/users-table";
import { getAdminUsers } from "@/services/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { UsersPageClient } from "./client";

export default async function AdminUsersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; role?: string }> 
}) {
  const params = await searchParams;
  const query = params.query || "";
  const role = params.role || "all";

  const users = await getAdminUsers(query, role);
  
  // Get current user to prevent self-suspension
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <DashboardShell>
      <SectionHeader
        title="User Management"
        description="View and manage all platform users, roles, and account status."
      />
      
      <UsersPageClient initialQuery={query} initialRole={role} />
      
      <div className="grid gap-4 mt-6">
        <UsersTable users={users} currentUserId={user?.id} />
      </div>
    </DashboardShell>
  );
}
