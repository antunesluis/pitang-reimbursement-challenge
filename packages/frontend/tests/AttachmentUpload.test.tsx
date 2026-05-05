import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'bun:test';

import { AttachmentUpload } from '@/components/reimbursements/AttachmentUpload.tsx';

describe('AttachmentUpload', () => {
    it('calls onUpload for valid file', async () => {
        const onUpload = vi.fn().mockResolvedValue(undefined);

        render(<AttachmentUpload onUpload={onUpload} />);

        const file = new File(['test'], 'receipt.pdf', {
            type: 'application/pdf',
        });
        const input = screen.getByLabelText(/select a file/i);
        await userEvent.upload(input, file);

        // After file selection, the upload button appears
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /upload/i }),
            ).toBeInTheDocument();
        });
        await userEvent.click(screen.getByRole('button', { name: /upload/i }));

        await waitFor(() => {
            expect(onUpload).toHaveBeenCalledWith(file);
        });
    });

    it('shows error for file larger than 5MB', async () => {
        const onUpload = vi.fn();

        render(<AttachmentUpload onUpload={onUpload} />);

        const largeBuffer = new ArrayBuffer(6 * 1024 * 1024);
        const file = new File([largeBuffer], 'large.pdf', {
            type: 'application/pdf',
        });
        const input = screen.getByLabelText(/select a file/i);
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /upload/i }),
            ).toBeInTheDocument();
        });
        await userEvent.click(screen.getByRole('button', { name: /upload/i }));

        await waitFor(() => {
            expect(screen.getByText(/file too large/i)).toBeInTheDocument();
        });
    });
});
