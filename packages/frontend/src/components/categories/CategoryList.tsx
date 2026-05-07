import { useState } from 'react';

import { EmptyTableRow } from '@/components/shared/EmptyTableRow.tsx';
import { FieldError } from '@/components/shared/FieldError.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx';

import type { Category } from '@/types/index.ts';

type Props = {
    categories: Category[];
    onRename: (id: string, name: string) => Promise<void>;
    onToggleActive: (cat: Category) => void;
};

export function CategoryList({
    categories,
    onRename,
    onToggleActive,
}: Props) {
    const [editingId, setEditingId] = useState<null | string>(null);
    const [editName, setEditName] = useState('');
    const [editError, setEditError] = useState('');

    function startEdit(cat: Category) {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditError('');
    }

    function cancelEdit() {
        setEditingId(null);
        setEditError('');
    }

    async function saveEdit(id: string) {
        try {
            await onRename(id, editName.trim());
            setEditingId(null);
        } catch (err) {
            setEditError(
                err instanceof Error ? err.message : 'Invalid name',
            );
        }
    }

    return (
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
                        <EmptyTableRow
                            colSpan={4}
                            message="No categories found"
                        />
                    ) : (
                        categories.map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell className="font-medium">
                                    {editingId === cat.id ? (
                                        <div>
                                            <Input
                                                className="h-8 w-48"
                                                onChange={(e) => {
                                                    setEditName(
                                                        e.target.value,
                                                    );
                                                    setEditError('');
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter')
                                                        saveEdit(cat.id);
                                                    if (e.key === 'Escape')
                                                        cancelEdit();
                                                }}
                                                value={editName}
                                            />
                                            <FieldError
                                                message={editError}
                                            />
                                        </div>
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
                                        {cat.active
                                            ? 'Active'
                                            : 'Inactive'}
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
                                                    onClick={cancelEdit}
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
                                                        onToggleActive(cat)
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
    );
}
