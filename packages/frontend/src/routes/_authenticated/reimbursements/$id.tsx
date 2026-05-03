/* eslint-disable react-hooks/set-state-in-effect */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AttachmentUpload } from "@/components/AttachmentUpload.tsx";
import { RejectDialog } from "@/components/RejectDialog.tsx";
import { StatusBadge } from "@/components/StatusBadge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useAuth } from "@/contexts/auth.context.tsx";
import { attachmentService } from "@/services/attachment.service.ts";
import { reimbursementService } from "@/services/reimbursement.service.ts";

import type { Reimbursement } from "@/types/index.ts";
import type { Attachment, HistoryEntry } from "@/types/index.ts";

export const Route = createFileRoute("/_authenticated/reimbursements/$id")({
  component: ReimbursementDetailPage,
});

function ReimbursementDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [data, setData] = useState<null | Reimbursement>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [reimbursement, historyData, attachmentData] = await Promise.all([
        reimbursementService.getById(id),
        reimbursementService.getHistory(id),
        attachmentService.list(id),
      ]);
      setData(reimbursement);
      setHistory(historyData);
      setAttachments(attachmentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAction(action: () => Promise<unknown>) {
    setActionLoading(true);
    try {
      await action();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link to="/reimbursements">
            <ArrowLeft className="mr-2 size-4" />
            Back to list
          </Link>
        </Button>
        <div className="text-destructive rounded-md border p-4">
          <p>{error ?? "Reimbursement not found"}</p>
        </div>
      </div>
    );
  }

  const role = user?.role;
  const isOwner = user?.id === data.requesterId;
  const canEdit = isOwner && data.status === "DRAFT";
  const canSubmit = isOwner && data.status === "DRAFT";
  const canCancel = isOwner && (data.status === "DRAFT" || data.status === "SUBMITTED");
  const canApprove = role === "MANAGER" && data.status === "SUBMITTED";
  const canReject = role === "MANAGER" && data.status === "SUBMITTED";
  const canPay = role === "FINANCE" && data.status === "APPROVED";
  const canUpload = isOwner;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link to="/reimbursements">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{data.description}</h1>
        <StatusBadge status={data.status} />
      </div>

      {error && (
        <div className="text-destructive rounded-md border p-4">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-muted-foreground text-sm font-medium">Amount</span>
              <p className="text-lg font-semibold">${data.amount.toFixed(2)}</p>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground text-sm font-medium">Category</span>
              <p>{data.category.name}</p>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground text-sm font-medium">Expense Date</span>
              <p>{new Date(data.expenseDate).toLocaleDateString()}</p>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground text-sm font-medium">Status</span>
              <p>
                <StatusBadge status={data.status} />
              </p>
            </div>
            {data.rejectionReason && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground text-sm font-medium">Rejection Reason</span>
                  <p className="text-destructive">{data.rejectionReason}</p>
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
              <span className="text-muted-foreground text-sm font-medium">Name</span>
              <p>{data.requester.name}</p>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground text-sm font-medium">Email</span>
              <p>{data.requester.email}</p>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground text-sm font-medium">Created</span>
              <p>{new Date(data.createdAt).toLocaleString()}</p>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground text-sm font-medium">Updated</span>
              <p>{new Date(data.updatedAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {(canEdit || canSubmit || canCancel || canApprove || canReject || canPay) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {canEdit && (
              <Button asChild disabled={actionLoading}>
                <Link params={{ id: data.id }} to="/reimbursements/$id/edit">
                  Edit
                </Link>
              </Button>
            )}
            {canSubmit && (
              <Button
                disabled={actionLoading}
                onClick={() => handleAction(() => reimbursementService.submit(id))}
              >
                Submit for Review
              </Button>
            )}
            {canApprove && (
              <Button
                disabled={actionLoading}
                onClick={() => handleAction(() => reimbursementService.approve(id))}
                variant="default"
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
                onClick={() => handleAction(() => reimbursementService.pay(id))}
                variant="default"
              >
                Mark as Paid
              </Button>
            )}
            {canCancel && (
              <Button
                disabled={actionLoading}
                onClick={() => handleAction(() => reimbursementService.cancel(id))}
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
          <CardTitle className="text-lg">Attachments ({attachments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {attachments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No attachments</p>
          ) : (
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  className="flex items-center justify-between rounded-md border p-3"
                  key={att.id}
                >
                  <div>
                    <p className="font-medium">{att.fileName}</p>
                    <p className="text-muted-foreground text-sm">{att.fileType}</p>
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <a href={att.fileUrl} rel="noreferrer" target="_blank">
                      <Download className="mr-1 size-4" />
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {canUpload && (
            <AttachmentUpload
              onUpload={async (formData) => {
                await attachmentService.create(id, {
                  fileName: formData.fileName,
                  fileType: formData.fileType,
                  fileUrl: formData.fileUrl,
                });
                await fetchData();
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No history entries</p>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div className="flex items-start gap-3" key={entry.id}>
                  <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {entry.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{entry.user.name}</span>{" "}
                      <span className="text-muted-foreground">{entry.action}</span>
                    </p>
                    {entry.observation && (
                      <p className="text-muted-foreground text-sm">{entry.observation}</p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RejectDialog
        onClose={() => setRejectOpen(false)}
        onSubmit={async (formData) => {
          await handleAction(() =>
            reimbursementService.reject(id, formData.rejectionReason),
          );
          setRejectOpen(false);
        }}
        open={rejectOpen}
      />
    </div>
  );
}
