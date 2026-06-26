import { DataTable, type Column } from "@/components/data-table";
import { users } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users — AuditOne" }] }),
});
type U = (typeof users)[number];
const roleTint: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Auditor: "bg-sky-100 text-sky-700",
  Manager: "bg-amber-100 text-amber-700",
};
const cols: Column<U>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  {
    key: "status",
    header: "Status",
    render: (u) => <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{u.status}</span>,
    key: "name",
    header: "Name",
    render: (u) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
        </div>
        <span className="font-medium">{u.name}</span>
      </div>
    ),
  },
  { key: "email", header: "Email", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
  {
    key: "role",
    header: "Role",
    render: (u) => <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${roleTint[u.role] ?? "bg-muted"}`}>{u.role}</span>,
  },
  { key: "status", header: "Status", render: (u) => <StatusBadge value={u.status} /> },
];
function UsersPage() {
    <PageShell
      title="Users"
      description="Team members with access to this workspace."
      actions={<Button>Invite user</Button>}
      actions={
        <Button variant="secondary">
          <UserPlus className="h-4 w-4" /> Invite user
        </Button>
      }
    >
      <DataTable columns={cols} rows={users} />
    </PageShell>
