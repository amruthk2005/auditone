import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { Plus, Truck, Contact } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchVendors } from "@/lib/api";

type Vendor = {
  vendor_id: number;
  company_id: number;
  vendor_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
};

const cols: Column<Vendor>[] = [
  { key: "vendor_id", header: "ID", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--primary)" }}>#{v.vendor_id}</span> },
  { key: "vendor_name", header: "Vendor Name", render: (v) => <span style={{ fontWeight: 500 }}>{v.vendor_name}</span> },
  { key: "contact_person", header: "Contact Person", render: (v) => v.contact_person || "-" },
  { key: "email", header: "Email", render: (v) => v.email || "-" },
  { key: "phone", header: "Phone", render: (v) => v.phone || "-" },
  { key: "gst_number", header: "GST Number", render: (v) => v.gst_number || "-" },
];

export function VendorsPage() {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: fetchVendors,
  });

  return (
    <PageShell
      title="Vendors"
      description="Manage suppliers and service providers."
      actions={
        <button className="btn btn-primary btn-sm">
          <Plus size={15} /> Add Vendor
        </button>
      }
    >
      <KpiStrip
        items={[
          { label: "Total Vendors", value: String(vendors.length), icon: Truck },
          { label: "Active Suppliers", value: String(vendors.length), icon: Contact },
        ]}
      />
      {isLoading ? <p>Loading...</p> : <DataTable columns={cols} rows={vendors} />}
    </PageShell>
  );
}
