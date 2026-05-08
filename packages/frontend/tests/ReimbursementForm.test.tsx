import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'bun:test';

import { ReimbursementForm } from '@/components/reimbursements/ReimbursementForm.tsx';

vi.mock('@/services/category.service.ts', () => ({
    categoryService: {
        list: vi
            .fn()
            .mockResolvedValue([
                { active: true, id: 'cat-1', name: 'Transporte' },
            ]),
    },
}));

const noop = () => {};
const mockRegister = (name: string) => ({
    name,
    onBlur: noop,
    onChange: noop,
    ref: noop,
});

describe('ReimbursementForm', () => {
    it('shows validation errors for all empty fields on submit', async () => {
        const errors = {
            amount: { message: 'Amount must be greater than zero' },
            categoryId: { message: 'Category is required' },
            description: { message: 'Description is required' },
            expenseDate: { message: 'Expense date is required' },
        };

        render(
            <ReimbursementForm
                categoryId=""
                errors={errors as any}
                isSubmitting={false}
                onSubmit={vi.fn()}
                register={mockRegister as any}
                setValue={vi.fn() as any}
                submitLabel="Create"
            />,
        );

        expect(
            screen.getByText('Amount must be greater than zero'),
        ).toBeInTheDocument();
        expect(screen.getByText('Category is required')).toBeInTheDocument();
        expect(screen.getByText('Description is required')).toBeInTheDocument();
        expect(
            screen.getByText('Expense date is required'),
        ).toBeInTheDocument();
    });

    it('shows root error when present', async () => {
        render(
            <ReimbursementForm
                categoryId=""
                errors={{}}
                isSubmitting={false}
                onSubmit={vi.fn()}
                register={mockRegister as any}
                rootError="Failed to create reimbursement"
                setValue={vi.fn() as any}
                submitLabel="Create"
            />,
        );

        expect(
            screen.getByText('Failed to create reimbursement'),
        ).toBeInTheDocument();
    });

    it('disables submit button when submitting', async () => {
        render(
            <ReimbursementForm
                categoryId=""
                errors={{}}
                isSubmitting={true}
                onSubmit={vi.fn()}
                register={mockRegister as any}
                setValue={vi.fn() as any}
                submitLabel="Create"
            />,
        );

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('shows submit label', async () => {
        render(
            <ReimbursementForm
                categoryId=""
                errors={{}}
                isSubmitting={false}
                onSubmit={vi.fn()}
                register={mockRegister as any}
                setValue={vi.fn() as any}
                submitLabel="Save Changes"
            />,
        );

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toBeInTheDocument();
    });
});
