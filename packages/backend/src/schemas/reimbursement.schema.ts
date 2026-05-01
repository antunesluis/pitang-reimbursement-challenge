import { z } from 'zod';

export const createReimbursementSchema = z.object({
    amount: z.number().positive('Amount must be greater than zero'),
    categoryId: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required'),
    expenseDate: z.coerce.date({ message: 'Invalid expense date' }),
});

export const updateReimbursementSchema = z.object({
    amount: z.number().positive('Amount must be greater than zero').optional(),
    categoryId: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    expenseDate: z.coerce.date().optional(),
});

export const rejectReimbursementSchema = z.object({
    rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export type CreateReimbursementInput = z.infer<
    typeof createReimbursementSchema
>;
export type UpdateReimbursementInput = z.infer<
    typeof updateReimbursementSchema
>;
export type RejectReimbursementInput = z.infer<
    typeof rejectReimbursementSchema
>;
