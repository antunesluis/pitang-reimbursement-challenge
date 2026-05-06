import { api } from '@/lib/api.ts';

import type {
    PaginatedResponse,
    Reimbursement,
    ReimbursementStats,
} from '@/types/index.ts';
import type { HistoryEntry } from '@/types/index.ts';

export type { ReimbursementStats };

export const reimbursementService = {
    approve: (id: string) =>
        api.post<Reimbursement>(`/reimbursements/${id}/approve`),

    cancel: (id: string) =>
        api.post<Reimbursement>(`/reimbursements/${id}/cancel`),

    create: (data: {
        amount: number;
        categoryId: string;
        description: string;
        expenseDate: string;
    }) => api.post<Reimbursement>('/reimbursements', data),

    getById: (id: string) => api.get<Reimbursement>(`/reimbursements/${id}`),

    getHistory: (id: string) =>
        api.get<HistoryEntry[]>(`/reimbursements/${id}/history`),

    getStats: () => api.get<ReimbursementStats>('/reimbursements/stats'),

    list: (params: {
        page?: number;
        limit?: number;
        sort?: string;
        order?: string;
        status?: string;
        categoryId?: string;
    } = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set('page', String(params.page));
        if (params.limit) searchParams.set('limit', String(params.limit));
        if (params.sort) searchParams.set('sort', params.sort);
        if (params.order) searchParams.set('order', params.order);
        if (params.status) searchParams.set('status', params.status);
        if (params.categoryId)
            searchParams.set('categoryId', params.categoryId);
        return api.get<PaginatedResponse<Reimbursement>>(
            `/reimbursements?${searchParams.toString()}`,
        );
    },

    pay: (id: string) => api.post<Reimbursement>(`/reimbursements/${id}/pay`),

    reject: (id: string, rejectionReason: string) =>
        api.post<Reimbursement>(`/reimbursements/${id}/reject`, {
            rejectionReason,
        }),

    submit: (id: string) =>
        api.post<Reimbursement>(`/reimbursements/${id}/submit`),

    update: (id: string, data: Record<string, unknown>) =>
        api.put<Reimbursement>(`/reimbursements/${id}`, data),
};
