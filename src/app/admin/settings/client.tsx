"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SettingsFormValues, settingsSchema } from "@/validations/settings";
import { updateMarketplaceSettings } from "@/services/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";

interface SettingsFormClientProps {
  initialData: SettingsFormValues;
}

export function SettingsFormClient({ initialData }: SettingsFormClientProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData.name,
      commission_percentage: initialData.commission_percentage,
      maintenance_mode: initialData.maintenance_mode,
      support_email: initialData.support_email || "",
      contact_number: initialData.contact_number || "",
    },
  });

  const maintenanceMode = watch("maintenance_mode");

  const onSubmit = (data: SettingsFormValues) => {
    startTransition(async () => {
      try {
        await updateMarketplaceSettings(data);
        alert("Settings saved successfully!");
      } catch (error: any) {
        alert(error.message || "Failed to save settings.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure core platform details and commission.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Marketplace Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Secufur" 
              {...register("name")} 
              disabled={isPending}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="commission_percentage">Commission Percentage (%)</Label>
            <Input 
              id="commission_percentage" 
              type="number"
              step="0.01"
              placeholder="10.00" 
              {...register("commission_percentage", { valueAsNumber: true })} 
              disabled={isPending}
            />
            {errors.commission_percentage && <p className="text-sm text-destructive">{errors.commission_percentage.message}</p>}
            <p className="text-xs text-muted-foreground">The platform fee taken from every successful seller order.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Public-facing contact details for platform support.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="support_email">Support Email</Label>
            <Input 
              id="support_email" 
              type="email"
              placeholder="support@example.com" 
              {...register("support_email")} 
              disabled={isPending}
            />
            {errors.support_email && <p className="text-sm text-destructive">{errors.support_email.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact_number">Contact Number</Label>
            <Input 
              id="contact_number" 
              placeholder="+1 (555) 123-4567" 
              {...register("contact_number")} 
              disabled={isPending}
            />
            {errors.contact_number && <p className="text-sm text-destructive">{errors.contact_number.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Critical platform controls.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Block buyers and sellers from accessing the marketplace. Admins will retain access.
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={(checked) => setValue("maintenance_mode", checked, { shouldDirty: true })}
              disabled={isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 py-4 px-6 mt-4 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
