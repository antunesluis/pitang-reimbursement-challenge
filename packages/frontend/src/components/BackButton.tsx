import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";

type Props = {
  label?: string;
  params?: Record<string, string>;
  to: string;
};

export function BackButton({ label = "Back", params, to }: Props) {
  return (
    <Button asChild variant="ghost">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Link params={params as unknown as any} to={to as any}>
        <ArrowLeft className="mr-2 size-4" />
        {label}
      </Link>
    </Button>
  );
}
