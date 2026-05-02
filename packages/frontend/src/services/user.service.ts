import { api } from '@/lib/api.ts';

import type { User } from '@/types/index.ts';

export const userService = {
    create: (data: {
        email: string;
        name: string;
        password: string;
        role?: string;
    }) => api.post<User>('/users', data),

    list: () => api.get<User[]>('/users'),
};
