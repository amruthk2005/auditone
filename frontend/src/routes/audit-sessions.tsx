import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { auditSessions } from "@/lib/mock-data";

type S = (typeof auditSessions)[number];

const cols: Column<S>[] = [
  { key: "id", header: "Session", render: (s) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--primary)" }}>{s.id.toUpperCase()}</span> },
  { key: "auditor", header: "Auditor" },
  { key: "startedAt", header: "Started" },
  {
    key: "scanned",
    header: "Progress",
    render: (s) => {
      const pct = Math.round((s.scanned / s.expected) * 100);
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ height: "0.375rem", width: "6rem", background: "var(--muted)", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--primary)", borderRadius: "9999px", width: `${pct}%` }} />
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{s.scanned} / {s.expected}</span>
        </div>
      );
    },
  },
  { key: "status", header: "Status", render: (s) => <StatusBadge value={s.status} /> },
];

export function AuditSessionsPage() {
  return (
    <PageShell title="Audit Sessions" description="Active and historical scanning sessions.">
      <DataTable columns={cols} rows={auditSessions} />
    </PageShell>
  );
}
