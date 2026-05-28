"use client";

import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "@/lib/auth/actions";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { isSeller, isAdmin } from "@/lib/auth/role";

export function UserNav() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="w-20 h-9 animate-pulse bg-muted rounded-md"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        {isSeller(user) && (
          <Link href={ROUTES.SELLER.DASHBOARD} className="text-sm font-medium hover:underline">
            Dashboard
          </Link>
        )}
        {isAdmin(user) && (
          <Link href={ROUTES.ADMIN.DASHBOARD} className="text-sm font-medium hover:underline">
            Admin
          </Link>
        )}
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserIcon className="w-4 h-4" />
            <span className="hidden md:inline-block">{user.email}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline-block">Sign out</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href={ROUTES.AUTH.LOGIN} className="text-sm font-medium hover:underline underline-offset-4">Sign In</Link>
      <Link href={ROUTES.AUTH.REGISTER} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
        Sign Up
      </Link>
    </div>
  );
}
