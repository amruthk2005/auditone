import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
export type Kpi = {
  label: string;
  value: string;
  icon: LucideIcon;
  tint?: string;
  hint?: string;
};
export function KpiStrip({ items }: { items: Kpi[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((k) => (
        <Card key={k.label}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{k.value}</p>
                {k.hint && <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>}
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${k.tint ?? "bg-primary/10 text-primary"}`}>
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}