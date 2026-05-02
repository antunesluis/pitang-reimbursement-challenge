import { api } from '@/lib/api.ts';

import type { LoginResponse, User } from '@/types/index.ts';

export const authService = {
    login: (email: string, password: string) =>
        api.post<LoginResponse>('/auth/login', { email, password }),

    me: () => api.get<User>('/auth/me'),
};
