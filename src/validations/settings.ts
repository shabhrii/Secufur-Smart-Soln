import { z } from "zod";

export const settingsSchema = z.object({
  name: z.string().min(2, "Marketplace name is required").max(50),
  commission_percentage: z.number().min(0).max(100, "Cannot exceed 100%"),
  maintenance_mode: z.boolean(),
  support_email: z.string().email("Invalid email address").or(z.literal("")),
  contact_number: z.string().max(20).optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
