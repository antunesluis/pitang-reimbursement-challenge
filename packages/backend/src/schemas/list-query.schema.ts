import { z } from 'zod';

export const listQuerySchema = z.object({
    categoryId: z.string().optional(),
    limit: z.coerce.number().int().positive().max(50).default(10),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().positive().default(1),
    sort: z.enum(['amount', 'createdAt', 'expenseDate']).default('createdAt'),
    status: z
        .enum([
            'APPROVED',
            'CANCELLED',
            'DRAFT',
            'PAID',
            'REJECTED',
            'SUBMITTED',
        ])
        .optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
