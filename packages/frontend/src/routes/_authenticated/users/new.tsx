import { createFileRoute } from '@tanstack/react-router';

import { NewUserPage } from '@/components/users/NewUserPage.tsx';

export const Route = createFileRoute('/_authenticated/users/new')({
    component: NewUserPage,
    staticData: { breadcrumb: 'New' },
});
