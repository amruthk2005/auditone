import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { reports } from "@/lib/mock-data";
import { Download, FileText } from "lucide-react";

type R = (typeof reports)[number];

const formatTint: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "#ffe4e6", color: "#b91c1c" },
  XLSX: { bg: "#d1fae5", color: "#047857" },
  CSV: { bg: "#e0f2fe", color: "#0369a1" },
};

const cols: Column<R>[] = [
  {
    key: "name",
    header: "Report",
    render: (r) => (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.375rem", background: "rgba(109,40,217,0.1)", color: "var(--primary)" }}>
          <FileText size={14} />
        </span>
        <span style={{ fontWeight: 500 }}>{r.name}</span>
      </div>
    ),
  },
  { key: "type", header: "Type", render: (r) => <span style={{ background: "rgba(109,40,217,0.1)", color: "var(--primary)", padding: "0.125rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}>{r.type}</span> },
  { key: "generatedAt", header: "Generated" },
  {
    key: "format",
    header: "Format",
    render: (r) => {
      const t = formatTint[r.format] ?? { bg: "var(--muted)", color: "var(--foreground)" };
      return <span style={{ background: t.bg, color: t.color, padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500 }}>{r.format}</span>;
    },
  },
  {
    key: "id",
    header: "",
    render: () => (
      <button className="btn btn-outline btn-sm">
        <Download size={13} /> Download
      </button>
    ),
  },
];

export function ReportsPage() {
  return (
    <PageShell
      title="Reports"
      description="Exported asset, audit, and finance reports."
      actions={
        <button className="btn btn-primary btn-sm">
          Generate report
        </button>
      }
    >
      <DataTable columns={cols} rows={reports} />
    </PageShell>
  );
}
