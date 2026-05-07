import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { Delayed } from '@/components/shared/Delayed.tsx';
import { EmptyTableRow } from '@/components/shared/EmptyTableRow.tsx';
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
import { useUserList } from '@/hooks/use-user-list.ts';
import { capitalize } from '@/lib/format.ts';
import { userListSearchSchema } from '@/schemas/user.schema.ts';

export const Route = createFileRoute('/_authenticated/users/')({
    component: UsersPage,
    validateSearch: userListSearchSchema,
});

function UsersPage() {
    const { isAdmin } = usePermissions();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const { error, loading, total, users } = useUserList(search);

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
                            <EmptyTableRow
                                colSpan={4}
                                message="No users found"
                            />
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
                                        <span className="bg-primary/10 text-primary inline-flex rounded-full px-2 py-0.5 text-xs font-medium">
                                            {capitalize(u.role)}
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
