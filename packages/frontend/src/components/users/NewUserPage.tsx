import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

import { ErrorAlert } from '@/components/shared/ErrorAlert.tsx';
import { UserForm } from '@/components/users/UserForm.tsx';
import { usePermissions } from '@/hooks/use-permissions.ts';
import { type CreateUserFormData } from '@/schemas/user.schema.ts';
import { userService } from '@/services/user.service.ts';

export function NewUserPage() {
    const router = useRouter();
    const { isAdmin } = usePermissions();

    if (!isAdmin) {
        return (
            <div className="mx-auto max-w-xl space-y-6">
                <ErrorAlert message="Admin access required" />
            </div>
        );
    }

    async function onSubmit(data: CreateUserFormData) {
        await userService.create(data);
        toast.success('User created successfully');
        router.navigate({ to: '/users' });
    }

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <h1 className="text-2xl font-bold">New User</h1>

            <UserForm
                onCancel={() => router.navigate({ to: '/users' })}
                onSubmit={onSubmit}
            />
        </div>
    );
}
