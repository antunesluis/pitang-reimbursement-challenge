import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";

import type { HistoryEntry } from "@/types/index.ts";

type Props = {
  entries: HistoryEntry[];
};

export function HistoryTimeline({ entries }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">History</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">No history entries</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div className="flex items-start gap-3" key={entry.id}>
                <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {entry.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{entry.user.name}</span>{" "}
                    <span className="text-muted-foreground">{entry.action}</span>
                  </p>
                  {entry.observation && (
                    <p className="text-muted-foreground text-sm">{entry.observation}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
