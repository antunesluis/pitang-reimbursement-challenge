import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';

import { Delayed } from '@/components/shared/Delayed.tsx';

describe('Delayed', () => {
    it('does not render children immediately', () => {
        render(
            <Delayed ms={9999}>
                <p>Delayed content</p>
            </Delayed>,
        );
        expect(screen.queryByText('Delayed content')).not.toBeInTheDocument();
    });

    it('renders children after the delay', async () => {
        render(
            <Delayed ms={10}>
                <p>Delayed content</p>
            </Delayed>,
        );
        expect(screen.queryByText('Delayed content')).not.toBeInTheDocument();
        await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
        expect(screen.getByText('Delayed content')).toBeInTheDocument();
    });
});
