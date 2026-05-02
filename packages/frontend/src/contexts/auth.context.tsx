/* eslint-disable react-hooks/set-state-in-effect */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { api, setOnUnauthorized } from '@/lib/api.ts';
import { cookieStorage } from '@/lib/cookies.ts';

type User = {
    email: string;
    id: string;
    name: string;
    role: 'ADMIN' | 'EMPLOYEE' | 'FINANCE' | 'MANAGER';
};

type LoginResponse = {
    token: string;
    user: User;
};

type AuthState = {
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    user: null | User;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<null | User>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        cookieStorage.removeToken();
        setUser(null);
    }, []);

    // Redirect to login on 401
    useEffect(() => {
        setOnUnauthorized(() => {
            logout();
            window.location.href = '/';
        });
    }, [logout]);

    // Validate token on mount
    useEffect(() => {
        const token = cookieStorage.getToken();

        if (!token) {
            setIsLoading(false);
            return;
        }

        api.get<User>('/auth/me')
            .then((userData) => setUser(userData))
            .catch(() => cookieStorage.removeToken())

            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await api.post<LoginResponse>('/auth/login', {
            email,
            password,
        });
        cookieStorage.setToken(data.token);
        setUser(data.user);
    }, []);

    const value = useMemo<AuthState>(
        () => ({
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            user,
        }),
        [isLoading, login, logout, user],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export type { User };
