import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';

import { ErrorAlert } from '@/components/shared/ErrorAlert.tsx';

describe('ErrorAlert', () => {
    it('renders the error message in a styled container', () => {
        render(<ErrorAlert message="Something went wrong" />);
        const alert = screen.getByText('Something went wrong');
        expect(alert).toBeInTheDocument();
        expect(alert.closest('div')).toHaveClass('text-destructive');
    });
});
