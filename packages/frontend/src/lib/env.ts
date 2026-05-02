import { z } from 'zod';

const envSchema = z.object({
    VITE_API_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
    console.warn(
        'Invalid environment variables:',
        parsed.error.issues
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join(', '),
    );
}

export const env = {
    /** Whether the app is running in production mode (from Vite). */
    IS_PROD: import.meta.env.PROD,
    /** Base URL for the backend API. */
    VITE_API_URL: parsed.success
        ? parsed.data.VITE_API_URL
        : 'http://localhost:3000',
} as const;
