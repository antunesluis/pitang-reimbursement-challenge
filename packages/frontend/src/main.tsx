import '@/styles/globals.css';

import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { NotFound } from '@/components/NotFound.tsx';
import { AuthProvider } from '@/contexts/auth.context.tsx';
import { routeTree } from '@/routeTree.gen.ts';

const router = createRouter({
    defaultNotFoundComponent: NotFound,
    routeTree,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </StrictMode>,
);
