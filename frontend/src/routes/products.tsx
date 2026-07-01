import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { StatusBadge } from "@/components/status-badge";
import { Plus, Package, DollarSign, Boxes, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";

type P = any;

const cols: Column<P>[] = [
  { key: "id", header: "ID", render: (p) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--primary)" }}>#{p.id}</span> },
  { key: "name", header: "Name" },
  { key: "category", header: "Category" },
  { key: "location", header: "Location" },
  { key: "cost", header: "Cost", render: (p) => `$${Number(p.cost).toLocaleString()}` },
  { key: "status", header: "Status", render: (p) => <StatusBadge value={p.status || "Pending"} /> },
];

export function ProductsPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const total = products.reduce((s: number, p: any) => s + Number(p.cost || 0), 0);
  const inUse = products.filter((p: any) => p.status === "In Use").length;
  const maint = products.filter((p: any) => p.status === "Maintenance").length;

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
      {isLoading ? <p>Loading...</p> : <DataTable columns={cols} rows={products} />}
    </PageShell>
  );
}
