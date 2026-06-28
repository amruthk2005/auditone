import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { valuations, products } from "@/lib/mock-data";
import { KpiStrip } from "@/components/kpi-strip";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
export const Route = createFileRoute("/_authenticated/valuations")({
  head: () => ({ meta: [{ title: "Valuations — AuditOne" }] }),
const cols: Column<Row>[] = [
  { key: "product", header: "Product" },
  { key: "method", header: "Method" },
  { key: "value", header: "Value", render: (r) => `$${r.value.toLocaleString()}` },
  {
    key: "method",
    header: "Method",
    render: (r) => <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{r.method}</span>,
  },
  { key: "value", header: "Value", render: (r) => <span className="font-semibold">${r.value.toLocaleString()}</span> },
  { key: "asOf", header: "As of" },
];
function ValuationsPage() {
  const total = valuations.reduce((s, v) => s + v.value, 0);
  return (
    <PageShell title="Valuations" description="Current book and market values per asset.">
      <KpiStrip
        items={[
          { label: "Valuations", value: String(valuations.length), icon: Calculator },
          { label: "Total Value", value: `$${total.toLocaleString()}`, icon: DollarSign, tint: "bg-emerald-100 text-emerald-600" },
          { label: "Methods", value: String(new Set(valuations.map((v) => v.method)).size), icon: TrendingUp, tint: "bg-sky-100 text-sky-600" },
        ]}
      />
      <DataTable columns={cols} rows={rows} />
    </PageShell>
  );
