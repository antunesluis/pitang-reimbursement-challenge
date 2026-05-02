import { z } from 'zod';

export const createReimbursementSchema = z.object({
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    categoryId: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required'),
    expenseDate: z.string().min(1, 'Expense date is required'),
});

export const updateReimbursementSchema = z.object({
    amount: z.coerce
        .number()
        .positive('Amount must be greater than zero')
        .optional(),
    categoryId: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    expenseDate: z.string().optional(),
});

export const rejectReimbursementSchema = z.object({
    rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export type CreateReimbursementFormData = z.infer<
    typeof createReimbursementSchema
>;
export type UpdateReimbursementFormData = z.infer<
    typeof updateReimbursementSchema
>;
export type RejectReimbursementFormData = z.infer<
    typeof rejectReimbursementSchema
>;
