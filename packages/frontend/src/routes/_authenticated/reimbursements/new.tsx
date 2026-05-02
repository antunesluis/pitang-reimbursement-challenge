import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reimbursements/new')({
    component: NewReimbursementPage,
});

function NewReimbursementPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">New Reimbursement</h1>
            <p className="text-muted-foreground">Form coming soon.</p>
        </div>
    );
}
