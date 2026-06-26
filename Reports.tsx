import { DataTable, type Column } from "@/components/data-table";
import { reports } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Download, FileText } from "lucide-react";
export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — AuditOne" }] }),
});
type R = (typeof reports)[number];
const formatTint: Record<string, string> = {
  PDF: "bg-rose-100 text-rose-700",
  XLSX: "bg-emerald-100 text-emerald-700",
  CSV: "bg-sky-100 text-sky-700",
};
const cols: Column<R>[] = [
  { key: "name", header: "Report" },
  { key: "type", header: "Type" },
  {
    key: "name",
    header: "Report",
    render: (r) => (
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </span>
        <span className="font-medium">{r.name}</span>
      </div>
    ),
  },
  { key: "type", header: "Type", render: (r) => <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{r.type}</span> },
  { key: "generatedAt", header: "Generated" },
  { key: "format", header: "Format" },
  {
    key: "format",
    header: "Format",
    render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${formatTint[r.format] ?? "bg-muted"}`}>{r.format}</span>,
  },
  {
    key: "id",
    header: "",
    <PageShell
      title="Reports"
      description="Exported asset, audit, and finance reports."
      actions={<Button>Generate report</Button>}
      actions={<Button variant="secondary">Generate report</Button>}
    >
      <DataTable columns={cols} rows={reports} />
    </PageShell>