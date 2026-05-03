import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/reimbursements/$id/edit")({
  component: () => <div className="py-12 text-center text-muted-foreground">Edit page — coming soon</div>,
});
