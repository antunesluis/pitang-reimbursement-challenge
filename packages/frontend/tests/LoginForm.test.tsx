import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'bun:test';

import { LoginForm } from '@/components/auth/LoginForm.tsx';

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
    useRouter: () => ({ navigate: vi.fn() }),
}));

describe('LoginForm', () => {
    it('shows validation errors for invalid fields on submit', async () => {
        const loginMock = vi.fn();
        const Wrapper = mockAuthProvider({ ...adminUser, login: loginMock });

        render(<LoginForm />, { wrapper: Wrapper });

        // Clear form and type invalid data
        await userEvent.clear(screen.getByLabelText('Email'));
        await userEvent.type(screen.getByLabelText('Email'), 'bad-email');
        await userEvent.clear(screen.getByLabelText('Password'));
        await userEvent.type(screen.getByLabelText('Password'), '12');

        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid email')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(
                screen.getByText('Password must be at least 6 characters'),
            ).toBeInTheDocument();
        });
        expect(loginMock).not.toHaveBeenCalled();
    });

    it('button is enabled and shows correct text', () => {
        const Wrapper = mockAuthProvider({ ...adminUser, login: vi.fn() });
        render(<LoginForm />, { wrapper: Wrapper });

        expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
    });
});
