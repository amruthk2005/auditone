import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { valuations } from "@/lib/mock-data";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

type Row = (typeof valuations)[number];

const cols: Column<Row>[] = [
  { key: "product", header: "Product" },
  { key: "method", header: "Method", render: (r) => <span style={{ background: "rgba(109,40,217,0.1)", color: "var(--primary)", padding: "0.125rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}>{r.method}</span> },
  { key: "value", header: "Value", render: (r) => <span style={{ fontWeight: 600 }}>${r.value.toLocaleString()}</span> },
  { key: "asOf", header: "As of" },
];

export function ValuationsPage() {
  const total = valuations.reduce((s, v) => s + v.value, 0);

  return (
    <PageShell title="Valuations" description="Current book and market values per asset.">
      <KpiStrip
        items={[
          { label: "Valuations", value: String(valuations.length), icon: Calculator },
          { label: "Total Value", value: `$${total.toLocaleString()}`, icon: DollarSign },
          { label: "Methods", value: String(new Set(valuations.map((v) => v.method)).size), icon: TrendingUp },
        ]}
      />
      <DataTable columns={cols} rows={valuations} />
    </PageShell>
  );
}
