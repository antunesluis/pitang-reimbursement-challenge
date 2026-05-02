import { cookieStorage } from '@/lib/cookies.ts';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type RequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown;
};

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
    onUnauthorized = callback;
}

async function request<T>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const token = cookieStorage.getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) ?? {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
        headers,
    });

    if (response.status === 401) {
        cookieStorage.removeToken();
        onUnauthorized?.();
    }

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(
            data.message ?? 'Request failed',
            response.status,
            data.errors,
        );
    }

    return data as T;
}

export class ApiError extends Error {
    errors?: { field: string; message: string }[];
    statusCode: number;

    constructor(
        message: string,
        statusCode: number,
        errors?: { field: string; message: string }[],
    ) {
        super(message);
        this.errors = errors;
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}

export const api = {
    get<T>(path: string, options?: RequestOptions) {
        return request<T>(path, { ...options, method: 'GET' });
    },
    post<T>(path: string, body?: unknown, options?: RequestOptions) {
        return request<T>(path, { ...options, body, method: 'POST' });
    },
    put<T>(path: string, body?: unknown, options?: RequestOptions) {
        return request<T>(path, { ...options, body, method: 'PUT' });
    },
};
