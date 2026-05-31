"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createAddress, type AddressFormValues } from "@/services/addresses/actions"

const addressSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address_line_1: z.string().min(5, "Address must be at least 5 characters"),
  address_line_2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  is_default: z.boolean().default(false),
})

interface AddressFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AddressForm({ onSuccess, onCancel }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isDefault, setIsDefault] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema) as any,
    defaultValues: {
      full_name: "",
      phone: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: false,
    },
  })

  const onSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true)
    setServerError(null)

    const result = await createAddress({ ...data, is_default: isDefault })

    if (result.success) {
      onSuccess()
    } else {
      setServerError(result.error || "Failed to save address.")
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="addr-full_name">Full Name *</Label>
          <Input id="addr-full_name" placeholder="John Doe" {...register("full_name")} disabled={isSubmitting} />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addr-phone">Phone Number</Label>
          <Input id="addr-phone" placeholder="+91 98765 43210" {...register("phone")} disabled={isSubmitting} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addr-line1">Address Line 1 *</Label>
        <Input id="addr-line1" placeholder="House/Flat No., Street, Area" {...register("address_line_1")} disabled={isSubmitting} />
        {errors.address_line_1 && <p className="text-xs text-destructive">{errors.address_line_1.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addr-line2">Address Line 2</Label>
        <Input id="addr-line2" placeholder="Landmark, Building name (optional)" {...register("address_line_2")} disabled={isSubmitting} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="addr-city">City *</Label>
          <Input id="addr-city" placeholder="Mumbai" {...register("city")} disabled={isSubmitting} />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addr-state">State *</Label>
          <Input id="addr-state" placeholder="Maharashtra" {...register("state")} disabled={isSubmitting} />
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="addr-postal">Postal Code *</Label>
          <Input id="addr-postal" placeholder="400001" {...register("postal_code")} disabled={isSubmitting} />
          {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addr-country">Country *</Label>
          <Input id="addr-country" placeholder="India" {...register("country")} disabled={isSubmitting} />
          {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Switch
          id="addr-default"
          checked={isDefault}
          onCheckedChange={(val: boolean) => setIsDefault(val)}
          disabled={isSubmitting}
        />
        <Label htmlFor="addr-default" className="text-sm font-normal cursor-pointer">
          Set as default shipping address
        </Label>
      </div>

      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2.5">{serverError}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Address
        </Button>
      </div>
    </form>
  )
}
