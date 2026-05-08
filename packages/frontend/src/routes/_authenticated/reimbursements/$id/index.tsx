/* eslint-disable react-hooks/set-state-in-effect */
import { createFileRoute } from '@tanstack/react-router';
import { Download } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { HistoryTimeline } from '@/components/reimbursements/HistoryTimeline.tsx';
import { ReimbursementActionsCard } from '@/components/reimbursements/ReimbursementActionsCard.tsx';
import { ReimbursementDetailsCard } from '@/components/reimbursements/ReimbursementDetailsCard.tsx';
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
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { ATTACHMENT_REQUIRED_THRESHOLD } from '@/config/index.ts';
import { usePermissions } from '@/hooks/use-permissions.ts';
import { useReimbursementActions } from '@/hooks/use-reimbursement-actions.ts';
import { getFileUrl } from '@/lib/api.ts';
import { attachmentService } from '@/services/attachment.service.ts';
import { reimbursementService } from '@/services/reimbursement.service.ts';

import type { Attachment, HistoryEntry } from '@/types/index.ts';
import type { Reimbursement } from '@/types/index.ts';

export const Route = createFileRoute('/_authenticated/reimbursements/$id/')({
    component: ReimbursementDetailPage,
    staticData: { breadcrumb: 'Detail' },
});

function ReimbursementDetailPage() {
    const { id } = Route.useParams();
    const navigate = Route.useNavigate();
    const perm = usePermissions();
    const [data, setData] = useState<null | Reimbursement>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

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

    const {
        actionLoading,
        confirm,
        handlers: actionHandlers,
        onCloseConfirm,
        onConfirm,
        reject,
    } = useReimbursementActions({
        id,
        onNavigate: () => navigate({ to: '/reimbursements' }),
        onRefresh: fetchData,
    });

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

    if (!data) {
        return (
            <div className="space-y-4">
                <ErrorAlert message={error ?? 'Reimbursement not found'} />
            </div>
        );
    }

    const submitBlocked =
        data.amount > ATTACHMENT_REQUIRED_THRESHOLD &&
        attachments.length === 0;

    return (
        <div className="space-y-6">
            {error && <ErrorAlert message={error} />}

            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">{data.description}</h1>
                <StatusBadge status={data.status} />
            </div>

            <ReimbursementDetailsCard data={data} />

            {submitBlocked && (
                <p className="text-destructive text-sm">
                    At least one attachment is required before submitting
                    amounts above ${ATTACHMENT_REQUIRED_THRESHOLD}.
                </p>
            )}

            <ReimbursementActionsCard
                canApprove={perm.canApprove(data.status)}
                canCancel={perm.canCancel(data.status, data.requesterId)}
                canEdit={perm.canEdit(data.status, data.requesterId)}
                canPay={perm.canPay(data.status)}
                canReject={perm.canReject(data.status)}
                canSubmit={
                    perm.canSubmit(data.status, data.requesterId) &&
                    !submitBlocked
                }
                confirm={
                    confirm
                        ? {
                              closeLabel: confirm.closeLabel,
                              confirmLabel: confirm.confirmLabel,
                              description: confirm.description,
                              title: confirm.title,
                              variant: confirm.variant,
                          }
                        : null
                }
                confirmLoading={actionLoading}
                dataId={data.id}
                loading={actionLoading}
                onApprove={actionHandlers.approve}
                onCancel={actionHandlers.cancel}
                onCloseConfirm={onCloseConfirm}
                onCloseReject={reject.onClose}
                onConfirm={onConfirm}
                onOpenReject={reject.onOpen}
                onPay={actionHandlers.pay}
                onSubmit={actionHandlers.submit}
                rejectOpen={reject.isOpen}
                rejectSubmit={reject.onSubmit}
            />

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
        </div>
    );
}
