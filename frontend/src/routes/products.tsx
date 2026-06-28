import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { StatusBadge } from "@/components/status-badge";
import { products } from "@/lib/mock-data";
import { Plus, Package, DollarSign, Boxes, Wrench } from "lucide-react";

type P = (typeof products)[number];

const cols: Column<P>[] = [
  { key: "sku", header: "SKU", render: (p) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--primary)" }}>{p.sku}</span> },
  { key: "name", header: "Name" },
  { key: "category", header: "Category" },
  { key: "location", header: "Location" },
  { key: "value", header: "Value", render: (p) => `$${p.value.toLocaleString()}` },
  { key: "status", header: "Status", render: (p) => <StatusBadge value={p.status} /> },
];

export function ProductsPage() {
  const total = products.reduce((s, p) => s + p.value, 0);
  const inUse = products.filter((p) => p.status === "In Use").length;
  const maint = products.filter((p) => p.status === "Maintenance").length;

  return (
    <PageShell
      title="Products"
      description="All assets tracked across your locations."
      actions={
        <button className="btn btn-primary btn-sm">
          <Plus size={15} /> Add product
        </button>
      }
    >
      <KpiStrip
        items={[
          { label: "Total Products", value: String(products.length), icon: Package },
          { label: "In Use", value: String(inUse), icon: Boxes },
          { label: "Under Maintenance", value: String(maint), icon: Wrench },
          { label: "Stock Value", value: `$${(total / 1000).toFixed(1)}k`, icon: DollarSign },
        ]}
      />
      <DataTable columns={cols} rows={products} />
    </PageShell>
  );
}
