import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { reimbursementService } from '@/services/reimbursement.service.ts';

type ConfirmAction = {
    action: () => Promise<unknown>;
    closeLabel: string;
    confirmLabel: string;
    description: string;
    message: string;
    redirect: boolean;
    title: string;
    variant: 'default' | 'destructive' | 'outline';
};

export type RejectHandler = (
    data: { rejectionReason: string },
) => Promise<void>;

type UseReimbursementActionsParams = {
    id: string;
    onNavigate: () => void;
    onRefresh: () => Promise<void>;
};

export function useReimbursementActions({
    id,
    onNavigate,
    onRefresh,
}: UseReimbursementActionsParams) {
    const [actionLoading, setActionLoading] = useState(false);
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);

    const handleConfirm = useCallback(async () => {
        if (!confirm) return;
        setActionLoading(true);
        try {
            await confirm.action();
            if (confirm.redirect) {
                toast.success(confirm.message);
                onNavigate();
            } else {
                await onRefresh();
                toast.success(confirm.message);
            }
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Action failed',
            );
        } finally {
            setActionLoading(false);
            setConfirm(null);
        }
    }, [confirm, onNavigate, onRefresh]);

    const handleReject = useCallback(
        async (formData: { rejectionReason: string }) => {
            setActionLoading(true);
            try {
                await reimbursementService.reject(
                    id,
                    formData.rejectionReason,
                );
                toast.success('Reimbursement rejected');
                onNavigate();
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : 'Reject failed',
                );
            } finally {
                setActionLoading(false);
                setRejectOpen(false);
            }
        },
        [id, onNavigate],
    );

    const handlers = {
        approve: () =>
            setConfirm({
                action: () => reimbursementService.approve(id),
                closeLabel: 'Cancel',
                confirmLabel: 'Approve',
                description:
                    'The reimbursement will be approved and you will no longer be able to see it.',
                message: 'Reimbursement approved',
                redirect: true,
                title: 'Approve Reimbursement?',
                variant: 'default',
            }),
        cancel: () =>
            setConfirm({
                action: () => reimbursementService.cancel(id),
                closeLabel: 'Keep',
                confirmLabel: 'Cancel',
                description:
                    'This will cancel the reimbursement request.',
                message: 'Reimbursement cancelled',
                redirect: true,
                title: 'Cancel Reimbursement?',
                variant: 'destructive',
            }),
        pay: () =>
            setConfirm({
                action: () => reimbursementService.pay(id),
                closeLabel: 'Cancel',
                confirmLabel: 'Mark as Paid',
                description:
                    'The reimbursement will be marked as paid and you will no longer be able to see it.',
                message: 'Payment marked as paid',
                redirect: true,
                title: 'Confirm Payment?',
                variant: 'default',
            }),
        submit: () =>
            setConfirm({
                action: () => reimbursementService.submit(id),
                closeLabel: 'Cancel',
                confirmLabel: 'Submit',
                description:
                    'Once submitted, the reimbursement can no longer be edited.',
                message: 'Reimbursement submitted',
                redirect: false,
                title: 'Submit for Review?',
                variant: 'default',
            }),
    };

    return {
        actionLoading,
        confirm,
        handlers,
        onCloseConfirm: () => setConfirm(null),
        onConfirm: handleConfirm,
        reject: {
            isOpen: rejectOpen,
            onClose: () => setRejectOpen(false),
            onOpen: () => setRejectOpen(true),
            onSubmit: handleReject,
        },
    };
}
