import { z } from "zod";

export const applicationSchema = z.object({
  fullName: z.string().min(2), email: z.string().email(), phone: z.string().optional(), organization: z.string().optional(),
  networkName: z.string().min(2), networkCategory: z.string().min(2), targetAudience: z.string().min(5), contentDescription: z.string().min(20),
  currentPlatforms: z.string().optional(), websiteSocialLinks: z.string().optional(), sampleVideoUrl: z.string().url().optional().or(z.literal("")), uploadedSampleFileUrl: z.string().optional(),
  monetizationGoals: z.string().optional(), distributionGoals: z.string().optional(), budgetRange: z.string().optional(), timeline: z.string().optional(),
  rightsConfirmation: z.coerce.boolean().refine(Boolean, "Content rights confirmation is required"), hp: z.string().optional()
});
export const contactSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), source: z.string().default("contact"), interest: z.string().optional(), reason: z.string().min(2), message: z.string().min(10), hp: z.string().optional() });
export const networkSchema = z.object({ name: z.string().min(2), description: z.string().min(20), category: z.string().min(2), targetAudience: z.string().optional(), logoUrl: z.string().optional(), bannerUrl: z.string().optional(), distributionGoals: z.string().optional(), monetizationGoals: z.string().optional(), websiteUrl: z.string().optional(), status: z.enum(["draft","building","live","distribution_ready","archived"]).optional(), isApproved: z.coerce.boolean().optional(), isFeatured: z.coerce.boolean().optional() });
export const videoSchema = z.object({ networkId: z.string().min(1), showId: z.string().optional(), title: z.string().min(2), description: z.string().min(10), videoUrl: z.string().min(3), thumbnailUrl: z.string().optional(), duration: z.coerce.number().int().positive().optional(), category: z.string().min(2), isApproved: z.coerce.boolean().optional(), isFeatured: z.coerce.boolean().optional() });
export const resourceSchema = z.object({ title: z.string().min(2), excerpt: z.string().min(10), content: z.string().min(20), category: z.string().min(2), imageUrl: z.string().optional(), isPublished: z.coerce.boolean().optional() });
export const uploadSchema = z.object({ fileName: z.string(), fileType: z.string().refine(t => ["video/mp4","video/webm","image/png","image/jpeg","image/webp"].includes(t), "Unsupported upload type"), fileSize: z.number().max(250 * 1024 * 1024) });
