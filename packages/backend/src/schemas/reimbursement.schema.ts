import { z } from "zod"

export const createReimbursementSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  expenseDate: z.coerce.date({ message: "Invalid expense date" }),
  categoryId: z.string().min(1, "Category is required"),
})

export const updateReimbursementSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive("Amount must be greater than zero").optional(),
  expenseDate: z.coerce.date().optional(),
  categoryId: z.string().min(1).optional(),
})

export const rejectReimbursementSchema = z.object({
  rejectionReason: z
    .string()
    .min(1, "Rejection reason is required"),
})

export type CreateReimbursementInput = z.infer<typeof createReimbursementSchema>
export type UpdateReimbursementInput = z.infer<typeof updateReimbursementSchema>
export type RejectReimbursementInput = z.infer<typeof rejectReimbursementSchema>
