import { z } from 'zod';

import { ROLES } from '@/types/index.ts';

export const createUserSchema = z.object({
    email: z.string().email('Invalid email'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(ROLES).optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
