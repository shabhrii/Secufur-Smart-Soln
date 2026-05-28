import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function AdminLandingPage() {
  // Usually, this would redirect to dashboard if authenticated, or login if not.
  // For now, redirect to dashboard as a placeholder.
  redirect(ROUTES.ADMIN.DASHBOARD);
}
