import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { scans } from "@/lib/mock-data";

type Row = (typeof scans)[number];

const cols: Column<Row>[] = [
  { key: "id", header: "Scan", render: (r) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--primary)" }}>{r.id.toUpperCase()}</span> },
  { key: "product", header: "Product" },
  { key: "scannedAt", header: "Time" },
  { key: "result", header: "Result", render: (r) => <StatusBadge value={r.result} /> },
];

export function ScansPage() {
  return (
    <PageShell title="Scan Records" description="All QR code scan events and their outcomes.">
      <DataTable columns={cols} rows={scans} />
    </PageShell>
  );
}
