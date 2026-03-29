import { z } from "zod";
import { ROLES, RANKS } from "@/lib/constants";

export const signupSchema = z
  .object({
    discordUsername: z
      .string()
      .min(2, "Discord username is required")
      .max(32, "Discord username too long"),
    opggLink: z
      .string()
      .url("Must be a valid URL")
      .refine(
        (val) => val.includes("op.gg"),
        "Must be a valid op.gg link"
      ),
    primaryRole: z.enum(ROLES, {
      errorMap: () => ({ message: "Select a primary role" }),
    }),
    secondaryRole: z.enum(ROLES).optional().or(z.literal("")),
    currentRank: z.enum(RANKS, {
      errorMap: () => ({ message: "Select your current rank" }),
    }),
    peakRank: z.enum(RANKS, {
      errorMap: () => ({ message: "Select your peak rank" }),
    }),
  })
  .refine(
    (data) => !data.secondaryRole || data.secondaryRole !== data.primaryRole,
    {
      message: "Secondary role must be different from primary role",
      path: ["secondaryRole"],
    }
  );

export type SignupFormData = z.infer<typeof signupSchema>;
