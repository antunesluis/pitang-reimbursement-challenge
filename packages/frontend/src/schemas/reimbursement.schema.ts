import { z } from 'zod';

import { Status } from '@/types/index.ts';

export const reimbursementListSearchSchema = z.object({
    categoryId: z.string().optional(),
    limit: z.coerce.number().int().positive().max(50).default(10),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().positive().default(1),
    sort: z.enum(['amount', 'createdAt', 'expenseDate']).default('createdAt'),
    status: z
        .enum([
            Status.APPROVED,
            Status.CANCELLED,
            Status.DRAFT,
            Status.PAID,
            Status.REJECTED,
            Status.SUBMITTED,
        ])
        .optional(),
});

export type ReimbursementListSearchParams = z.infer<
    typeof reimbursementListSearchSchema
>;

export const createReimbursementSchema = z
    .object({
        amount: z.coerce
            .number()
            .positive('Amount must be greater than zero'),
        categoryId: z.string().min(1, 'Category is required'),
        description: z.string().min(1, 'Description is required'),
        expenseDate: z.string().min(1, 'Expense date is required'),
    })
    .strict();

export const updateReimbursementSchema = z
    .object({
        amount: z.coerce
            .number()
            .positive('Amount must be greater than zero')
            .optional(),
        categoryId: z
            .string()
            .min(1, 'Category is required')
            .optional(),
        description: z
            .string()
            .min(1, 'Description is required')
            .optional(),
        expenseDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
            .optional(),
    })
    .strict();

export const rejectReimbursementSchema = z
    .object({
        rejectionReason: z
            .string()
            .min(1, 'Rejection reason is required'),
    })
    .strict();

export type CreateReimbursementFormData = z.infer<
    typeof createReimbursementSchema
>;
export type UpdateReimbursementFormData = z.infer<
    typeof updateReimbursementSchema
>;
export type RejectReimbursementFormData = z.infer<
    typeof rejectReimbursementSchema
>;
