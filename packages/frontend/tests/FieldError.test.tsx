import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';

import { FieldError } from '@/components/shared/FieldError.tsx';

describe('FieldError', () => {
    it('renders the error message', () => {
        render(<FieldError message="This field is required" />);
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('returns null when message is undefined', () => {
        const { container } = render(<FieldError message={undefined} />);
        expect(container.firstChild).toBeNull();
    });

    it('returns null when message is empty', () => {
        const { container } = render(<FieldError message="" />);
        expect(container.firstChild).toBeNull();
    });
});
