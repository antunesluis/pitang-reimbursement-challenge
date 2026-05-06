import { z } from 'zod';

export const userListQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(50).default(10),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().positive().default(1),
    sort: z.enum(['createdAt', 'name']).default('createdAt'),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
