import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { AppSidebar } from '@/components/app-sidebar.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar.tsx';
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
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            className="mr-2 data-[orientation=vertical]:h-4"
                            orientation="vertical"
                        />
                    </div>
                </header>
                <main className="flex-1 p-4 pt-0">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
