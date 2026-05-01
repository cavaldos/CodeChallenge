import { z } from 'zod';

// ==================== Schemas ====================

export const registerSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().trim().min(1),
});

export const recipientSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1),
  campaignId: z.string().uuid().optional(),
});

export const campaignCreateSchema = z.object({
  name: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  body: z.string().trim().min(1),
  recipient_ids: z.array(z.string().uuid()).optional(),
});

export const campaignUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  subject: z.string().trim().min(1).optional(),
  body: z.string().trim().min(1).optional(),
});

export const campaignScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

// ==================== Type Aliases ====================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type RecipientInput = z.infer<typeof recipientSchema>;
export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
export type CampaignScheduleInput = z.infer<typeof campaignScheduleSchema>;

// ==================== Validation Helper ====================

export function sendValidationError(
  response: { status: (code: number) => { json: (payload: { error: string; message: string }) => void } },
  message: string,
): void {
  response.status(400).json({
    error: 'VALIDATION_ERROR',
    message,
  });
}

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function getValidationErrors(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
}