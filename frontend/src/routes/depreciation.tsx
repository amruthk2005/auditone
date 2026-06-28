import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { depreciation } from "@/lib/mock-data";
import { TrendingDown, DollarSign, Calendar } from "lucide-react";

type Row = (typeof depreciation)[number];

const cols: Column<Row>[] = [
  { key: "product", header: "Product" },
  { key: "year", header: "Year" },
  { key: "opening", header: "Opening", render: (r) => `$${r.opening.toLocaleString()}` },
  { key: "depreciated", header: "Depreciated", render: (r) => <span style={{ fontWeight: 500, color: "#dc2626" }}>−${r.depreciated.toLocaleString()}</span> },
  { key: "closing", header: "Closing", render: (r) => <span style={{ fontWeight: 600, color: "var(--primary)" }}>${r.closing.toLocaleString()}</span> },
];

export function DepreciationPage() {
  const totalDep = depreciation.reduce((s, d) => s + d.depreciated, 0);
  const totalClose = depreciation.reduce((s, d) => s + d.closing, 0);

  return (
    <PageShell title="Depreciation" description="Annual depreciation schedule per asset.">
      <KpiStrip
        items={[
          { label: "Assets Tracked", value: String(depreciation.length), icon: Calendar },
          { label: "Depreciated (Yr)", value: `$${totalDep.toLocaleString()}`, icon: TrendingDown },
          { label: "Closing Value", value: `$${totalClose.toLocaleString()}`, icon: DollarSign },
        ]}
      />
      <DataTable columns={cols} rows={depreciation} />
    </PageShell>
  );
}
