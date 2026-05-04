import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { FieldError } from '@/components/FieldError.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { usePermissions } from '@/hooks/use-permissions.ts';
import {
    type CreateUserFormData,
    createUserSchema,
} from '@/schemas/user.schema.ts';
import { userService } from '@/services/user.service.ts';
import { ROLES } from '@/types/index.ts';

export const Route = createFileRoute('/_authenticated/users/new')({
    component: NewUserPage,
    staticData: { breadcrumb: 'New' },
});

function NewUserPage() {
    const router = useRouter();
    const { isAdmin } = usePermissions();

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        reset,
        setError,
    } = useForm<CreateUserFormData>({
        defaultValues: { role: 'EMPLOYEE' },
        mode: 'onBlur',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(createUserSchema) as any,
    });

    if (!isAdmin) {
        return (
            <div className="mx-auto max-w-xl space-y-6">
                <ErrorAlert message="Admin access required" />
            </div>
        );
    }

    async function onSubmit(data: CreateUserFormData) {
        try {
            await userService.create(data);
            toast.success('User created successfully');
            reset({ role: 'EMPLOYEE' });
            router.navigate({ to: '/users' });
        } catch (err) {
            setError('root', {
                message:
                    err instanceof Error
                        ? err.message
                        : 'Failed to create user',
            });
        }
    }

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <h1 className="text-2xl font-bold">New User</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">User Details</CardTitle>
                    <CardDescription>
                        Create a new user account. All fields are required.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className="space-y-5"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    autoComplete="name"
                                    id="name"
                                    placeholder="John Doe"
                                    {...register('name')}
                                />
                                <FieldError message={errors.name?.message} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    autoComplete="email"
                                    id="email"
                                    placeholder="john@example.com"
                                    type="email"
                                    {...register('email')}
                                />
                                <FieldError message={errors.email?.message} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    autoComplete="new-password"
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
                                <FieldError message={errors.role?.message} />
                            </div>
                        </div>

                        <FieldError message={errors.root?.message} />

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                className="w-full sm:w-auto"
                                disabled={isSubmitting}
                                type="submit"
                            >
                                {isSubmitting ? 'Creating...' : 'Create User'}
                            </Button>
                            <Button
                                asChild
                                className="w-full sm:w-auto"
                                disabled={isSubmitting}
                                variant="outline"
                            >
                                <Link to="/users">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
