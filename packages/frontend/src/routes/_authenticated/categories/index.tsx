import { createFileRoute } from '@tanstack/react-router';

import { CategoriesPage } from '@/components/categories/CategoriesPage.tsx';

export const Route = createFileRoute('/_authenticated/categories/')({
    component: CategoriesPage,
});
