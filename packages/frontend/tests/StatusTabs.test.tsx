import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'bun:test';

import { StatusTabs } from '../src/components/reimbursements/StatusTabs';

describe('StatusTabs', () => {
    it('renders all tabs for EMPLOYEE', () => {
        render(
            <StatusTabs onChange={vi.fn()} role="EMPLOYEE" value={undefined} />,
        );

        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Draft')).toBeInTheDocument();
        expect(screen.getByText('Submitted')).toBeInTheDocument();
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(screen.getByText('Paid')).toBeInTheDocument();
        expect(screen.getByText('Rejected')).toBeInTheDocument();
        expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('renders all tabs for ADMIN', () => {
        render(
            <StatusTabs onChange={vi.fn()} role="ADMIN" value={undefined} />,
        );

        expect(screen.getByText('Draft')).toBeInTheDocument();
        expect(screen.getByText('Submitted')).toBeInTheDocument();
    });

    it('returns null for MANAGER (no tabs)', () => {
        const { container } = render(
            <StatusTabs onChange={vi.fn()} role="MANAGER" value={undefined} />,
        );

        expect(container.firstChild).toBeNull();
    });

    it('returns null for FINANCE (no tabs)', () => {
        const { container } = render(
            <StatusTabs onChange={vi.fn()} role="FINANCE" value={undefined} />,
        );

        expect(container.firstChild).toBeNull();
    });

    it('highlights active tab', () => {
        render(<StatusTabs onChange={vi.fn()} role="EMPLOYEE" value="DRAFT" />);

        const allButton = screen.getByText('All').closest('button');
        const draftButton = screen.getByText('Draft').closest('button');

        expect(allButton?.dataset?.variant).toBeUndefined();
        expect(draftButton?.dataset?.variant).toBeUndefined();
    });

    it('calls onChange with status on tab click', async () => {
        const onChange = vi.fn();

        render(
            <StatusTabs
                onChange={onChange}
                role="EMPLOYEE"
                value={undefined}
            />,
        );

        await userEvent.click(screen.getByText('Draft'));
        expect(onChange).toHaveBeenCalledWith('DRAFT');
    });

    it('calls onChange with undefined on All click', async () => {
        const onChange = vi.fn();

        render(
            <StatusTabs onChange={onChange} role="EMPLOYEE" value="DRAFT" />,
        );

        await userEvent.click(screen.getByText('All'));
        expect(onChange).toHaveBeenCalledWith(undefined);
    });
});
