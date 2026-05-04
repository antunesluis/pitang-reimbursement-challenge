import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
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
    const [showPassword, setShowPassword] = useState(false);

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        setError,
    } = useForm<LoginFormData>({
        defaultValues: { email: 'admin@example.com', password: 'admin123' },
        mode: 'onBlur',
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
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-white to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
            {/* Watermark */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundColor: '#d13e36',
                    maskImage: 'url(/insigna-pitang.png)',
                    maskPosition: 'center',
                    maskRepeat: 'no-repeat',
                    maskSize: 'contain',
                    opacity: 0.3,
                    WebkitMaskImage: 'url(/insigna-pitang.png)',
                    WebkitMaskPosition: 'center',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain',
                }}
            />

            <div className="relative w-full max-w-sm space-y-6 px-4 sm:max-w-md sm:px-0">
                {/* Logo & Title */}
                <div className="flex flex-col items-center gap-2">
                    {/* <img
                        alt="Logo"
                        className="size-12"
                        src="/logo_sem_texto_pitang.png"
                    /> */}
                    <div className="text-center">
                        <h1 className="text-xl font-bold tracking-tight">
                            Pitang Reimbursement Control
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Sign in to your account
                        </p>
                    </div>
                </div>

                {/* Card */}
                <Card className="shadow-lg dark:bg-zinc-900">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Welcome back</CardTitle>
                        <CardDescription>
                            Enter your credentials to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="space-y-4"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                    <Input
                                        className="pl-10"
                                        id="email"
                                        placeholder="admin@example.com"
                                        type="email"
                                        {...register('email')}
                                    />
                                </div>
                                <FieldError message={errors.email?.message} />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                    <Input
                                        className="pr-10 pl-10"
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        {...register('password')}
                                    />
                                    <button
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        tabIndex={-1}
                                        type="button"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                                <FieldError
                                    message={errors.password?.message}
                                />
                            </div>

                            {/* Error */}
                            <FieldError message={errors.root?.message} />

                            {/* Submit */}
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
        </div>
    );
}
