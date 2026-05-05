import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10),
  page: z.coerce.number().int().positive().default(1),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
