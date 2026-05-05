import { api } from "@/lib/api.ts";

import type { PaginatedResponse, User } from "@/types/index.ts";

export const userService = {
    create: (data: {
        email: string;
        name: string;
        password: string;
        role?: string;
    }) => api.post<User>("/users", data),

    list: (page = 1, limit = 10) =>
        api.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`),
};
