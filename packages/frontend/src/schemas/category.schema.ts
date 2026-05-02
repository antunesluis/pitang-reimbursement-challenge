import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const updateCategorySchema = z.object({
    active: z.boolean().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
