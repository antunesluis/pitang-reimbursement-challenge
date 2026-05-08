import { z } from 'zod';

const envSchema = z.object({
    ATTACHMENT_REQUIRED_THRESHOLD: z.coerce
        .number()
        .positive()
        .default(100),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
});

export const env = envSchema.parse(process.env);
