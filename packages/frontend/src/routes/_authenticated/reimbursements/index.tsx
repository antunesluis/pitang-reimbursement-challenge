/* eslint-disable react-hooks/set-state-in-effect */
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import { CategorySelect } from '@/components/categories/CategorySelect.tsx';
import { StatusBadge } from '@/components/reimbursements/StatusBadge.tsx';
import { StatusTabs } from '@/components/reimbursements/StatusTabs.tsx';
import { Delayed } from '@/components/shared/Delayed.tsx';
import { ErrorAlert } from '@/components/shared/ErrorAlert.tsx';
import { Pagination } from '@/components/shared/Pagination.tsx';
import { SortableHeader } from '@/components/shared/SortableHeader.tsx';
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
import { usePermissions } from '@/hooks/use-permissions.ts';
import { reimbursementService } from '@/services/reimbursement.service.ts';

import type { Reimbursement, Status } from '@/types/index.ts';

const searchSchema = z.object({
    categoryId: z.string().optional(),
    limit: z.coerce.number().int().positive().max(50).default(10),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().positive().default(1),
    sort: z.enum(['amount', 'createdAt', 'expenseDate']).default('createdAt'),
    status: z
        .enum([
            'APPROVED',
            'CANCELLED',
            'DRAFT',
            'PAID',
            'REJECTED',
            'SUBMITTED',
        ])
        .optional(),
});

export const Route = createFileRoute('/_authenticated/reimbursements/')({
    component: ReimbursementListPage,
    validateSearch: searchSchema,
});

function ReimbursementListPage() {
    const { isEmployee, role } = usePermissions();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const [data, setData] = useState<Reimbursement[]>([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const firstLoad = useRef(true);

    const fetchPage = useCallback(async () => {
        if (firstLoad.current) setLoading(true);
        try {
            const res = await reimbursementService.list({
                categoryId: search.categoryId,
                limit: search.limit,
                order: search.order,
                page: search.page,
                sort: search.sort,
                status: search.status,
            });
            setData(res.data);
            setTotal(res.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            if (firstLoad.current) {
                setLoading(false);
                firstLoad.current = false;
            }
        }
    }, [search]);

    useEffect(() => {
        fetchPage();
    }, [fetchPage]);

    function handleSort(field: string, order: string) {
        navigate({
            search: { ...search, order, page: 1, sort: field },
        } as never);
    }

    function handleStatusChange(status: Status | undefined) {
        navigate({
            search: { ...search, page: 1, status },
        } as never);
    }

    function handleCategoryChange(categoryId: string) {
        navigate({
            search: {
                ...search,
                categoryId: categoryId || undefined,
                page: 1,
            },
        } as never);
    }

    function handlePageChange(page: number) {
        navigate({
            search: { ...search, page },
        } as never);
    }

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Reimbursements ({total})</h1>
                {isEmployee && (
                    <Button asChild>
                        <Link to="/reimbursements/new">
                            <Plus className="mr-2 size-4" />
                            New Reimbursement
                        </Link>
                    </Button>
                )}
            </div>

            {role && (
                <>
                    <StatusTabs
                        onChange={handleStatusChange}
                        role={role}
                        value={search.status}
                    />
                    <div className="w-full max-w-xs">
                        <CategorySelect
                            onChange={handleCategoryChange}
                            value={search.categoryId ?? ''}
                        />
                    </div>
                </>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <SortableHeader
                                field="amount"
                                label="Amount"
                                onSort={handleSort}
                                order={search.order}
                                sort={search.sort}
                            />
                            <TableHead>Status</TableHead>
                            <TableHead>Category</TableHead>
                            <SortableHeader
                                field="expenseDate"
                                label="Date"
                                onSort={handleSort}
                                order={search.order}
                                sort={search.sort}
                            />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    className="text-muted-foreground text-center"
                                    colSpan={5}
                                >
                                    No reimbursements found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((r) => (
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
                                        {r.category.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(
                                            r.expenseDate,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                onPageChange={handlePageChange}
                page={search.page}
                totalPages={Math.ceil(total / search.limit)}
            />
        </div>
    );
}
