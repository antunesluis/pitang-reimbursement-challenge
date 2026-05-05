import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ onPageChange, page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <Button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        size="sm"
        variant="outline"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {start > 1 && (
        <>
          <Button onClick={() => onPageChange(1)} size="sm" variant="ghost">
            1
          </Button>
          {start > 2 && <span className="px-1 text-muted-foreground">...</span>}
        </>
      )}

      {pages.map((p) => (
        <Button
          key={p}
          onClick={() => onPageChange(p)}
          size="sm"
          variant={p === page ? "default" : "ghost"}
        >
          {p}
        </Button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-muted-foreground px-1">...</span>}
          <Button onClick={() => onPageChange(totalPages)} size="sm" variant="ghost">
            {totalPages}
          </Button>
        </>
      )}

      <Button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        size="sm"
        variant="outline"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
