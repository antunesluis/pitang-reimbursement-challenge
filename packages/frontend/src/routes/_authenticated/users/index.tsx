/* eslint-disable react-hooks/set-state-in-effect */
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

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
import { userService } from '@/services/user.service.ts';

import type { User } from '@/types/index.ts';

const searchSchema = z.object({
    limit: z.coerce.number().int().positive().max(50).default(10),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().positive().default(1),
    sort: z.enum(['createdAt', 'name']).default('createdAt'),
});

export const Route = createFileRoute('/_authenticated/users/')({
    component: UsersPage,
    validateSearch: searchSchema,
});

function UsersPage() {
    const { isAdmin } = usePermissions();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const firstLoad = useRef(true);

    const fetchPage = useCallback(async () => {
        if (firstLoad.current) setLoading(true);
        try {
            const res = await userService.list({
                limit: search.limit,
                order: search.order,
                page: search.page,
                sort: search.sort,
            });
            setUsers(res.data);
            setTotal(res.total);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load users',
            );
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

    function handlePageChange(page: number) {
        navigate({
            search: { ...search, page },
        } as never);
    }

    if (!isAdmin) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Users</h1>
                <ErrorAlert message="Admin access required" />
            </div>
        );
    }

    if (loading) {
        return (
            <Delayed>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Users</h1>
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
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Users</h1>
                </div>
                <ErrorAlert message={error} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Users ({total})</h1>
                <Button asChild>
                    <Link to="/users/new">
                        <Plus className="mr-2 size-4" />
                        New User
                    </Link>
                </Button>
            </div>

            {error && <ErrorAlert message={error} />}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <SortableHeader
                                field="name"
                                label="Name"
                                onSort={handleSort}
                                order={search.order}
                                sort={search.sort}
                            />
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <SortableHeader
                                field="createdAt"
                                label="Created"
                                onSort={handleSort}
                                order={search.order}
                                sort={search.sort}
                            />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    className="text-muted-foreground text-center"
                                    colSpan={4}
                                >
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell className="font-medium">
                                    {u.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {u.email}
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                        {u.role.charAt(0) +
                                            u.role.slice(1).toLowerCase()}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(
                                        u.createdAt,
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
