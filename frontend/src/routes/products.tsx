import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { KpiStrip } from "@/components/kpi-strip";
import { StatusBadge } from "@/components/status-badge";
import {
  Plus, Package, DollarSign, Boxes, Wrench, Pencil, Trash2,
  X, Loader2, AlertCircle, CheckCircle2, Search,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  cost: string | number;
  purchase_date: string | null;
  serial_no: string | null;
  location: string | null;
  vendor: string | null;
  description: string | null;
  status: string;
};

type FormState = {
  name: string;
  category: string;
  quantity: string;
  cost: string;
  purchase_date: string;
  serial_no: string;
  location: string;
  vendor: string;
  description: string;
  status: string;
};

const CATEGORIES = ["Computing", "Peripherals", "AV Equipment", "Displays", "Printing", "Furniture", "Networking", "Other"];
const STATUSES   = ["In Use", "In Storage", "Maintenance", "Retired", "Pending"];

const EMPTY_FORM: FormState = {
  name: "", category: "Computing", quantity: "1", cost: "",
  purchase_date: "", serial_no: "", location: "", vendor: "",
  description: "", status: "In Use",
};

function toForm(p: Product): FormState {
  return {
    name: p.name,
    category: p.category,
    quantity: String(p.quantity ?? 1),
    cost: String(p.cost ?? ""),
    purchase_date: p.purchase_date ?? "",
    serial_no: p.serial_no ?? "",
    location: p.location ?? "",
    vendor: p.vendor ?? "",
    description: p.description ?? "",
    status: p.status ?? "Pending",
  };
}

// ─── Product Form Modal ───────────────────────────────────────────────────────
function ProductModal({
  open, onClose, editProduct,
}: { open: boolean; onClose: () => void; editProduct?: Product }) {
  const queryClient = useQueryClient();
  const isEdit = !!editProduct;
  const [form, setForm] = useState<FormState>(isEdit ? toForm(editProduct!) : EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const createMutation = useMutation({
    mutationFn: () => createProduct({
      name: form.name, category: form.category,
      quantity: Number(form.quantity) || 1, cost: Number(form.cost) || 0,
      purchase_date: form.purchase_date || null, serial_no: form.serial_no || null,
      location: form.location || null, vendor: form.vendor || null,
      description: form.description || null, status: form.status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (err: any) => setFormError(err?.response?.data?.detail || "Failed to create product."),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateProduct(editProduct!.id, {
      name: form.name, category: form.category,
      quantity: Number(form.quantity) || 1, cost: Number(form.cost) || 0,
      purchase_date: form.purchase_date || null, serial_no: form.serial_no || null,
      location: form.location || null, vendor: form.vendor || null,
      description: form.description || null, status: form.status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (err: any) => setFormError(err?.response?.data?.detail || "Failed to update product."),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!form.name.trim()) { setFormError("Product name is required."); return; }
    setFormError(null);
    isEdit ? updateMutation.mutate() : createMutation.mutate();
  };

  if (!open) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && !isPending && onClose()}
    >
      <div style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "580px", boxShadow: "0 25px 60px rgba(0,0,0,0.35)", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{isEdit ? "Edit Product" : "Add New Product"}</h2>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{isEdit ? `Editing #${editProduct!.id} — ${editProduct!.name}` : "Fill in the asset details below"}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isPending} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}><X size={18} /></button>
        </div>

        {/* Error */}
        {formError && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.82rem" }}>
            <AlertCircle size={14} /> {formError}
          </div>
        )}

        {/* Fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="field-group" style={{ gridColumn: "1 / -1" }}>
            <label className="label">Product Name *</label>
            <input type="text" className="input" placeholder="e.g. Dell Latitude 5300" {...field("name")} />
          </div>
          <div className="field-group">
            <label className="label">Category</label>
            <select className="input" {...field("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label className="label">Status</label>
            <select className="input" {...field("status")}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label className="label">Quantity</label>
            <input type="number" className="input" placeholder="1" min="0" {...field("quantity")} />
          </div>
          <div className="field-group">
            <label className="label">Unit Cost ($)</label>
            <input type="number" className="input" placeholder="0.00" min="0" step="0.01" {...field("cost")} />
          </div>
          <div className="field-group">
            <label className="label">Location</label>
            <input type="text" className="input" placeholder="e.g. HQ Floor 3" {...field("location")} />
          </div>
          <div className="field-group">
            <label className="label">Vendor</label>
            <input type="text" className="input" placeholder="e.g. Dell Technologies" {...field("vendor")} />
          </div>
          <div className="field-group">
            <label className="label">Serial No.</label>
            <input type="text" className="input" placeholder="e.g. SN-123456" {...field("serial_no")} />
          </div>
          <div className="field-group">
            <label className="label">Purchase Date</label>
            <input type="date" className="input" {...field("purchase_date")} />
          </div>
          <div className="field-group" style={{ gridColumn: "1 / -1" }}>
            <label className="label">Description</label>
            <textarea className="input" placeholder="Optional notes about this asset…" rows={2} style={{ resize: "vertical" }} {...field("description")} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={onClose} disabled={isPending}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none" }}
            disabled={!form.name.trim() || isPending}
            onClick={handleSubmit}
          >
            {isPending
              ? <><Loader2 size={14} className="animate-spin" /> {isEdit ? "Saving…" : "Adding…"}</>
              : <><CheckCircle2 size={14} /> {isEdit ? "Save Changes" : "Add Product"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const queryClient = useQueryClient();
  const delMutation = useMutation({
    mutationFn: () => deleteProduct(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
  });
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && !delMutation.isPending && onClose()}>
      <div style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "420px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "rgba(220,38,38,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trash2 size={18} color="#dc2626" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Delete Product</h2>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>This action cannot be undone.</p>
          </div>
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
          Are you sure you want to delete <strong style={{ color: "var(--foreground)" }}>#{product.id} — {product.name}</strong>?
        </p>
        {delMutation.isError && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.5rem", padding: "0.625rem", color: "#f87171", fontSize: "0.82rem" }}>
            <AlertCircle size={14} /> Failed to delete product.
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={onClose} disabled={delMutation.isPending}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "none" }}
            disabled={delMutation.isPending}
            onClick={() => delMutation.mutate()}
          >
            {delMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : <><Trash2 size={14} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

const INITIAL_FALLBACK_PRODUCTS: Product[] = [
  { id: 1, name: "Laptop Dell Latitude 5300", category: "Computing", quantity: 30, cost: 1200, purchase_date: "2024-01-15", serial_no: "SN-DL5300-X1", location: "HQ Floor 3", vendor: "Dell Technologies India", description: "", status: "In Use" },
  { id: 2, name: "Wireless Ergonomic Mouse", category: "Peripherals", quantity: 50, cost: 45, purchase_date: "2024-02-10", serial_no: "SN-WM102-Y2", location: "Warehouse A", vendor: "Logitech India", description: "", status: "In Use" },
  { id: 3, name: "Projector Epson EB-X41", category: "AV Equipment", quantity: 5, cost: 780, purchase_date: "2024-03-01", serial_no: "SN-EBX41-Z3", location: "Meeting Rm 2", vendor: "Epson India", description: "", status: "In Storage" },
  { id: 4, name: "Monitor LG 24\" FHD", category: "Displays", quantity: 40, cost: 320, purchase_date: "2024-03-12", serial_no: "SN-LG24MK-A4", location: "HQ Floor 3", vendor: "Apple India Pvt Ltd", description: "", status: "In Use" },
  { id: 5, name: "HP LaserJet Pro Printer", category: "Printing", quantity: 8, cost: 450, purchase_date: "2024-04-05", serial_no: "SN-HPL401-B5", location: "HQ Floor 1", vendor: "Cisco Systems India", description: "", status: "Maintenance" },
];

// ─── Products Page ────────────────────────────────────────────────────────────
export function ProductsPage() {
  const [showAdd, setShowAdd]     = useState(false);
  const [editProd, setEditProd]   = useState<Product | null>(null);
  const [deleteProd, setDeleteProd] = useState<Product | null>(null);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const { data: apiProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const products: Product[] = Array.isArray(apiProducts) && apiProducts.length > 0
    ? apiProducts
    : INITIAL_FALLBACK_PRODUCTS;

  // KPIs
  const total     = products.length;
  const inUse     = products.filter((p) => p.status === "In Use").length;
  const maint     = products.filter((p) => p.status === "Maintenance").length;
  const stockVal  = products.reduce((s, p) => s + Number(p.cost || 0), 0);

  // Filtered rows
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || (p.location ?? "").toLowerCase().includes(q) || (p.serial_no ?? "").toLowerCase().includes(q);
    const matchStatus   = !filterStatus   || p.status   === filterStatus;
    const matchCategory = !filterCategory || p.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <PageShell
      title="Products"
      description="All assets tracked across your locations."
      actions={
        <button className="btn btn-primary btn-sm" id="add-product-btn" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Product
        </button>
      }
    >
      {/* KPI Strip */}
      <KpiStrip items={[
        { label: "Total Products", value: String(total), icon: Package },
        { label: "In Use",         value: String(inUse), icon: Boxes },
        { label: "Maintenance",    value: String(maint), icon: Wrench },
        { label: "Stock Value",    value: `$${(stockVal / 1000).toFixed(1)}k`, icon: DollarSign },
      ]} />

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem", marginTop: "0.25rem" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
          <input
            id="products-search"
            type="text" className="input" placeholder="Search by name, category, location…"
            style={{ paddingLeft: "2.2rem", width: "100%" }}
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select id="filter-category" className="input" style={{ flex: "0 1 180px" }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select id="filter-status" className="input" style={{ flex: "0 1 160px" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: "900px" }}>
            <thead>
              <tr>
                {["ID", "Name", "Category", "Qty", "Cost", "Location", "Vendor", "Serial No.", "Purchase Date", "Status", "Actions"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "3rem", color: "var(--muted-foreground)" }}>
                    <Loader2 size={20} className="animate-spin" style={{ display: "inline", marginRight: "0.5rem" }} />
                    Loading products…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "3rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>
                    {search || filterStatus || filterCategory ? "No products match your filters." : "No products yet. Click \"Add Product\" to get started."}
                  </td>
                </tr>
              ) : filtered.map((p) => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--primary)", fontWeight: 700 }}>#{p.id}</span></td>
                  <td style={{ fontWeight: 600, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.name}>{p.name}</td>
                  <td>
                    <span style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", padding: "0.15rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.73rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{p.quantity ?? 1}</td>
                  <td style={{ fontWeight: 700 }}>${Number(p.cost ?? 0).toLocaleString()}</td>
                  <td style={{ color: "var(--muted-foreground)", fontSize: "0.84rem" }}>{p.location || "—"}</td>
                  <td style={{ color: "var(--muted-foreground)", fontSize: "0.84rem" }}>{p.vendor || "—"}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{p.serial_no || "—"}</td>
                  <td style={{ fontSize: "0.83rem", color: "var(--muted-foreground)" }}>{p.purchase_date ?? "—"}</td>
                  <td><StatusBadge value={p.status || "Pending"} /></td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        id={`edit-product-${p.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem" }}
                        onClick={() => setEditProd(p)}
                        title="Edit product"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        id={`delete-product-${p.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem", color: "#dc2626", borderColor: "rgba(220,38,38,0.35)" }}
                        onClick={() => setDeleteProd(p)}
                        title="Delete product"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border)", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
            Showing {filtered.length} of {products.length} products
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal open={showAdd}    onClose={() => setShowAdd(false)} />
      {editProd   && <ProductModal open onClose={() => setEditProd(null)}   editProduct={editProd} />}
      {deleteProd && <DeleteModal       product={deleteProd} onClose={() => setDeleteProd(null)} />}
    </PageShell>
  );
}
