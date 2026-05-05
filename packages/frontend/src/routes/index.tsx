import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '@/components/auth/LoginForm.tsx';

export const Route = createFileRoute('/')({
    component: LoginForm,
});
