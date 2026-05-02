import { z } from 'zod';

export const paramsWithId = z.object({
    id: z.string().min(1),
});
