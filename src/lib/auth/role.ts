import { ROLES, type Role } from "@/constants/roles";
import { type User } from "@/types/auth";

export function isBuyer(user: User | null): boolean {
  return (user?.role as unknown as string) === ROLES.BUYER;
}

export function isSeller(user: User | null): boolean {
  return (user?.role as unknown as string) === ROLES.SELLER;
}

export function isAdmin(user: User | null): boolean {
  return (user?.role as unknown as string) === ROLES.ADMIN;
}

export function hasRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as unknown as Role);
}
