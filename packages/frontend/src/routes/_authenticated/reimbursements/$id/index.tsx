/* eslint-disable react-hooks/set-state-in-effect */
import { createFileRoute, Link } from '@tanstack/react-router';
import { Download } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmActionDialog } from '@/components/reimbursements/ConfirmActionDialog.tsx';
import { HistoryTimeline } from '@/components/reimbursements/HistoryTimeline.tsx';
import { RejectDialog } from '@/components/reimbursements/RejectDialog.tsx';
import { StatusBadge } from '@/components/reimbursements/StatusBadge.tsx';
import { Delayed } from '@/components/shared/Delayed.tsx';
import { ErrorAlert } from '@/components/shared/ErrorAlert.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { usePermissions } from '@/hooks/use-permissions.ts';
import { getFileUrl } from '@/lib/api.ts';
import { attachmentService } from '@/services/attachment.service.ts';
import { reimbursementService } from '@/services/reimbursement.service.ts';

import type { Reimbursement } from '@/types/index.ts';
import type { Attachment, HistoryEntry } from '@/types/index.ts';

export const Route = createFileRoute('/_authenticated/reimbursements/$id/')({
    component: ReimbursementDetailPage,
    staticData: { breadcrumb: 'Detail' },
});

type ConfirmAction = {
    action: () => Promise<unknown>;
    confirmLabel: string;
    description: string;
    message: string;
    redirect: boolean;
    title: string;
    variant: 'default' | 'destructive' | 'outline';
};

function ReimbursementDetailPage() {
    const { id } = Route.useParams();
    const navigate = Route.useNavigate();
    const perm = usePermissions();
    const [data, setData] = useState<null | Reimbursement>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [reimbursement, historyData, attachmentData] =
                await Promise.all([
                    reimbursementService.getById(id),
                    reimbursementService.getHistory(id),
                    attachmentService.list(id),
                ]);
            setData(reimbursement);
            setHistory(historyData);
            setAttachments(attachmentData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    async function handleConfirm() {
        if (!confirm) return;
        setActionLoading(true);
        try {
            await confirm.action();
            if (confirm.redirect) {
                toast.success(confirm.message);
                navigate({ to: '/reimbursements' });
            } else {
                await fetchData();
                toast.success(confirm.message);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setActionLoading(false);
            setConfirm(null);
        }
    }

    async function handleRejectSubmit(formData: { rejectionReason: string }) {
        setActionLoading(true);
        try {
            await reimbursementService.reject(id, formData.rejectionReason);
            toast.success('Reimbursement rejected');
            navigate({ to: '/reimbursements' });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Reject failed');
        } finally {
            setActionLoading(false);
            setRejectOpen(false);
        }
    }

    if (loading) {
        return (
            <Delayed>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-24" />
                    <Skeleton className="h-48" />
                </div>
            </Delayed>
        );
    }

    if (error || !data) {
        return (
            <div className="space-y-4">
                <ErrorAlert message={error ?? 'Reimbursement not found'} />
            </div>
        );
    }

    const canEdit = perm.canEdit(data.status, data.requesterId);
    const canSubmit = perm.canSubmit(data.status, data.requesterId);
    const canCancel = perm.canCancel(data.status, data.requesterId);
    const canApprove = perm.canApprove(data.status);
    const canReject = perm.canReject(data.status);
    const canPay = perm.canPay(data.status);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">{data.description}</h1>
                <StatusBadge status={data.status} />
            </div>

            {error && <ErrorAlert message={error} />}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <span className="text-muted-foreground text-sm font-medium">
                                Amount
                            </span>
                            <p className="text-lg font-semibold">
                                ${data.amount.toFixed(2)}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground text-sm font-medium">
                                Category
                            </span>
                            <p>{data.category.name}</p>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground text-sm font-medium">
                                Expense Date
                            </span>
                            <p>
                                {new Date(
                                    data.expenseDate,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground text-sm font-medium">
                                Status
                            </span>
                            <p>
                                <StatusBadge status={data.status} />
                            </p>
                        </div>
                        {data.rejectionReason && (
                            <>
                                <Separator />
                                <div>
                                    <span className="text-muted-foreground text-sm font-medium">
                                        Rejection Reason
                                    </span>
                                    <p className="text-destructive">
                                        {data.rejectionReason}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Requester</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <span className="text-muted-foreground text-sm font-medium">
                                Name
                            </span>
                            <p>{data.requester.name}</p>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground text-sm font-medium">
                                Email
                            </span>
                            <p>{data.requester.email}</p>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground text-sm font-medium">
                                Created
                            </span>
                            <p>{new Date(data.createdAt).toLocaleString()}</p>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground text-sm font-medium">
                                Updated
                            </span>
                            <p>{new Date(data.updatedAt).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            {(canEdit ||
                canSubmit ||
                canCancel ||
                canApprove ||
                canReject ||
                canPay) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {canEdit && (
                            <Button asChild disabled={actionLoading}>
                                <Link
                                    params={{ id: data.id }}
                                    to="/reimbursements/$id/edit"
                                >
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {canSubmit && (
                            <Button
                                disabled={actionLoading}
                                onClick={() =>
                                    setConfirm({
                                        action: () =>
                                            reimbursementService.submit(id),
                                        confirmLabel: 'Submit',
                                        description:
                                            'Once submitted, the reimbursement can no longer be edited.',
                                        message: 'Reimbursement submitted',
                                        redirect: false,
                                        title: 'Submit for Review?',
                                        variant: 'default',
                                    })
                                }
                            >
                                Submit for Review
                            </Button>
                        )}
                        {canApprove && (
                            <Button
                                disabled={actionLoading}
                                onClick={() =>
                                    setConfirm({
                                        action: () =>
                                            reimbursementService.approve(id),
                                        confirmLabel: 'Approve',
                                        description:
                                            'The reimbursement will be approved and you will no longer be able to see it.',
                                        message: 'Reimbursement approved',
                                        redirect: true,
                                        title: 'Approve Reimbursement?',
                                        variant: 'default',
                                    })
                                }
                            >
                                Approve
                            </Button>
                        )}
                        {canReject && (
                            <Button
                                disabled={actionLoading}
                                onClick={() => setRejectOpen(true)}
                                variant="destructive"
                            >
                                Reject
                            </Button>
                        )}
                        {canPay && (
                            <Button
                                disabled={actionLoading}
                                onClick={() =>
                                    setConfirm({
                                        action: () =>
                                            reimbursementService.pay(id),
                                        confirmLabel: 'Mark as Paid',
                                        description:
                                            'The reimbursement will be marked as paid and you will no longer be able to see it.',
                                        message: 'Payment marked as paid',
                                        redirect: true,
                                        title: 'Confirm Payment?',
                                        variant: 'default',
                                    })
                                }
                            >
                                Mark as Paid
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                disabled={actionLoading}
                                onClick={() =>
                                    setConfirm({
                                        action: () =>
                                            reimbursementService.cancel(id),
                                        confirmLabel: 'Cancel',
                                        description:
                                            'This will cancel the reimbursement request.',
                                        message: 'Reimbursement cancelled',
                                        redirect: true,
                                        title: 'Cancel Reimbursement?',
                                        variant: 'destructive',
                                    })
                                }
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Attachments */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Attachments ({attachments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {attachments.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No attachments
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {attachments.map((att) => (
                                <div
                                    className="flex items-center justify-between rounded-md border p-3"
                                    key={att.id}
                                >
                                    <div>
                                        <p className="font-medium">
                                            {att.fileName}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {att.fileType}
                                        </p>
                                    </div>
                                    <Button asChild size="sm" variant="ghost">
                                        <a
                                            href={getFileUrl(att.fileUrl)}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            <Download className="mr-1 size-4" />
                                            View
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* History */}
            <HistoryTimeline entries={history} />

            <RejectDialog
                onClose={() => setRejectOpen(false)}
                onSubmit={handleRejectSubmit}
                open={rejectOpen}
            />

            <ConfirmActionDialog
                confirmLabel={confirm?.confirmLabel ?? ''}
                confirmVariant={confirm?.variant}
                description={confirm?.description ?? ''}
                loading={actionLoading}
                onClose={() => setConfirm(null)}
                onConfirm={handleConfirm}
                open={!!confirm}
                title={confirm?.title ?? ''}
            />
        </div>
    );
}
