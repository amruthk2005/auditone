import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { companies } from "@/lib/mock-data";
import { Building2 } from "lucide-react";
export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({ meta: [{ title: "Companies — AuditOne" }] }),
type C = (typeof companies)[number];
const cols: Column<C>[] = [
  { key: "name", header: "Company" },
  { key: "industry", header: "Industry" },
  {
    key: "name",
    header: "Company",
    render: (c) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <Building2 className="h-4 w-4" />
        </span>
        <span className="font-medium">{c.name}</span>
      </div>
    ),
  },
  { key: "industry", header: "Industry", render: (c) => <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{c.industry}</span> },
  { key: "users", header: "Users" },
  { key: "products", header: "Products" },
  { key: "products", header: "Products", render: (c) => <span className="font-semibold">{c.products.toLocaleString()}</span> },
];
function CompaniesPage() {
