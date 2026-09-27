import { z } from "zod";
import { idSchema, optionalImageUrl, optionalText, pageQuery, requiredText, stringList } from "@/lib/validators/common";

export const guideProfileSchema = z.object({
  headline: requiredText("Headline", 120),
  bio: z.string({ error: "Tell travelers about yourself" }).trim().min(40, "Write at least a few sentences (40+ characters)").max(3000, "Keep it under 3000 characters"),
  languages: stringList(10, 40).refine((items) => items.length > 0, "Add at least one language"),
  yearsExperience: z.coerce.number({ error: "Enter your years of experience" }).int().min(0).max(60),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .regex(/^[+0-9 ()-]*$/, "Use digits, spaces and + only")
    .optional()
    .transform((value) => value || null),
  photoUrl: optionalImageUrl,
  areaIds: z.array(idSchema).min(1, "Choose at least one destination you guide in").max(15, "Choose at most 15 destinations"),
});

export const guideRequestSchema = z
  .object({
    startDate: z.coerce.date({ error: "Choose a start date" }),
    endDate: z.coerce.date({ error: "Choose an end date" }),
    groupSize: z.coerce.number({ error: "How many people?" }).int().min(1, "At least 1 person").max(50),
    message: z.string({ error: "Add a message" }).trim().min(20, "Tell the guide a little more (20+ characters)").max(2000),
    destinationId: z.union([idSchema, z.literal(""), z.null()]).optional().transform((value) => value || null),
  })
  .superRefine((value, context) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (value.startDate < today) context.addIssue({ code: "custom", message: "Choose a date from today onwards", path: ["startDate"] });
    if (value.endDate < value.startDate) context.addIssue({ code: "custom", message: "End date must be on or after the start date", path: ["endDate"] });
  });

export const guideRequestUpdateSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "CANCELLED"]),
});

export const guideQuerySchema = z.object({
  ...pageQuery,
  destination: z.string().trim().max(120).optional(),
  language: z.string().trim().max(40).optional(),
});

export const guideModerationSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});
