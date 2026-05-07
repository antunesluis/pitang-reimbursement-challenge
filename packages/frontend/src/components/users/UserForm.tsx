import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '@/components/shared/FieldError.tsx';
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
import { capitalize } from '@/lib/format.ts';
import {
    type CreateUserFormData,
    createUserSchema,
} from '@/schemas/user.schema.ts';
import { Role, ROLES } from '@/types/index.ts';

type Props = {
    onCancel: () => void;
    onSubmit: (data: CreateUserFormData) => Promise<void>;
};

export function UserForm({ onCancel, onSubmit }: Props) {
    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        reset,
        setError,
    } = useForm<CreateUserFormData>({
        defaultValues: { role: Role.EMPLOYEE },
        mode: 'onBlur',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(createUserSchema) as any,
    });

    async function handleFormSubmit(data: CreateUserFormData) {
        try {
            await onSubmit(data);
            reset({ role: Role.EMPLOYEE });
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
                    onSubmit={handleSubmit(handleFormSubmit)}
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
                            <FieldError message={errors.password?.message} />
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
                                        {capitalize(r)}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.role?.message} />
                        </div>
                    </div>

                    {errors.root?.message && (
                        <p className="text-destructive text-sm">
                            {errors.root.message}
                        </p>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            className="w-full sm:w-auto"
                            disabled={isSubmitting}
                            type="submit"
                        >
                            {isSubmitting
                                ? 'Creating...'
                                : 'Create User'}
                        </Button>
                        <Button
                            className="w-full sm:w-auto"
                            disabled={isSubmitting}
                            onClick={onCancel}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
