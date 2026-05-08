import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'bun:test';

import { SortableHeader } from '@/components/shared/SortableHeader.tsx';

describe('SortableHeader', () => {
    it('renders label', () => {
        render(
            <table>
                <thead>
                    <tr>
                        <SortableHeader
                            field="amount"
                            label="Amount"
                            onSort={vi.fn()}
                            order="desc"
                            sort="createdAt"
                        />
                    </tr>
                </thead>
            </table>,
        );

        expect(screen.getByText('Amount')).toBeInTheDocument();
    });

    it('shows arrow when active (desc)', () => {
        render(
            <table>
                <thead>
                    <tr>
                        <SortableHeader
                            field="amount"
                            label="Amount"
                            onSort={vi.fn()}
                            order="desc"
                            sort="amount"
                        />
                    </tr>
                </thead>
            </table>,
        );

        expect(screen.getByText('▼')).toBeInTheDocument();
    });

    it('shows arrow when active (asc)', () => {
        render(
            <table>
                <thead>
                    <tr>
                        <SortableHeader
                            field="amount"
                            label="Amount"
                            onSort={vi.fn()}
                            order="asc"
                            sort="amount"
                        />
                    </tr>
                </thead>
            </table>,
        );

        expect(screen.getByText('▲')).toBeInTheDocument();
    });

    it('hides arrow when inactive', () => {
        render(
            <table>
                <thead>
                    <tr>
                        <SortableHeader
                            field="amount"
                            label="Amount"
                            onSort={vi.fn()}
                            order="desc"
                            sort="createdAt"
                        />
                    </tr>
                </thead>
            </table>,
        );

        expect(screen.queryByText('▼')).not.toBeInTheDocument();
        expect(screen.queryByText('▲')).not.toBeInTheDocument();
    });

    it('calls onSort with field and toggled order on click', async () => {
        const onSort = vi.fn();

        render(
            <table>
                <thead>
                    <tr>
                        <SortableHeader
                            field="amount"
                            label="Amount"
                            onSort={onSort}
                            order="desc"
                            sort="amount"
                        />
                    </tr>
                </thead>
            </table>,
        );

        await userEvent.click(screen.getByText('Amount'));
        expect(onSort).toHaveBeenCalledWith('amount', 'asc');
    });

    it('calls onSort with asc on first click when inactive', async () => {
        const onSort = vi.fn();

        render(
            <table>
                <thead>
                    <tr>
                        <SortableHeader
                            field="amount"
                            label="Amount"
                            onSort={onSort}
                            order="desc"
                            sort="createdAt"
                        />
                    </tr>
                </thead>
            </table>,
        );

        await userEvent.click(screen.getByText('Amount'));
        expect(onSort).toHaveBeenCalledWith('amount', 'asc');
    });
});
