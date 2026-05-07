import { Link } from '@tanstack/react-router';

import { ConfirmActionDialog } from '@/components/reimbursements/ConfirmActionDialog.tsx';
import { RejectDialog } from '@/components/reimbursements/RejectDialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';

import type { RejectHandler } from '@/hooks/use-reimbursement-actions.ts';

type ConfirmData = {
    closeLabel: string;
    confirmLabel: string;
    description: string;
    title: string;
    variant: 'default' | 'destructive' | 'outline';
};

type Props = {
    canApprove: boolean;
    canCancel: boolean;
    canEdit: boolean;
    canPay: boolean;
    canReject: boolean;
    canSubmit: boolean;
    confirm: ConfirmData | null;
    confirmLoading: boolean;
    dataId: string;
    loading: boolean;
    onApprove: () => void;
    onCancel: () => void;
    onCloseConfirm: () => void;
    onCloseReject: () => void;
    onConfirm: () => Promise<void>;
    onOpenReject: () => void;
    onPay: () => void;
    onSubmit: () => void;
    rejectOpen: boolean;
    rejectSubmit: RejectHandler;
};

export function ReimbursementActionsCard({
    canApprove,
    canCancel,
    canEdit,
    canPay,
    canReject,
    canSubmit,
    confirm,
    confirmLoading,
    dataId,
    loading,
    onApprove,
    onCancel,
    onCloseConfirm,
    onCloseReject,
    onConfirm,
    onOpenReject,
    onPay,
    onSubmit,
    rejectOpen,
    rejectSubmit,
}: Props) {
    const hasActions =
        canEdit ||
        canSubmit ||
        canApprove ||
        canReject ||
        canPay ||
        canCancel;

    if (!hasActions) return null;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {canEdit && (
                        <Button asChild disabled={loading}>
                            <Link
                                params={{ id: dataId }}
                                to="/reimbursements/$id/edit"
                            >
                                Edit
                            </Link>
                        </Button>
                    )}
                    {canSubmit && (
                        <Button disabled={loading} onClick={onSubmit}>
                            Submit for Review
                        </Button>
                    )}
                    {canApprove && (
                        <Button disabled={loading} onClick={onApprove}>
                            Approve
                        </Button>
                    )}
                    {canReject && (
                        <Button
                            disabled={loading}
                            onClick={onOpenReject}
                            variant="destructive"
                        >
                            Reject
                        </Button>
                    )}
                    {canPay && (
                        <Button disabled={loading} onClick={onPay}>
                            Mark as Paid
                        </Button>
                    )}
                    {canCancel && (
                        <Button
                            disabled={loading}
                            onClick={onCancel}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                    )}
                </CardContent>
            </Card>

            <ConfirmActionDialog
                closeLabel={confirm?.closeLabel ?? ''}
                confirmLabel={confirm?.confirmLabel ?? ''}
                confirmVariant={confirm?.variant}
                description={confirm?.description ?? ''}
                loading={confirmLoading}
                onClose={onCloseConfirm}
                onConfirm={onConfirm}
                open={!!confirm}
                title={confirm?.title ?? ''}
            />

            <RejectDialog
                onClose={onCloseReject}
                onSubmit={rejectSubmit}
                open={rejectOpen}
            />
        </>
    );
}
