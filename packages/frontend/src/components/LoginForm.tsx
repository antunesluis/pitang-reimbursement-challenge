import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

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
import { useAuth } from '@/contexts/auth.context.tsx';
import { type LoginFormData, loginSchema } from '@/schemas/auth.schema.ts';

export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        setError,
    } = useForm<LoginFormData>({
        defaultValues: { email: 'admin@example.com', password: 'admin123' },
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(data: LoginFormData) {
        try {
            await login(data.email, data.password);
            router.navigate({ to: '/dashboard' });
        } catch (err) {
            setError('root', {
                message: err instanceof Error ? err.message : 'Login failed',
            });
        }
    }

    return (
        <div className="bg-muted/50 flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Reimbursement Control</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className="space-y-4"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="admin@example.com"
                                type="email"
                                {...register('email')}
                            />
                            <FieldError message={errors.email?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                            />
                            <FieldError message={errors.password?.message} />
                        </div>
                        <FieldError message={errors.root?.message} />
                        <Button
                            className="w-full"
                            disabled={isSubmitting}
                            type="submit"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
