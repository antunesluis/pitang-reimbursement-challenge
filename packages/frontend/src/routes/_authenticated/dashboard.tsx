import { createFileRoute, Link } from '@tanstack/react-router';
import {
    CheckCircle,
    Clock,
    DollarSign,
    FileText,
    Plus,
    Receipt,
    Tags,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { StatsCard } from '@/components/StatsCard.tsx';
import { StatusBadge } from '@/components/StatusBadge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx';
import { useAuth } from '@/contexts/auth.context.tsx';
import { categoryService } from '@/services/category.service.ts';
import { reimbursementService } from '@/services/reimbursement.service.ts';
import { userService } from '@/services/user.service.ts';

import type { Reimbursement } from '@/types/index.ts';

export const Route = createFileRoute('/_authenticated/dashboard')({
    component: DashboardPage,
});

function DashboardPage() {
    const { user } = useAuth();
    const role = user?.role;
    const isEmployee = role === 'EMPLOYEE';

    const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
    const [userCount, setUserCount] = useState(0);
    const [categoryCount, setCategoryCount] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [reimbs] = await Promise.all([
                    reimbursementService.list(),
                ]);

                setReimbursements(reimbs);

                if (role === 'ADMIN') {
                    const [users, cats] = await Promise.all([
                        userService.list(),
                        categoryService.list(),
                    ]);
                    setUserCount(users.length);
                    setCategoryCount(cats.length);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [role]);

    const draftCount = reimbursements.filter(
        (r) => r.status === 'DRAFT',
    ).length;
    const submittedCount = reimbursements.filter(
        (r) => r.status === 'SUBMITTED',
    ).length;
    const approvedCount = reimbursements.filter(
        (r) => r.status === 'APPROVED',
    ).length;
    const paidCount = reimbursements.filter((r) => r.status === 'PAID').length;
    const recent = reimbursements.slice(0, 5);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton className="h-24" key={i} />
                    ))}
                </div>
                <Skeleton className="h-48" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                {isEmployee && (
                    <Button asChild>
                        <Link to="/reimbursements/new">
                            <Plus className="mr-2 size-4" />
                            New Reimbursement
                        </Link>
                    </Button>
                )}
            </div>

            {error && <ErrorAlert message={error} />}

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {role === 'EMPLOYEE' && (
                    <>
                        <StatsCard
                            icon={Receipt}
                            label="Total"
                            value={reimbursements.length}
                        />
                        <StatsCard
                            className="border-gray-200 dark:border-gray-700"
                            icon={FileText}
                            label="Drafts"
                            value={draftCount}
                        />
                        <StatsCard
                            className="border-blue-200 dark:border-blue-800"
                            icon={Clock}
                            label="Submitted"
                            value={submittedCount}
                        />
                        <StatsCard
                            className="border-green-200 dark:border-green-800"
                            icon={CheckCircle}
                            label="Approved"
                            value={approvedCount}
                        />
                    </>
                )}

                {role === 'MANAGER' && (
                    <>
                        <StatsCard
                            icon={Receipt}
                            label="Total Pending"
                            value={reimbursements.length}
                        />
                        <StatsCard
                            className="border-blue-200 dark:border-blue-800"
                            icon={Clock}
                            label="Submitted"
                            value={submittedCount}
                        />
                        <StatsCard
                            className="border-green-200 dark:border-green-800"
                            icon={CheckCircle}
                            label="Approved Today"
                            value={approvedCount}
                        />
                        <StatsCard
                            icon={DollarSign}
                            label="Paid"
                            value={paidCount}
                        />
                    </>
                )}

                {role === 'FINANCE' && (
                    <>
                        <StatsCard
                            icon={Receipt}
                            label="Total Pending"
                            value={reimbursements.length}
                        />
                        <StatsCard
                            className="border-green-200 dark:border-green-800"
                            icon={DollarSign}
                            label="Approved — Payable"
                            value={approvedCount}
                        />
                        <StatsCard
                            className="border-purple-200 dark:border-purple-800"
                            icon={CheckCircle}
                            label="Paid"
                            value={paidCount}
                        />
                        <StatsCard
                            icon={Clock}
                            label="Volume"
                            value={reimbursements.length}
                        />
                    </>
                )}

                {role === 'ADMIN' && (
                    <>
                        <StatsCard
                            icon={Receipt}
                            label="Reimbursements"
                            value={reimbursements.length}
                        />
                        <StatsCard
                            icon={Users}
                            label="Users"
                            value={userCount}
                        />
                        <StatsCard
                            icon={Tags}
                            label="Categories"
                            value={categoryCount}
                        />
                        <StatsCard
                            className="border-yellow-200 dark:border-yellow-800"
                            icon={Clock}
                            label="Pending Review"
                            value={submittedCount}
                        />
                    </>
                )}
            </div>

            {/* Recent Reimbursements */}
            <div>
                <h2 className="mb-3 text-lg font-semibold">
                    Recent Reimbursements
                </h2>
                {recent.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        No reimbursements yet.
                    </p>
                ) : (
                    <div className="rounded-md border">
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
                                        <TableCell>
                                            ${r.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={r.status} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(
                                                r.expenseDate,
                                            ).toLocaleDateString()}
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
