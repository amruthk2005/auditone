import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { companies } from "@/lib/mock-data";
import { Building2 } from "lucide-react";

type C = (typeof companies)[number];

const cols: Column<C>[] = [
  {
    key: "name",
    header: "Company",
    render: (c) => (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", background: "var(--gradient-primary)", color: "#fff" }}>
          <Building2 size={15} />
        </span>
        <span style={{ fontWeight: 500 }}>{c.name}</span>
      </div>
    ),
  },
  { key: "industry", header: "Industry", render: (c) => <span style={{ background: "rgba(109,40,217,0.1)", color: "var(--primary)", padding: "0.125rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}>{c.industry}</span> },
  { key: "users", header: "Users" },
  { key: "products", header: "Products", render: (c) => <span style={{ fontWeight: 600 }}>{c.products.toLocaleString()}</span> },
];

export function CompaniesPage() {
  return (
    <PageShell title="Companies" description="Registered organisations in AuditOne.">
      <DataTable columns={cols} rows={companies} />
    </PageShell>
  );
}
