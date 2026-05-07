/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { updateCategorySchema } from '@/schemas/category.schema.ts';
import { categoryService } from '@/services/category.service.ts';

import type { Category } from '@/types/index.ts';

export function useCategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            setCategories(await categoryService.list());
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const createCategory = useCallback(
        async (name: string) => {
            await categoryService.create(name);
            toast.success('Category created');
            setShowForm(false);
            await fetchCategories();
        },
        [fetchCategories],
    );

    const toggleActive = useCallback(
        async (cat: Category) => {
            try {
                await categoryService.update(cat.id, {
                    active: !cat.active,
                });
                toast.success(
                    cat.active
                        ? 'Category deactivated'
                        : 'Category activated',
                );
                await fetchCategories();
            } catch (err) {
                toast.error(
                    err instanceof Error
                        ? err.message
                        : 'Failed to update',
                );
            }
        },
        [fetchCategories],
    );

    const renameCategory = useCallback(
        async (id: string, name: string) => {
            const validation = updateCategorySchema.safeParse({
                name: name.trim(),
            });
            if (!validation.success) {
                throw new Error(
                    validation.error.issues[0]?.message ?? 'Invalid name',
                );
            }
            await categoryService.update(id, { name: name.trim() });
            toast.success('Category renamed');
            await fetchCategories();
        },
        [fetchCategories],
    );

    return {
        categories,
        createCategory,
        error,
        loading,
        renameCategory,
        setShowForm,
        showForm,
        toggleActive,
    };
}
