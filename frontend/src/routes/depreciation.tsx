import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { depreciation as initialMockDepreciation } from "@/lib/mock-data";
import { TrendingDown, DollarSign, Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDepreciation } from "@/lib/api";

type DepreciationItem = {
  id: number;
  product: string;
  category?: string;
  year: string;
  opening: number;
  depreciated: number;
  closing: number;
  rate?: string;
};

const cols: Column<DepreciationItem>[] = [
  { key: "product", header: "Product" },
  { key: "year", header: "Fiscal Year" },
  { key: "opening", header: "Opening Cost", render: (r) => `$${Number(r.opening || 0).toLocaleString()}` },
  { key: "depreciated", header: "Depreciation Amount", render: (r) => <span style={{ fontWeight: 500, color: "#dc2626" }}>−${Number(r.depreciated || 0).toLocaleString()} {r.rate ? `(${r.rate})` : ""}</span> },
  { key: "closing", header: "Closing Book Value", render: (r) => <span style={{ fontWeight: 600, color: "var(--primary)" }}>${Number(r.closing || 0).toLocaleString()}</span> },
];

export function DepreciationPage() {
  const { data: apiDepreciation, isLoading } = useQuery({
    queryKey: ["depreciation"],
    queryFn: fetchDepreciation,
  });

  const displayRows: DepreciationItem[] = apiDepreciation && Array.isArray(apiDepreciation) && apiDepreciation.length > 0
    ? apiDepreciation
    : initialMockDepreciation;

  const totalDep = displayRows.reduce((s, d) => s + (Number(d.depreciated) || 0), 0);
  const totalClose = displayRows.reduce((s, d) => s + (Number(d.closing) || 0), 0);

  return (
    <PageShell title="Depreciation" description="Annual depreciation schedule and net book value per asset.">
      <KpiStrip
        items={[
          { label: "Assets Tracked", value: String(displayRows.length), icon: Calendar },
          { label: "Depreciated (Yr)", value: `$${totalDep.toLocaleString()}`, icon: TrendingDown },
          { label: "Closing Value", value: `$${totalClose.toLocaleString()}`, icon: DollarSign },
        ]}
      />
      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted-foreground)" }}>
          <Loader2 size={20} className="animate-spin" style={{ display: "inline" }} /> Loading depreciation schedules...
        </div>
      ) : (
        <DataTable columns={cols} rows={displayRows} rowKey={(r) => r.id} />
      )}
    </PageShell>
  );
}
