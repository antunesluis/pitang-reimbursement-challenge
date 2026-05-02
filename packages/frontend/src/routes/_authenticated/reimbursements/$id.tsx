import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reimbursements/$id')({
    component: ReimbursementDetailPage,
});

function ReimbursementDetailPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Reimbursement Detail</h1>
            <p className="text-muted-foreground">Detail view coming soon.</p>
        </div>
    );
}
