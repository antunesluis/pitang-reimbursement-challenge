import { CategoryForm } from '@/components/categories/CategoryForm.tsx';
import { CategoryList } from '@/components/categories/CategoryList.tsx';
import { Delayed } from '@/components/shared/Delayed.tsx';
import { ErrorAlert } from '@/components/shared/ErrorAlert.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useCategoryManagement } from '@/hooks/use-category-management.ts';
import { usePermissions } from '@/hooks/use-permissions.ts';

export function CategoriesPage() {
    const { isAdmin } = usePermissions();
    const {
        categories,
        createCategory,
        error,
        loading,
        renameCategory,
        setShowForm,
        showForm,
        toggleActive,
    } = useCategoryManagement();

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
                <CategoryForm
                    onCancel={() => setShowForm(false)}
                    onCreate={createCategory}
                />
            )}

            {error && <ErrorAlert message={error} />}

            <CategoryList
                categories={categories}
                onRename={renameCategory}
                onToggleActive={toggleActive}
            />
        </div>
    );
}
