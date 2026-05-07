import { z } from 'zod';

export const createCategorySchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
    })
    .strict();

export const updateCategorySchema = z
    .object({
        active: z.boolean({
            message: 'Active must be true or false',
        }).optional(),
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .optional(),
    })
    .strict();

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
