import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar.tsx';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
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
    const { isLoading } = useAuth();

    return (
        <SidebarProvider>
            {isLoading ? (
                <Skeleton className="h-screen w-60 rounded-none" />
            ) : (
                <AppSidebar />
            )}
            <SidebarInset>
                <AppHeader />
                <main className="flex-1 p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
