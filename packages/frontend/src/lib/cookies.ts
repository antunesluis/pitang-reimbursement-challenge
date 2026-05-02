import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';

export const cookieStorage = {
    getToken(): string | undefined {
        return Cookies.get(TOKEN_KEY);
    },
    removeToken(): void {
        Cookies.remove(TOKEN_KEY, { path: '/' });
    },
    setToken(token: string): void {
        Cookies.set(TOKEN_KEY, token, {
            expires: 1, // 1 day (matches JWT 24h expiry)
            path: '/',
            sameSite: 'strict',
            secure: import.meta.env.PROD,
        });
    },
};
