import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/categories')({
    component: CategoriesPage,
});

function CategoriesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground">
                Categories management coming soon.
            </p>
        </div>
    );
}
