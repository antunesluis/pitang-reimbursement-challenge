/* eslint-disable react-hooks/set-state-in-effect */
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Delayed } from '@/components/Delayed.tsx';
import { EmptyState } from '@/components/EmptyState.tsx';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
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

export const Route = createFileRoute('/_authenticated/users/')({
    component: UsersPage,
});

function UsersPage() {
    const { isAdmin } = usePermissions();
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    async function fetchUsers() {
        try {
            setUsers(await userService.list());
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load users',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

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
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton className="h-12 w-full" key={i} />
                    ))}
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

    if (users.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Users</h1>
                    <Button asChild>
                        <Link to="/users/new">
                            <Plus className="mr-2 size-4" />
                            New User
                        </Link>
                    </Button>
                </div>
                <EmptyState
                    action={{
                        href: '/users/new',
                        label: 'Create User',
                    }}
                    description="No users have been created yet."
                    icon={Users}
                    title="No users found"
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Users ({users.length})</h1>
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
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell className="font-medium">
                                    {u.name}
                                </TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground text-xs">
                                        {u.role}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(
                                        u.createdAt,
                                    ).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
