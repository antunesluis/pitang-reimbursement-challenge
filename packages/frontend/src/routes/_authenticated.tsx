import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { useAuth } from '@/contexts/auth.context.tsx';
import { cookieStorage } from '@/lib/cookies.ts';

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: () => {
        if (!cookieStorage.getToken()) {
            throw redirect({ to: '/' });
        }
    },
    component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
    const { logout, user } = useAuth();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div>
                        <span className="font-semibold">
                            Reimbursement Control
                        </span>
                        {user && (
                            <span className="text-muted-foreground ml-4 text-sm">
                                {user.name} ({user.role})
                            </span>
                        )}
                    </div>
                    <button
                        className="text-muted-foreground hover:text-foreground text-sm"
                        onClick={logout}
                    >
                        Sign out
                    </button>
                </div>
            </header>
            <main className="container mx-auto flex-1 px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
