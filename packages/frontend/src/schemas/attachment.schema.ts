import { z } from 'zod';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

export const createAttachmentSchema = z.object({
    fileName: z.string().min(1, 'File name is required'),
    fileType: z.enum(ALLOWED_TYPES, {
        message: 'Invalid file type. Allowed: PDF, JPG, PNG',
    }),
    fileUrl: z.string().url('Invalid file URL'),
});

export type CreateAttachmentFormData = z.infer<typeof createAttachmentSchema>;
