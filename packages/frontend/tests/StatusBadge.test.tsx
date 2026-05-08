import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';

import { StatusBadge } from '@/components/reimbursements/StatusBadge.tsx';

describe('StatusBadge', () => {
    it('renders DRAFT with slate styling', () => {
        render(<StatusBadge status="DRAFT" />);
        const badge = screen.getByText('Draft');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('bg-slate-100');
    });

    it('renders SUBMITTED with sky styling', () => {
        render(<StatusBadge status="SUBMITTED" />);
        const badge = screen.getByText('Submitted');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('bg-sky-50');
    });

    it('renders APPROVED with emerald styling', () => {
        render(<StatusBadge status="APPROVED" />);
        const badge = screen.getByText('Approved');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('bg-emerald-50');
    });

    it('renders REJECTED with rose styling', () => {
        render(<StatusBadge status="REJECTED" />);
        const badge = screen.getByText('Rejected');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('bg-rose-50');
    });

    it('renders PAID with violet styling', () => {
        render(<StatusBadge status="PAID" />);
        const badge = screen.getByText('Paid');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('bg-violet-50');
    });

    it('renders CANCELLED with amber styling', () => {
        render(<StatusBadge status="CANCELLED" />);
        const badge = screen.getByText('Cancelled');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('bg-amber-50');
    });
});