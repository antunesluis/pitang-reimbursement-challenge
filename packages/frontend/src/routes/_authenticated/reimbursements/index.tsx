/* eslint-disable react-hooks/set-state-in-effect */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Receipt } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { StatusBadge } from "@/components/reimbursements/StatusBadge.tsx";
import { Delayed } from "@/components/shared/Delayed.tsx";
import { EmptyState } from "@/components/shared/EmptyState.tsx";
import { ErrorAlert } from "@/components/shared/ErrorAlert.tsx";
import { Pagination } from "@/components/shared/Pagination.tsx";
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

export const Route = createFileRoute("/_authenticated/reimbursements/")({
    component: ReimbursementListPage,
});

function ReimbursementListPage() {
    const { isEmployee } = usePermissions();
    const [data, setData] = useState<Reimbursement[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchPage = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await reimbursementService.list(p);
            setData(res.data);
            setPage(res.page);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPage(1);
    }, [fetchPage]);

    if (loading) {
        return (
            <Delayed>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Reimbursements</h1>
                    </div>
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton className="h-12 w-full" key={i} />
                        ))}
                    </div>
                </div>
            </Delayed>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Reimbursements</h1>
                <ErrorAlert message={error} />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Reimbursements</h1>
                    {isEmployee && (
                        <Button asChild>
                            <Link to="/reimbursements/new">
                                <Plus className="mr-2 size-4" />
                                New Reimbursement
                            </Link>
                        </Button>
                    )}
                </div>
                <EmptyState
                    action={
                        isEmployee
                            ? {
                                href: "/reimbursements/new",
                                label: "Create Reimbursement",
                            }
                            : undefined
                    }
                    description="You have no reimbursements yet."
                    icon={Receipt}
                    title="No reimbursements"
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Reimbursements ({total})
                </h1>
                {isEmployee && (
                    <Button asChild>
                        <Link to="/reimbursements/new">
                            <Plus className="mr-2 size-4" />
                            New Reimbursement
                        </Link>
                    </Button>
                )}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((r) => (
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
                                    {r.category.name}
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

            <Pagination
                onPageChange={fetchPage}
                page={page}
                totalPages={totalPages}
            />
        </div>
    );
}
