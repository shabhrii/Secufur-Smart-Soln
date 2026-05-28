import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function SellerLandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-6">Become a Seller</h1>
      <p className="text-muted-foreground mb-8 max-w-xl">
        Join our marketplace and start selling your products to thousands of customers worldwide.
      </p>
      <div className="flex gap-4">
        <Link href={ROUTES.SELLER.LOGIN} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium">
          Login
        </Link>
        <Link href={ROUTES.SELLER.REGISTER} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md font-medium">
          Register
        </Link>
      </div>
    </div>
  );
}
