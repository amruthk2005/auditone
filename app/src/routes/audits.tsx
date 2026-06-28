import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { StatusBadge } from "@/components/status-badge";
import { audits } from "@/lib/mock-data";
import { ClipboardList, PlayCircle, CheckCircle2, CalendarPlus } from "lucide-react";

type A = (typeof audits)[number];

const cols: Column<A>[] = [
  { key: "name", header: "Audit", render: (a) => <span style={{ fontWeight: 500, color: "var(--primary)" }}>{a.name}</span> },
  { key: "scope", header: "Scope" },
  { key: "scheduledFor", header: "Scheduled" },
  { key: "status", header: "Status", render: (a) => <StatusBadge value={a.status} /> },
];

export function AuditsPage() {
  const scheduled = audits.filter((a) => a.status === "Scheduled").length;
  const inProgress = audits.filter((a) => a.status === "In Progress").length;
  const completed = audits.filter((a) => a.status === "Completed").length;

  return (
    <PageShell
      title="Audit Schedule"
      description="Plan and track recurring physical-asset audits."
      actions={
        <button className="btn btn-primary btn-sm">
          <CalendarPlus size={15} /> Schedule audit
        </button>
      }
    >
      <KpiStrip
        items={[
          { label: "Total Audits", value: String(audits.length), icon: ClipboardList },
          { label: "Scheduled", value: String(scheduled), icon: CalendarPlus, tint: "bg-sky-100 text-sky-600" },
          { label: "In Progress", value: String(inProgress), icon: PlayCircle },
          { label: "Completed", value: String(completed), icon: CheckCircle2 },
        ]}
      />
      <DataTable columns={cols} rows={audits} />
    </PageShell>
  );
}
