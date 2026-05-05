import { createFileRoute, Link } from "@tanstack/react-router";
import {
    CheckCircle,
    Clock,
    DollarSign,
    FileText,
    Plus,
    Receipt,
    Tags,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Delayed } from "@/components/Delayed.tsx";
import { ErrorAlert } from "@/components/ErrorAlert.tsx";
import { StatsCard } from "@/components/StatsCard.tsx";
import { StatusBadge } from "@/components/StatusBadge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import { usePermissions } from "@/hooks/use-permissions.ts";
import { reimbursementService } from "@/services/reimbursement.service.ts";

import type { Reimbursement } from "@/types/index.ts";
import type { ReimbursementStats } from "@/types/index.ts";

export const Route = createFileRoute("/_authenticated/dashboard")({
    component: DashboardPage,
    staticData: { breadcrumb: "Dashboard" },
});

function DashboardPage() {
    const perm = usePermissions();

    const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
    const [stats, setStats] = useState<ReimbursementStats>({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [statsData, reimbs] = await Promise.all([
                    reimbursementService.getStats(),
                    reimbursementService.list(1, 5),
                ]);
                setStats(statsData);
                setReimbursements(reimbs.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const recent = reimbursements.slice(0, 5);

    if (loading) {
        return (
            <Delayed>
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton className="h-24" key={i} />
                        ))}
                    </div>
                    <Skeleton className="h-48" />
                </div>
            </Delayed>
        );
    }

    const cards = perm.isEmployee ? (
        <>
            <StatsCard icon={Receipt} label="Total" value={stats.total ?? 0} />
            <StatsCard className="border-muted" icon={FileText} label="Drafts" value={stats.draft ?? 0} />
            <StatsCard className="border-blue-200 dark:border-blue-800" icon={Clock} label="Submitted" value={stats.submitted ?? 0} />
            <StatsCard className="border-green-200 dark:border-green-800" icon={CheckCircle} label="Approved" value={stats.approved ?? 0} />
        </>
    ) : perm.isManager ? (
        <>
            <StatsCard icon={Clock} label="Pending" value={stats.pending ?? 0} />
            <StatsCard className="border-green-200 dark:border-green-800" icon={CheckCircle} label="Approved (this month)" value={stats.approvedThisMonth ?? 0} />
            <StatsCard className="border-red-200 dark:border-red-800" icon={Clock} label="Rejected (this month)" value={stats.rejectedThisMonth ?? 0} />
        </>
    ) : perm.isFinance ? (
        <>
            <StatsCard icon={Receipt} label="Pending" value={stats.pending ?? 0} />
            <StatsCard className="border-purple-200 dark:border-purple-800" icon={DollarSign} label="Paid (this month)" value={stats.paidThisMonth ?? 0} />
            <StatsCard icon={Clock} label="Volume (this month)" value={stats.volumeThisMonth ?? 0} />
        </>
    ) : (
        <>
            <StatsCard icon={Receipt} label="Reimbursements" value={stats.reimbursements ?? 0} />
            <StatsCard icon={Users} label="Users" value={stats.users ?? 0} />
            <StatsCard icon={Tags} label="Categories" value={stats.categories ?? 0} />
            <StatsCard className="border-yellow-200 dark:border-yellow-800" icon={Clock} label="Pending Review" value={stats.pendingReview ?? 0} />
        </>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                {perm.isEmployee && (
                    <Button asChild>
                        <Link to="/reimbursements/new">
                            <Plus className="mr-2 size-4" />
                            New Reimbursement
                        </Link>
                    </Button>
                )}
            </div>

            {error && <ErrorAlert message={error} />}

            {/* Stats — cards fill available width */}
            <div className="flex flex-wrap gap-4">
                {cards}
            </div>

            {/* Recent Reimbursements */}
            <div>
                <h2 className="mb-3 text-lg font-semibold">Recent Reimbursements</h2>
                {recent.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No reimbursements yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recent.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                className="hover:underline"
                                                params={{ id: r.id }}
                                                to="/reimbursements/$id"
                                            >
                                                {r.description}
                                            </Link>
                                        </TableCell>
                                        <TableCell>${r.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={r.status} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(r.expenseDate).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
