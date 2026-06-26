import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { depreciation, products } from "@/lib/mock-data";
import { KpiStrip } from "@/components/kpi-strip";
import { TrendingDown, DollarSign, Calendar } from "lucide-react";
export const Route = createFileRoute("/_authenticated/depreciation")({
  head: () => ({ meta: [{ title: "Depreciation — AuditOne" }] }),
  { key: "product", header: "Product" },
  { key: "year", header: "Year" },
  { key: "opening", header: "Opening", render: (r) => `$${r.opening.toLocaleString()}` },
  { key: "depreciated", header: "Depreciated", render: (r) => `$${r.depreciated.toLocaleString()}` },
  { key: "closing", header: "Closing", render: (r) => `$${r.closing.toLocaleString()}` },
  {
    key: "depreciated",
    header: "Depreciated",
    render: (r) => <span className="font-medium text-rose-600">−${r.depreciated.toLocaleString()}</span>,
  },
  { key: "closing", header: "Closing", render: (r) => <span className="font-semibold text-primary">${r.closing.toLocaleString()}</span> },
];
function DepreciationPage() {
  const totalDep = depreciation.reduce((s, d) => s + d.depreciated, 0);
  const totalClose = depreciation.reduce((s, d) => s + d.closing, 0);
  return (
    <PageShell title="Depreciation" description="Annual depreciation schedule per asset.">
      <KpiStrip
        items={[
          { label: "Assets Tracked", value: String(depreciation.length), icon: Calendar },
          { label: "Depreciated (Yr)", value: `$${totalDep.toLocaleString()}`, icon: TrendingDown, tint: "bg-rose-100 text-rose-600" },
          { label: "Closing Value", value: `$${totalClose.toLocaleString()}`, icon: DollarSign, tint: "bg-emerald-100 text-emerald-600" },
        ]}
      />
      <DataTable columns={cols} rows={rows} />
    </PageShell>
  );