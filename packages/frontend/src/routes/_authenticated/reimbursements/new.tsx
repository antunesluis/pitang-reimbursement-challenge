import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/reimbursements/new")({
  component: () => <div className="py-12 text-center text-muted-foreground">Coming soon</div>,
});
