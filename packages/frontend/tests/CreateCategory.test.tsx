import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'bun:test';

import { CategoriesPage } from '@/routes/_authenticated/categories/index.tsx';

import { mockAuthProvider } from './helpers';

const adminUser = {
    createdAt: '2026-01-01',
    email: 'admin@example.com',
    id: '1',
    name: 'Admin',
    role: 'ADMIN' as const,
    updatedAt: '2026-01-01',
};

vi.mock('@tanstack/react-router', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createFileRoute: (_path: string) => (config: any) => config.component,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
    useRouter: () => ({ navigate: vi.fn() }),
}));

vi.mock('@/hooks/use-permissions.ts', () => ({
    usePermissions: () => ({
        canApprove: () => false,
        canCancel: () => false,
        canEdit: () => false,
        canPay: () => false,
        canReject: () => false,
        canSubmit: () => false,
        canUpload: () => false,
        isAdmin: true,
        isEmployee: false,
        isFinance: false,
        isManager: false,
        isOwner: () => false,
        role: 'ADMIN' as const,
    }),
}));

vi.mock('@/services/category.service.ts', () => ({
    categoryService: {
        create: vi.fn().mockResolvedValue({ id: '1', name: 'Test' }),
        list: vi
            .fn()
            .mockResolvedValue([{ active: true, id: '1', name: 'Transporte' }]),
        update: vi.fn(),
    },
}));

describe('CreateCategory form', () => {
    it('shows error for short name on submit', async () => {
        const Wrapper = mockAuthProvider(adminUser);

        render(<CategoriesPage />, { wrapper: Wrapper });

        // Wait for categories to load
        await waitFor(() => {
            expect(screen.getByText('Transporte')).toBeInTheDocument();
        });

        // Open create form
        await userEvent.click(
            screen.getByRole('button', { name: /new category/i }),
        );

        // Type a short name
        const nameInput = screen.getByLabelText(/name/i);
        await userEvent.type(nameInput, 'A');

        // Submit
        await userEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(
                screen.getByText('Name must be at least 2 characters'),
            ).toBeInTheDocument();
        });
    });
});
