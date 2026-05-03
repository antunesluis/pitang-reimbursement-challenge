import { createRootRoute, Outlet } from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner.tsx";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});
