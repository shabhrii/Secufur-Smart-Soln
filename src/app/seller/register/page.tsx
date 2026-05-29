"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Store } from "lucide-react";
import { signUpSeller, upgradeBuyerToSeller } from "@/lib/auth/actions";
import { sellerRegisterSchema, upgradeSellerSchema, type SellerRegisterInput, type UpgradeSellerInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { useMemo } from "react";

export default function SellerRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = useMemo(() => {
    console.log("CREATING SUPABASE ONCE");
    return createClient();
  }, []);
  useEffect(() => {
    const checkSession = async () => {
      console.log("CHECK SESSION START");

      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("getSession timeout after 5s")), 5000)
        );

        const result = await Promise.race([
          supabase.auth.getSession(),
          timeout,
        ]);

        console.log("SESSION RESULT:", result);

        //setIsAuthenticated(!!result.data.session);
      } catch (err) {
        console.error("SESSION ERROR:", err);
      } finally {
        console.log("CLEARING SPINNER");
        setIsCheckingAuth(false);
      }
    };

    checkSession();
  }, [supabase]);

  // Form for unauthenticated users
  const {
    register: registerNew,
    handleSubmit: handleNewSubmit,
    formState: { errors: newErrors },
  } = useForm<SellerRegisterInput>({
    resolver: zodResolver(sellerRegisterSchema),
  });

  // Form for authenticated buyers upgrading
  const {
    register: registerUpgrade,
    handleSubmit: handleUpgradeSubmit,
    formState: { errors: upgradeErrors },
  } = useForm<UpgradeSellerInput>({
    resolver: zodResolver(upgradeSellerSchema),
  });

  const onNewSubmit = async (data: SellerRegisterInput) => {
    setIsLoading(true);
    setErrorMsg("");
    const result = await signUpSeller(data);
    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    }
  };

  const onUpgradeSubmit = async (data: UpgradeSellerInput) => {
    setIsLoading(true);
    setErrorMsg("");
    const result = await upgradeBuyerToSeller(data);
    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    }
  };
  console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    "ANON KEY EXISTS:",
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  if (isCheckingAuth) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-sm md:max-w-md flex flex-col space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-3 bg-primary/10 rounded-full mb-2">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Become a Seller</h1>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated ? "Complete your seller profile to upgrade your account" : "Apply to open your store on Secufur"}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
            {errorMsg}
          </div>
        )}

        {isAuthenticated ? (
          // Upgrade Form
          <form onSubmit={handleUpgradeSubmit(onUpgradeSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" placeholder="My Awesome Store" {...registerUpgrade("storeName")} disabled={isLoading} />
              {upgradeErrors.storeName && <p className="text-sm font-medium text-destructive">{upgradeErrors.storeName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Legal Business Name</Label>
              <Input id="businessName" placeholder="Awesome Store LLC" {...registerUpgrade("businessName")} disabled={isLoading} />
              {upgradeErrors.businessName && <p className="text-sm font-medium text-destructive">{upgradeErrors.businessName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input id="businessType" placeholder="LLC, Sole Proprietorship..." {...registerUpgrade("businessType")} disabled={isLoading} />
              {upgradeErrors.businessType && <p className="text-sm font-medium text-destructive">{upgradeErrors.businessType.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input id="taxId" placeholder="XX-XXXXXXX" {...registerUpgrade("taxId")} disabled={isLoading} />
              {upgradeErrors.taxId && <p className="text-sm font-medium text-destructive">{upgradeErrors.taxId.message}</p>}
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upgrade to Seller
            </Button>
          </form>
        ) : (
          // New User Form
          <form onSubmit={handleNewSubmit(onNewSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" {...registerNew("fullName")} disabled={isLoading} />
              {newErrors.fullName && <p className="text-sm font-medium text-destructive">{newErrors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" placeholder="My Awesome Store" {...registerNew("storeName")} disabled={isLoading} />
              {newErrors.storeName && <p className="text-sm font-medium text-destructive">{newErrors.storeName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Legal Business Name</Label>
              <Input id="businessName" placeholder="Awesome Store LLC" {...registerNew("businessName")} disabled={isLoading} />
              {newErrors.businessName && <p className="text-sm font-medium text-destructive">{newErrors.businessName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input id="businessType" placeholder="LLC, Sole Proprietorship..." {...registerNew("businessType")} disabled={isLoading} />
              {newErrors.businessType && <p className="text-sm font-medium text-destructive">{newErrors.businessType.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input id="taxId" placeholder="XX-XXXXXXX" {...registerNew("taxId")} disabled={isLoading} />
              {newErrors.taxId && <p className="text-sm font-medium text-destructive">{newErrors.taxId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@example.com" type="email" autoCapitalize="none" autoComplete="email" autoCorrect="off" {...registerNew("email")} disabled={isLoading} />
              {newErrors.email && <p className="text-sm font-medium text-destructive">{newErrors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} {...registerNew("password")} disabled={isLoading} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newErrors.password && <p className="text-sm font-medium text-destructive">{newErrors.password.message}</p>}
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </form>
        )}

        {!isAuthenticated && (
          <div className="text-center text-sm">
            Already a seller?{" "}
            <Link href={ROUTES.SELLER.LOGIN} className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
