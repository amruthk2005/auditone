import { DataTable, type Column } from "@/components/data-table";
import { audits } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ClipboardList, PlayCircle, CheckCircle2, CalendarPlus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { KpiStrip } from "@/components/kpi-strip";
export const Route = createFileRoute("/_authenticated/audits")({
  head: () => ({ meta: [{ title: "Audit Schedule — AuditOne" }] }),
type A = (typeof audits)[number];
const cols: Column<A>[] = [
  { key: "name", header: "Audit" },
  { key: "name", header: "Audit", render: (a) => <span className="font-medium text-primary">{a.name}</span> },
  { key: "scope", header: "Scope" },
  { key: "scheduledFor", header: "Scheduled" },
  {
    key: "status",
    header: "Status",
    render: (a) => <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{a.status}</span>,
  },
  { key: "status", header: "Status", render: (a) => <StatusBadge value={a.status} /> },
];
function AuditsPage() {
  const scheduled = audits.filter((a) => a.status === "Scheduled").length;
  const inProgress = audits.filter((a) => a.status === "In Progress").length;
  const completed = audits.filter((a) => a.status === "Completed").length;
  return (
    <PageShell
      title="Audit Schedule"
      description="Plan and track recurring physical-asset audits."
      actions={<Button>Schedule audit</Button>}
      actions={
        <Button variant="secondary">
          <CalendarPlus className="h-4 w-4" /> Schedule audit
        </Button>
      }
    >
      <KpiStrip
        items={[
          { label: "Total Audits", value: String(audits.length), icon: ClipboardList },
          { label: "Scheduled", value: String(scheduled), icon: CalendarPlus, tint: "bg-sky-100 text-sky-600" },
          { label: "In Progress", value: String(inProgress), icon: PlayCircle },
          { label: "Completed", value: String(completed), icon: CheckCircle2, tint: "bg-emerald-100 text-emerald-600" },
        ]}
      />
      <DataTable columns={cols} rows={audits} />
    </PageShell>
  );