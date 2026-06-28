import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { users } from "@/lib/mock-data";
import { UserPlus } from "lucide-react";

type U = (typeof users)[number];

const roleTint: Record<string, { bg: string; color: string }> = {
  Admin: { bg: "rgba(109,40,217,0.1)", color: "var(--primary)" },
  Auditor: { bg: "#e0f2fe", color: "#0369a1" },
  Manager: { bg: "#fef3c7", color: "#b45309" },
};

const cols: Column<U>[] = [
  {
    key: "name",
    header: "Name",
    render: (u) => (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--gradient-primary)", color: "#fff", fontSize: "0.72rem", fontWeight: 600, flexShrink: 0 }}>
          {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <span style={{ fontWeight: 500 }}>{u.name}</span>
      </div>
    ),
  },
  { key: "email", header: "Email", render: (u) => <span style={{ color: "var(--muted-foreground)" }}>{u.email}</span> },
  {
    key: "role",
    header: "Role",
    render: (u) => {
      const t = roleTint[u.role] ?? { bg: "var(--muted)", color: "var(--foreground)" };
      return <span style={{ background: t.bg, color: t.color, padding: "0.125rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}>{u.role}</span>;
    },
  },
  { key: "status", header: "Status", render: (u) => <StatusBadge value={u.status} /> },
];

export function UsersPage() {
  return (
    <PageShell
      title="Users"
      description="Team members with access to this workspace."
      actions={
        <button className="btn btn-primary btn-sm">
          <UserPlus size={15} /> Invite user
        </button>
      }
    >
      <DataTable columns={cols} rows={users} />
    </PageShell>
  );
}
