import { z } from "zod";
export const emailSchema = z.string().trim().email("Enter a valid email address");
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Accept the terms and privacy policy" }),
  }),
});
export const profileSchema = z.object({
  fullName: z.string().trim().min(2),
  country: z.string().trim().min(2),
  city: z.string().trim().min(2),
  institution: z.string().trim().min(2),
  programme: z.string().trim().min(2),
  studyLevel: z.string().trim().min(1),
  biography: z.string().max(300).optional(),
  interests: z.array(z.string()).min(1),
  skills: z.array(z.string()).default([]),
});
export const postSchema = z.object({
  channelId: z.string().uuid(),
  body: z.string().trim().min(1).max(3000),
  imageUrl: z.string().url().optional(),
});
export const reportSchema = z.object({
  reason: z.enum(["spam", "harassment", "misinformation", "inappropriate", "other"]),
  details: z.string().max(500).optional(),
});
export const isStaff = (roles: string[]) =>
  roles.some((r) =>
    [
      "content_creator",
      "moderator",
      "programme_manager",
      "admin",
      "super_admin",
    ].includes(r),
  );
export const canAssignRoles = (roles: string[]) => roles.includes("super_admin");
