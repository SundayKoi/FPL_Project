import { z } from "zod";

export const vodSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  url: z.string().url("Must be a valid URL"),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  matchDate: z.string().min(1, "Match date is required"),
});

export type VodFormData = z.infer<typeof vodSchema>;
