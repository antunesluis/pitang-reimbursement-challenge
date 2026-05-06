import { api } from '@/lib/api.ts';

import type { PaginatedResponse, User } from '@/types/index.ts';

export const userService = {
    create: (data: {
        email: string;
        name: string;
        password: string;
        role?: string;
    }) => api.post<User>('/users', data),

    list: (params: {
        page?: number;
        limit?: number;
        sort?: string;
        order?: string;
    } = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set('page', String(params.page));
        if (params.limit) searchParams.set('limit', String(params.limit));
        if (params.sort) searchParams.set('sort', params.sort);
        if (params.order) searchParams.set('order', params.order);
        return api.get<PaginatedResponse<User>>(
            `/users?${searchParams.toString()}`,
        );
    },
};
