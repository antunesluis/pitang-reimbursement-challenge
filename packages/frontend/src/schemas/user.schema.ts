import { z } from 'zod';

import { ROLES } from '@/types/index.ts';

export const userListSearchSchema = z.object({
    limit: z.coerce.number().int().positive().max(50).default(10),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().positive().default(1),
    sort: z.enum(['createdAt', 'name']).default('createdAt'),
});

export type UserListSearchParams = z.infer<typeof userListSearchSchema>;

export const createUserSchema = z
    .object({
        email: z.string().email('Invalid email'),
        name: z.string().min(2, 'Name must be at least 2 characters'),
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters'),
        role: z
            .enum(ROLES, {
                message: 'Invalid role',
            })
            .optional(),
    })
    .strict();

export type CreateUserFormData = z.infer<typeof createUserSchema>;
