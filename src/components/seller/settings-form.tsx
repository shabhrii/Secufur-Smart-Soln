"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSellerProfile, type SellerSettingsInput } from "@/services/sellers/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sellerSettingsSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  phone: z.string().optional().nullable(),
  storeName: z.string().min(2, "Store name is too short"),
  businessName: z.string().optional().nullable(),
  businessType: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
});

interface SettingsFormProps {
  initialData: {
    fullName: string;
    phone: string | null;
    storeName: string;
    businessName: string | null;
    businessType: string | null;
    taxId: string | null;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SellerSettingsInput>({
    resolver: zodResolver(sellerSettingsSchema),
    defaultValues: {
      fullName: initialData.fullName || "",
      phone: initialData.phone || "",
      storeName: initialData.storeName || "",
      businessName: initialData.businessName || "",
      businessType: initialData.businessType || "",
      taxId: initialData.taxId || "",
    },
  });

  const onSubmit = async (data: SellerSettingsInput) => {
    setIsSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const result = await updateSellerProfile(data);

    if (result.success) {
      setSuccessMsg("Settings updated successfully.");
    } else {
      setErrorMsg(result.error || "Failed to update settings.");
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store & Profile Settings</CardTitle>
        <CardDescription>
          Update your personal and business details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register("fullName")} disabled={isSubmitting} />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...register("phone")} disabled={isSubmitting} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name (Public)</Label>
                <Input id="storeName" {...register("storeName")} disabled={isSubmitting} />
                {errors.storeName && <p className="text-sm text-destructive">{errors.storeName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Legal Business Name</Label>
                <Input id="businessName" {...register("businessName")} disabled={isSubmitting} />
                {errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input id="businessType" {...register("businessType")} disabled={isSubmitting} />
                {errors.businessType && <p className="text-sm text-destructive">{errors.businessType.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input id="taxId" {...register("taxId")} disabled={isSubmitting} />
                {errors.taxId && <p className="text-sm text-destructive">{errors.taxId.message}</p>}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-primary/10 text-primary text-sm rounded-md border border-primary/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
