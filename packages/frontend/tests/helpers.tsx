import { AuthContext } from '@/contexts/auth.context.tsx';

import type { User } from '@/types/index.ts';
import type { ReactNode } from 'react';

export function mockAuthProvider(user: null | User) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <AuthContext.Provider
                value={{
                    isAuthenticated: !!user,
                    isLoading: false,
                    login: async () => {},
                    logout: () => {},
                    user: user ?? null,
                }}
            >
                {children}
            </AuthContext.Provider>
        );
    };
}
