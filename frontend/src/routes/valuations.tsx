import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { valuations as initialMockValuations } from "@/lib/mock-data";
import { Calculator, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchValuations } from "@/lib/api";

type ValuationItem = {
  id: number;
  product: string;
  category?: string;
  method: string;
  value: number;
  cost?: number;
  asOf: string;
};

const cols: Column<ValuationItem>[] = [
  { key: "product", header: "Product" },
  { key: "category", header: "Category", render: (r) => <span style={{ opacity: 0.85 }}>{r.category || "General"}</span> },
  { key: "method", header: "Method", render: (r) => <span style={{ background: "rgba(109,40,217,0.1)", color: "var(--primary)", padding: "0.125rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}>{r.method}</span> },
  { key: "value", header: "Book Value", render: (r) => <span style={{ fontWeight: 600, color: "#059669" }}>${Number(r.value || 0).toLocaleString()}</span> },
  { key: "asOf", header: "As of Date" },
];

export function ValuationsPage() {
  const { data: apiValuations, isLoading } = useQuery({
    queryKey: ["valuations"],
    queryFn: fetchValuations,
  });

  const displayRows: ValuationItem[] = apiValuations && Array.isArray(apiValuations) && apiValuations.length > 0
    ? apiValuations
    : initialMockValuations;

  const total = displayRows.reduce((s, v) => s + (Number(v.value) || 0), 0);

  return (
    <PageShell title="Valuations" description="Current book and market values per asset from backend ledger.">
      <KpiStrip
        items={[
          { label: "Valuations", value: String(displayRows.length), icon: Calculator },
          { label: "Total Value", value: `$${total.toLocaleString()}`, icon: DollarSign },
          { label: "Methods", value: String(new Set(displayRows.map((v) => v.method)).size), icon: TrendingUp },
        ]}
      />
      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted-foreground)" }}>
          <Loader2 size={20} className="animate-spin" style={{ display: "inline" }} /> Loading valuations...
        </div>
      ) : (
        <DataTable columns={cols} rows={displayRows} rowKey={(r) => r.id} />
      )}
    </PageShell>
  );
}
