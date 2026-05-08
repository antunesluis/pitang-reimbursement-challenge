import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'bun:test';

import { Pagination } from '@/components/shared/Pagination.tsx';

describe('Pagination', () => {
    it('returns null for single page', () => {
        const { container } = render(
            <Pagination
                onPageChange={vi.fn()}
                page={1}
                totalPages={1}
            />,
        );

        expect(container.firstChild).toBeNull();
    });

    it('renders page buttons for multiple pages', () => {
        render(
            <Pagination
                onPageChange={vi.fn()}
                page={1}
                totalPages={5}
            />,
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
        render(
            <Pagination
                onPageChange={vi.fn()}
                page={1}
                totalPages={3}
            />,
        );

        const buttons = screen.getAllByRole('button');
        const prevButton = buttons[0];
        expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
        render(
            <Pagination
                onPageChange={vi.fn()}
                page={5}
                totalPages={5}
            />,
        );

        const buttons = screen.getAllByRole('button');
        const nextButton = buttons[buttons.length - 1];
        expect(nextButton).toBeDisabled();
    });

    it('calls onPageChange when clicking a page number', async () => {
        const onPageChange = vi.fn();

        render(
            <Pagination
                onPageChange={onPageChange}
                page={1}
                totalPages={5}
            />,
        );

        await userEvent.click(screen.getByText('3'));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange with next page on next click', async () => {
        const onPageChange = vi.fn();

        render(
            <Pagination
                onPageChange={onPageChange}
                page={2}
                totalPages={5}
            />,
        );

        const buttons = screen.getAllByRole('button');
        const nextButton = buttons[buttons.length - 1];
        await userEvent.click(nextButton);
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('shows ellipsis for large page counts', () => {
        render(
            <Pagination
                onPageChange={vi.fn()}
                page={5}
                totalPages={10}
            />,
        );

        const ellipses = screen.getAllByText('...');
        expect(ellipses.length).toBe(2);
    });

    it('highlights current page with default variant', () => {
        render(
            <Pagination
                onPageChange={vi.fn()}
                page={3}
                totalPages={5}
            />,
        );

        const currentButton = screen.getByText('3').closest('button');
        expect(currentButton?.dataset?.variant).toBeUndefined();
    });
});
