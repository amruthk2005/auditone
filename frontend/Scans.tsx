import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { scans, products } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
export const Route = createFileRoute("/_authenticated/scans")({
  head: () => ({ meta: [{ title: "Scan Records — AuditOne" }] }),
}));
const cols: Column<Row>[] = [
  { key: "id", header: "Scan" },
  { key: "id", header: "Scan", render: (r) => <span className="font-mono text-xs text-primary">{r.id.toUpperCase()}</span> },
  { key: "product", header: "Product" },
  { key: "scannedAt", header: "Time" },
  {
    key: "result",
    header: "Result",
    render: (r) => (
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          r.result === "Match" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {r.result}
      </span>
    ),
  },
  { key: "result", header: "Result", render: (r) => <StatusBadge value={r.result} /> },
];
function ScansPage() {