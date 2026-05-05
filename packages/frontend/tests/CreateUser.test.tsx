import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'bun:test';

import { NewUserPage } from '@/components/users/NewUserPage.tsx';

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

vi.mock('@/services/user.service.ts', () => ({
    userService: {
        create: vi.fn(),
    },
}));

describe('CreateUser form', () => {
    it('shows validation errors for invalid fields', async () => {
        const Wrapper = mockAuthProvider(adminUser);

        render(<NewUserPage />, { wrapper: Wrapper });

        // Type invalid data
        await userEvent.clear(screen.getByLabelText(/full name/i));
        await userEvent.type(screen.getByLabelText(/full name/i), 'A');
        await userEvent.clear(screen.getByLabelText(/email/i));
        await userEvent.type(screen.getByLabelText(/email/i), 'bad');
        await userEvent.clear(screen.getByLabelText(/password/i));
        await userEvent.type(screen.getByLabelText(/password/i), '12');

        await userEvent.click(
            screen.getByRole('button', { name: /create user/i }),
        );

        await waitFor(() => {
            expect(
                screen.getByText('Name must be at least 2 characters'),
            ).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText('Invalid email')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(
                screen.getByText('Password must be at least 6 characters'),
            ).toBeInTheDocument();
        });
    });
});
