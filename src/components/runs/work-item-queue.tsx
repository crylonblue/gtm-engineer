"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type WorkItem = {
  _id: string;
  itemKey: string;
  itemType: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "dead_letter" | "skipped";
};

function statusBadge(status: string) {
  const cls =
    status === "completed"
      ? "bg-green-600 text-white border-transparent"
      : status === "failed" || status === "dead_letter"
        ? ""
        : status === "in_progress"
          ? "bg-yellow-600 text-white border-transparent"
          : "";
  const variant =
    status === "failed" || status === "dead_letter" ? "destructive" as const : "secondary" as const;
  return (
    <Badge variant={variant} className={cls}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function WorkItemQueue({ items }: { items: WorkItem[] }) {
  const counts: Record<string, number> = {};
  items.forEach((i) => {
    counts[i.status] = (counts[i.status] || 0) + 1;
  });

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Work Item Queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          {Object.entries(counts).map(([status, count]) => (
            <span key={status} className="text-muted-foreground">
              {status.replace("_", " ")}: <span className="font-medium text-foreground">{count}</span>
            </span>
          ))}
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No work items.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Key</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{item.itemKey}</td>
                    <td className="py-2 pr-4">{item.itemType}</td>
                    <td className="py-2">{statusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
