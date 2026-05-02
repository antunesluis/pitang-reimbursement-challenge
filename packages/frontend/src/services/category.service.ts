import { api } from '@/lib/api.ts';

import type { Category } from '@/types/index.ts';

export const categoryService = {
    create: (name: string) => api.post<Category>('/categories', { name }),

    list: () => api.get<Category[]>('/categories'),

    update: (id: string, data: { active?: boolean; name?: string }) =>
        api.put<Category>(`/categories/${id}`, data),
};
