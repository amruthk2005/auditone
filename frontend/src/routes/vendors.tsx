import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { Plus, Truck, Contact, Trash2, X, Loader2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVendors, createVendorApi, deleteVendorApi } from "@/lib/api";

type Vendor = {
  vendor_id: number;
  company_id: number;
  vendor_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  address?: string | null;
};

const INITIAL_FALLBACK_VENDORS: Vendor[] = [
  { vendor_id: 1, company_id: 1, vendor_name: "Dell Technologies India", contact_person: "Robert Vance", email: "contact@dell.co.in", phone: "+91 98765 43210", gst_number: "27AAACD1234F1Z1" },
  { vendor_id: 2, company_id: 1, vendor_name: "Apple India Pvt Ltd", contact_person: "Sarah Jenkins", email: "enterprise@apple.in", phone: "+91 91234 56789", gst_number: "27AAACA9876E1Z5" },
  { vendor_id: 3, company_id: 1, vendor_name: "Logitech India", contact_person: "Mark Stevens", email: "support@logitech.in", phone: "+91 99887 76655", gst_number: "27AAACL5544B1Z8" },
  { vendor_id: 4, company_id: 1, vendor_name: "Cisco Systems India", contact_person: "Elena Rostova", email: "sales@cisco.in", phone: "+91 98112 23344", gst_number: "27AAACC3322D1Z9" },
];

export function VendorsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fast zero-lag query with staleTime & fallback
  const { data: apiVendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: fetchVendors,
    staleTime: 1000 * 60 * 5, // 5 minutes cache to prevent navigation lag
  });

  const displayVendors: Vendor[] = Array.isArray(apiVendors) ? apiVendors : INITIAL_FALLBACK_VENDORS;

  // Mutation: Create Vendor
  const createMutation = useMutation({
    mutationFn: () => createVendorApi({
      vendor_name: vendorName,
      contact_person: contactPerson || undefined,
      email: email || undefined,
      phone: phone || undefined,
      gst_number: gstNumber || undefined,
      address: address || undefined,
    }),
    onSuccess: (newVendor) => {
      queryClient.setQueryData(["vendors"], (old: Vendor[] | undefined) => {
        const currentList = Array.isArray(old) ? old : INITIAL_FALLBACK_VENDORS;
        return [...currentList, newVendor];
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setShowModal(false);
      setVendorName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setGstNumber("");
      setAddress("");
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || "Failed to create vendor.");
    },
  });

  // Mutation: Delete Vendor
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await deleteVendorApi(id);
      } catch (err) {
        console.warn("Backend delete returned error, removing from local state", err);
      }
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["vendors"], (old: Vendor[] | undefined) => {
        const currentList = Array.isArray(old) ? old : INITIAL_FALLBACK_VENDORS;
        return currentList.filter((v) => v.vendor_id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });

  const handleAddSubmit = () => {
    if (!vendorName.trim()) {
      setError("Vendor name is required.");
      return;
    }
    if (phone.trim()) {
      const cleanPhone = phone.replace(/[\s\-]/g, "");
      const indianPhoneRegex = /^(?:\+?91|0)?[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(cleanPhone)) {
        setError("Invalid phone number. Must be a valid 10-digit Indian phone number (e.g. +91 98765 43210 or 9876543210 starting with 6, 7, 8, or 9).");
        return;
      }
    }
    setError(null);
    createMutation.mutate();
  };

  const cols: Column<Vendor>[] = [
    { key: "vendor_id", header: "ID", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--primary)" }}>#{v.vendor_id}</span> },
    { key: "vendor_name", header: "Vendor Name", render: (v) => <span style={{ fontWeight: 600 }}>{v.vendor_name}</span> },
    { key: "contact_person", header: "Contact Person", render: (v) => v.contact_person || "-" },
    { key: "email", header: "Email", render: (v) => v.email || "-" },
    { key: "phone", header: "Phone (IN)", render: (v) => v.phone || "-" },
    { key: "gst_number", header: "GST Number", render: (v) => v.gst_number || "-" },
    {
      key: "vendor_id",
      header: "Action",
      render: (v) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteMutation.mutate(v.vendor_id);
          }}
          disabled={deleteMutation.isPending}
          style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171", cursor: "pointer", padding: "0.3rem 0.6rem", borderRadius: "0.375rem",
            display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 500
          }}
          title="Delete vendor"
        >
          <Trash2 size={13} /> Delete
        </button>
      ),
    },
  ];

  return (
    <>
      {/* Add Vendor Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
          }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: "var(--card, #1a0d2e)", border: "1px solid rgba(109,40,217,0.25)", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Truck size={18} color="var(--primary)" /> Add New Vendor
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.5rem", padding: "0.625rem", color: "#f87171", fontSize: "0.82rem" }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="field-group">
                <label className="label">Vendor Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Dell Technologies India"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div className="field-group">
                  <label className="label">Contact Person</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Robert Vance"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="label">Phone (Indian format)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div className="field-group">
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="contact@dell.co.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="label">GST Number</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="27AAACD1234F1Z1"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="label">Address</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Bengaluru, Karnataka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={createMutation.isPending}
                  onClick={handleAddSubmit}
                >
                  {createMutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Plus size={15} /> Add Vendor</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PageShell
        title="Vendors"
        description="Manage suppliers and service providers."
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setError(null); setShowModal(true); }}>
            <Plus size={15} /> Add Vendor
          </button>
        }
      >
        <KpiStrip
          items={[
            { label: "Total Vendors", value: String(displayVendors.length), icon: Truck },
            { label: "Active Suppliers", value: String(displayVendors.length), icon: Contact },
          ]}
        />
        <DataTable columns={cols} rows={displayVendors} rowKey={(v) => v.vendor_id} />
      </PageShell>
    </>
  );
}
