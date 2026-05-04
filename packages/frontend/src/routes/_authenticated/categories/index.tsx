/* eslint-disable react-hooks/set-state-in-effect */
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Delayed } from '@/components/Delayed.tsx';
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
import { usePermissions } from '@/hooks/use-permissions.ts';
import {
    type CreateCategoryFormData,
    createCategorySchema,
} from '@/schemas/category.schema.ts';
import { categoryService } from '@/services/category.service.ts';

import type { Category } from '@/types/index.ts';

export const Route = createFileRoute('/_authenticated/categories/')({
    component: CategoriesPage,
});

function CategoriesPage() {
    const { isAdmin } = usePermissions();
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<null | string>(null);
    const [editName, setEditName] = useState('');

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        reset,
        setError: setFormError,
    } = useForm<CreateCategoryFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(createCategorySchema) as any,
    });

    async function fetchCategories() {
        try {
            setCategories(await categoryService.list());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    async function onSubmit(data: CreateCategoryFormData) {
        try {
            await categoryService.create(data.name);
            toast.success('Category created');
            reset();
            setShowForm(false);
            await fetchCategories();
        } catch (err) {
            setFormError('root', {
                message:
                    err instanceof Error ? err.message : 'Failed to create',
            });
        }
    }

    async function toggleActive(cat: Category) {
        try {
            await categoryService.update(cat.id, { active: !cat.active });
            toast.success(
                cat.active ? 'Category deactivated' : 'Category activated',
            );
            await fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    }

    async function saveEdit(id: string) {
        if (!editName.trim()) return;
        try {
            await categoryService.update(id, { name: editName.trim() });
            toast.success('Category renamed');
            setEditingId(null);
            await fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        }
    }

    function startEdit(cat: Category) {
        setEditingId(cat.id);
        setEditName(cat.name);
    }

    if (!isAdmin) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Categories</h1>
                <ErrorAlert message="Admin access required" />
            </div>
        );
    }

    if (loading) {
        return (
            <Delayed>
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold">Categories</h1>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton className="h-12 w-full" key={i} />
                    ))}
                </div>
            </Delayed>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Categories ({categories.length})
                </h1>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    variant={showForm ? 'outline' : 'default'}
                >
                    {showForm ? 'Cancel' : 'New Category'}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Create Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="flex items-end gap-3"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Transporte"
                                    {...register('name')}
                                />
                                <FieldError message={errors.name?.message} />
                            </div>
                            <Button disabled={isSubmitting} type="submit">
                                {isSubmitting ? 'Creating...' : 'Create'}
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
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[180px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    className="text-muted-foreground text-center"
                                    colSpan={4}
                                >
                                    No categories found
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">
                                        {editingId === cat.id ? (
                                            <Input
                                                className="h-8 w-48"
                                                onChange={(e) =>
                                                    setEditName(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter')
                                                        saveEdit(cat.id);
                                                    if (e.key === 'Escape')
                                                        setEditingId(null);
                                                }}
                                                value={editName}
                                            />
                                        ) : (
                                            cat.name
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                cat.active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                            }`}
                                        >
                                            {cat.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(
                                            cat.createdAt,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {editingId === cat.id ? (
                                                <>
                                                    <Button
                                                        onClick={() =>
                                                            saveEdit(cat.id)
                                                        }
                                                        size="sm"
                                                        variant="default"
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                        size="sm"
                                                        variant="ghost"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        onClick={() =>
                                                            startEdit(cat)
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        Rename
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            toggleActive(cat)
                                                        }
                                                        size="sm"
                                                        variant={
                                                            cat.active
                                                                ? 'destructive'
                                                                : 'default'
                                                        }
                                                    >
                                                        {cat.active
                                                            ? 'Deactivate'
                                                            : 'Activate'}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
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
