import { DataTable, type Column } from "@/components/data-table";
import { products } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Plus, Package, DollarSign, Boxes, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { KpiStrip } from "@/components/kpi-strip";
export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({ meta: [{ title: "Products — AuditOne" }] }),
type P = (typeof products)[number];
const cols: Column<P>[] = [
  { key: "sku", header: "SKU" },
  { key: "sku", header: "SKU", render: (p) => <span className="font-mono text-xs text-primary">{p.sku}</span> },
  { key: "name", header: "Name" },
  { key: "category", header: "Category" },
  { key: "location", header: "Location" },
  { key: "value", header: "Value", render: (p) => `$${p.value.toLocaleString()}` },
  {
    key: "status",
    header: "Status",
    render: (p) => <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{p.status}</span>,
  },
  { key: "status", header: "Status", render: (p) => <StatusBadge value={p.status} /> },
];
function ProductsPage() {
  const total = products.reduce((s, p) => s + p.value, 0);
  const inUse = products.filter((p) => p.status === "In Use").length;
  const maint = products.filter((p) => p.status === "Maintenance").length;
  return (
    <PageShell
      title="Products"
      description="All assets tracked across your locations."
      actions={
        <Button>
        <Button variant="secondary">
          <Plus className="h-4 w-4" /> Add product
        </Button>
      }
    >
      <KpiStrip
        items={[
          { label: "Total Products", value: String(products.length), icon: Package },
          { label: "In Use", value: String(inUse), icon: Boxes, tint: "bg-emerald-100 text-emerald-600" },
          { label: "Under Maintenance", value: String(maint), icon: Wrench, tint: "bg-amber-100 text-amber-600" },
          { label: "Stock Value", value: `$${(total / 1000).toFixed(1)}k`, icon: DollarSign, tint: "bg-emerald-100 text-emerald-600" },
        ]}
      />
      <DataTable columns={cols} rows={products} />
    </PageShell>
  );