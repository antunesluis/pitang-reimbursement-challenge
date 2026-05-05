import { api } from "@/lib/api.ts";

import type { PaginatedResponse, Reimbursement, ReimbursementStats } from "@/types/index.ts";
import type { HistoryEntry } from "@/types/index.ts";

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
    }) => api.post<Reimbursement>("/reimbursements", data),

    getById: (id: string) => api.get<Reimbursement>(`/reimbursements/${id}`),

    getHistory: (id: string) =>
        api.get<HistoryEntry[]>(`/reimbursements/${id}/history`),

    getStats: () => api.get<ReimbursementStats>("/reimbursements/stats"),

    list: (page = 1, limit = 10) =>
        api.get<PaginatedResponse<Reimbursement>>(
            `/reimbursements?page=${page}&limit=${limit}`,
        ),

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
