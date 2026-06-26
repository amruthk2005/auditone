import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { auditSessions } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
export const Route = createFileRoute("/_authenticated/audit-sessions")({
  head: () => ({ meta: [{ title: "Audit Sessions — AuditOne" }] }),
type S = (typeof auditSessions)[number];
const cols: Column<S>[] = [
  { key: "id", header: "Session" },
  { key: "id", header: "Session", render: (s) => <span className="font-mono text-xs text-primary">{s.id.toUpperCase()}</span> },
  { key: "auditor", header: "Auditor" },
  { key: "startedAt", header: "Started" },
  {
    key: "scanned",
    header: "Progress",
    render: (s) => `${s.scanned} / ${s.expected}`,
    render: (s) => {
      const pct = Math.round((s.scanned / s.expected) * 100);
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">
            {s.scanned} / {s.expected}
          </span>
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (s) => <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{s.status}</span>,
  },
  { key: "status", header: "Status", render: (s) => <StatusBadge value={s.status} /> },
];
function AuditSessionsPage() {