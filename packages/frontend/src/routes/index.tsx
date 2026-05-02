import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

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

export const Route = createFileRoute('/')({
    component: LoginPage,
});

function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.navigate({ to: '/dashboard' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
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
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                type="email"
                                value={email}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                type="password"
                                value={password}
                            />
                        </div>
                        {error && (
                            <p className="text-destructive text-sm">{error}</p>
                        )}
                        <Button
                            className="w-full"
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
