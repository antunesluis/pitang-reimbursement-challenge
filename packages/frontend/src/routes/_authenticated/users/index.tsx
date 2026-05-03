/* eslint-disable react-hooks/set-state-in-effect */
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { FieldError } from '@/components/FieldError.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
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
import {
    type CreateUserFormData,
    createUserSchema,
} from '@/schemas/user.schema.ts';
import { userService } from '@/services/user.service.ts';
import { ROLES } from '@/types/index.ts';

import type { User } from '@/types/index.ts';

export const Route = createFileRoute('/_authenticated/users/')({
    component: UsersPage,
});

function UsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        reset,
        setError: setFormError,
    } = useForm<CreateUserFormData>({
        defaultValues: { role: 'EMPLOYEE' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(createUserSchema) as any,
    });

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

    async function onSubmit(data: CreateUserFormData) {
        try {
            await userService.create(data);
            toast.success("User created");
            reset({ role: "EMPLOYEE" });
            setShowForm(false);
            await fetchUsers();
        } catch (err) {
            setFormError('root', {
                message:
                    err instanceof Error
                        ? err.message
                        : 'Failed to create user',
            });
        }
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
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Users</h1>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton className="h-12 w-full" key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Users ({users.length})</h1>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    variant={showForm ? 'outline' : 'default'}
                >
                    {showForm ? 'Cancel' : 'New User'}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Create User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="space-y-4"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        {...register('name')}
                                    />
                                    <FieldError
                                        message={errors.name?.message}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="john@example.com"
                                        type="email"
                                        {...register('email')}
                                    />
                                    <FieldError
                                        message={errors.email?.message}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        placeholder="Min 6 characters"
                                        type="password"
                                        {...register('password')}
                                    />
                                    <FieldError
                                        message={errors.password?.message}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                        id="role"
                                        {...register('role')}
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r} value={r}>
                                                {r.charAt(0) +
                                                    r.slice(1).toLowerCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {errors.root && (
                                <p className="text-destructive text-sm">
                                    {errors.root.message}
                                </p>
                            )}
                            <Button disabled={isSubmitting} type="submit">
                                {isSubmitting ? 'Creating...' : 'Create User'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

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
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
