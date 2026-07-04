import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/status-badge";
import {
  Package, DollarSign, QrCode, ClipboardList,
  Plus, X, Upload, Download, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, Loader2, Copy, AlertCircle,
  FileText, BarChart2, Printer,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, generateQrCode, fetchQrCodes, getQrImageUrl } from "@/lib/api";
import { stockInventory, valuations } from "@/lib/mock-data";
import type { StockItem } from "@/lib/mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = { id: number; name: string; category: string; location: string; status: string; cost: string };
type QRRow = { qr_id: number; product_id: number | null; qr_code: string; generated_date: string | null; barcode_type: string | null };
type GenerateResult = { qr_id: number; qr_code: string; product_id: number; image_base64: string; already_existed: boolean };
type NewProduct = { name: string; sku: string; category: string; location: string; cost: string; status: string };

const CATEGORIES = ["Computing", "Peripherals", "AV Equipment", "Displays", "Printing", "Furniture", "Networking", "Other"];
const STATUSES = ["In Use", "In Storage", "Maintenance", "Retired"];

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, color = "var(--primary)", actions }: {
  icon: React.ElementType; title: string; subtitle?: string; color?: string; actions?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          <Icon size={18} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{title}</h2>
          {subtitle && <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, delta, up, icon: Icon, color, tint }: {
  label: string; value: string; delta?: string; up?: boolean;
  icon: React.ElementType; color: string; tint: string;
}) {
  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.25rem 0 0", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
        </div>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", background: tint, color }}>
          <Icon size={20} />
        </span>
      </div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.75rem", fontSize: "0.78rem" }}>
          {up ? <TrendingUp size={13} color="#059669" /> : <TrendingDown size={13} color="#dc2626" />}
          <span style={{ fontWeight: 700, color: up ? "#059669" : "#dc2626" }}>{delta}</span>
          <span style={{ color: "var(--muted-foreground)" }}>vs last month</span>
        </div>
      )}
    </div>
  );
}

// ─── 1. Product Management Section ───────────────────────────────────────────
function ProductSection() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewProduct>({ name: "", sku: "", category: "Computing", location: "", cost: "", status: "In Use" });
  const [localProducts, setLocalProducts] = useState<(NewProduct & { id: string })[]>([]);
  const [search, setSearch] = useState("");

  const { data: apiProducts = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const allProducts = [
    ...apiProducts,
    ...localProducts.map((p) => ({ ...p, cost: p.cost })),
  ];
  const filtered = allProducts.filter((p: Product) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.sku) return;
    setLocalProducts((prev) => [...prev, { ...form, id: `local-${Date.now()}` }]);
    setForm({ name: "", sku: "", category: "Computing", location: "", cost: "", status: "In Use" });
    setShowModal(false);
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SectionHeader
        icon={Package}
        title="Product Management"
        subtitle="Create and maintain product details"
        color="#6366f1"
        actions={
          <>
            <input
              type="text" placeholder="Search products…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input" style={{ width: "200px", fontSize: "0.82rem", padding: "0.4rem 0.75rem" }}
            />
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add Product
            </button>
          </>
        }
      />

      {/* Table */}
      <div className="data-table-wrap">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["ID", "Name", "Category", "Location", "Cost", "Status", "QR"].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>No products found.</td></tr>
              ) : filtered.slice(0, 8).map((p: any, i: number) => (
                <tr key={p.id ?? i}>
                  <td><span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--primary)" }}>#{p.id}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", padding: "0.15rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 600 }}>{p.category}</span></td>
                  <td style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>{p.location}</td>
                  <td style={{ fontWeight: 600 }}>${Number(p.cost ?? p.value ?? 0).toLocaleString()}</td>
                  <td><StatusBadge value={p.status || "Active"} /></td>
                  <td>
                    <Link to="/qr-codes" className="btn btn-outline btn-sm" style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem" }}>
                      <QrCode size={11} /> QR
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {filtered.length > 8 && (
        <p style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
          Showing 8 of {filtered.length} — <Link to="/products" className="auth-link">View all</Link>
        </p>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: "var(--bg-card, #fff)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "500px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={18} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Add New Product</h2>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Fill in the product details below</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}><X size={18} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { label: "Product Name *", key: "name", placeholder: "e.g. Dell Laptop" },
                { label: "SKU *", key: "sku", placeholder: "e.g. DL-5300" },
                { label: "Location", key: "location", placeholder: "e.g. HQ Floor 3" },
                { label: "Unit Cost ($)", key: "cost", placeholder: "e.g. 1200" },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="field-group">
                  <label className="label">{label}</label>
                  <input type="text" className="input" placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="field-group">
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none" }}
                disabled={!form.name || !form.sku} onClick={handleAdd}>
                <Plus size={15} /> Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 2. Stock Inventory Upload Section ───────────────────────────────────────
function StockUploadSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadedRows, setUploadedRows] = useState<StockItem[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);

  const parseCSV = (text: string): StockItem[] => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) { setError("CSV must have a header and at least one data row."); return []; }
    return lines.slice(1).map((line, i) => {
      const [id, sku, name, category, location, expectedQty, actualQty, unitCost, status] = line.split(",").map((s) => s.trim());
      return {
        id: id || `csv-${i}`, sku: sku || "", name: name || "", category: category || "",
        location: location || "", expectedQty: Number(expectedQty) || 0,
        actualQty: Number(actualQty) || 0, unitCost: Number(unitCost) || 0,
        status: (status as StockItem["status"]) || "In Use",
      };
    });
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) { setError("Please upload a .csv file."); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target?.result as string);
      setUploadedRows(rows);
      setUploadedFileName(file.name);
    };
    reader.readAsText(file);
  };

  const downloadSample = () => {
    const csv = `id,sku,name,category,location,expectedQty,actualQty,unitCost,status
s-001,WM-102,Wireless Mouse,Peripherals,Warehouse A,50,48,45,In Use
s-002,DL-5300,Laptop Dell,Computing,HQ Floor 3,30,30,1200,In Use`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "stock_inventory_template.csv";
    a.click();
  };

  // Use API products or sample data when nothing uploaded
  const displayRows = uploadedRows.length > 0 ? uploadedRows : stockInventory;

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SectionHeader
        icon={Upload}
        title="Stock Inventory"
        subtitle="Upload your CSV or review current stock levels"
        color="#059669"
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={downloadSample}>
              <Download size={14} /> Sample CSV
            </button>
            <button className="btn btn-primary btn-sm" style={{ background: "linear-gradient(135deg,#059669,#047857)", border: "none" }} onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> Upload CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </>
        }
      />

      {/* Drop zone */}
      {!uploadedFileName && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#059669" : "rgba(5,150,105,0.3)"}`,
            borderRadius: "0.75rem", padding: "2rem", textAlign: "center", cursor: "pointer",
            marginBottom: "1.25rem", background: dragging ? "rgba(5,150,105,0.07)" : "transparent",
            transition: "all 0.2s",
          }}
        >
          <Upload size={28} style={{ margin: "0 auto 0.5rem", color: dragging ? "#059669" : "rgba(5,150,105,0.5)" }} />
          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}>Drag & drop your CSV here, or <span style={{ color: "#059669", textDecoration: "underline" }}>browse</span></p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Supports: .csv (columns: id, sku, name, category, location, expectedQty, actualQty, unitCost, status)</p>
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.85rem" }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {uploadedFileName && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.3)", borderRadius: "0.5rem", padding: "0.625rem 1rem", fontSize: "0.85rem", color: "#059669" }}>
          <CheckCircle2 size={15} /> Loaded <strong>{uploadedFileName}</strong> — {uploadedRows.length} rows
          <button onClick={() => { setUploadedRows([]); setUploadedFileName(null); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#059669" }}><X size={14} /></button>
        </div>
      )}

      {/* Inventory Table */}
      <div className="data-table-wrap">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["SKU", "Name", "Category", "Location", "Expected", "Actual", "Unit Cost", "Total Value", "Status"].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r) => {
                const diff = r.actualQty - r.expectedQty;
                const isShort = diff < 0;
                return (
                  <tr key={r.id}>
                    <td><span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--primary)" }}>{r.sku}</span></td>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td><span style={{ background: "rgba(5,150,105,0.1)", color: "#059669", padding: "0.15rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.72rem", fontWeight: 600 }}>{r.category}</span></td>
                    <td style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>{r.location}</td>
                    <td style={{ fontWeight: 600, textAlign: "center" }}>{r.expectedQty}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontWeight: 700, color: isShort ? "#dc2626" : diff > 0 ? "#059669" : "inherit" }}>
                        {r.actualQty}
                        {diff !== 0 && <span style={{ fontSize: "0.7rem", marginLeft: "0.3rem" }}>({diff > 0 ? "+" : ""}{diff})</span>}
                      </span>
                    </td>
                    <td>${r.unitCost.toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>${(r.actualQty * r.unitCost).toLocaleString()}</td>
                    <td><StatusBadge value={r.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary footer */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
        {[
          { label: "Total SKUs", value: displayRows.length, color: "var(--primary)" },
          { label: "Total Units", value: displayRows.reduce((s, r) => s + r.actualQty, 0).toLocaleString(), color: "#059669" },
          { label: "Stock Value", value: `$${displayRows.reduce((s, r) => s + r.actualQty * r.unitCost, 0).toLocaleString()}`, color: "#6366f1" },
          { label: "Shortfalls", value: displayRows.filter((r) => r.actualQty < r.expectedQty).length, color: "#dc2626" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: "1 1 100px", background: "var(--bg-surface, #f8fafc)", borderRadius: "0.625rem", padding: "0.75rem 1rem", border: "1px solid var(--border)" }}>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
            <p style={{ margin: "0.2rem 0 0", fontSize: "1.2rem", fontWeight: 800, color }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. QR Code Generator Section ────────────────────────────────────────────
function QRGeneratorSection() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: qrCodes = [] } = useQuery({ queryKey: ["qr-codes"], queryFn: fetchQrCodes });

  const mutation = useMutation({
    mutationFn: (id: number) => generateQrCode(id),
    onSuccess: (data: GenerateResult) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
    },
  });

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${result.image_base64}`;
    a.download = `QR-${result.qr_code}.png`;
    a.click();
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SectionHeader
        icon={QrCode}
        title="QR Code Generator"
        subtitle={`${(qrCodes as QRRow[]).length} codes generated so far`}
        color="#8b5cf6"
        actions={
          <Link to="/qr-codes" className="btn btn-outline btn-sm">View All QR Codes</Link>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Left: Generator */}
        <div>
          <div className="field-group" style={{ marginBottom: "1rem" }}>
            <label className="label">Select Product</label>
            <select className="input" value={productId} onChange={(e) => { setProductId(e.target.value); setResult(null); }}>
              <option value="">— Choose a product —</option>
              {(products as Product[]).map((p) => (
                <option key={p.id} value={p.id}>#{p.id} — {p.name}</option>
              ))}
            </select>
          </div>

          {mutation.isError && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.82rem" }}>
              <AlertCircle size={14} /> {(mutation.error as Error)?.message || "Failed to generate."}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", border: "none" }}
            disabled={!productId || mutation.isPending}
            onClick={() => mutation.mutate(Number(productId))}
          >
            {mutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><QrCode size={15} /> Generate QR Code</>}
          </button>

          {/* Recent QR codes mini-table */}
          {(qrCodes as QRRow[]).length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Recently Generated</p>
              {(qrCodes as QRRow[]).slice(0, 4).map((q) => (
                <div key={q.qr_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                  <QrCode size={14} style={{ color: "#8b5cf6", flexShrink: 0 }} />
                  <span style={{ fontFamily: "monospace", fontSize: "0.78rem", flex: 1 }}>{q.qr_code}</span>
                  <a href={getQrImageUrl(q.qr_id)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: "0.2rem 0.4rem" }}>
                    <Download size={12} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Result preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", minHeight: "200px", justifyContent: "center" }}>
          {!result ? (
            <div style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
              <QrCode size={48} style={{ margin: "0 auto 0.75rem", opacity: 0.2 }} />
              <p style={{ fontSize: "0.85rem" }}>Generated QR will appear here</p>
            </div>
          ) : (
            <>
              {result.already_existed && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.3)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#fbbf24", fontSize: "0.78rem", width: "100%" }}>
                  <AlertTriangle size={13} /> Existing code retrieved
                </div>
              )}
              <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "0.75rem", boxShadow: "0 4px 20px rgba(139,92,246,0.25)" }}>
                <img src={`data:image/png;base64,${result.image_base64}`} alt="QR Code" style={{ width: "160px", height: "160px", display: "block" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(139,92,246,0.08)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", cursor: "pointer", border: "1px solid rgba(139,92,246,0.2)", width: "100%" }} onClick={handleCopy}>
                <span style={{ fontFamily: "monospace", fontSize: "0.8rem", flex: 1 }}>{result.qr_code}</span>
                {copied ? <CheckCircle2 size={14} color="#22c55e" /> : <Copy size={14} />}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => setResult(null)}>Reset</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", border: "none" }} onClick={handleDownload}>
                  <Download size={14} /> Download
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 4. Valuation Report Section ──────────────────────────────────────────────
function ValuationSection() {
  const byCategory: Record<string, number> = {};
  stockInventory.forEach((s) => {
    byCategory[s.category] = (byCategory[s.category] || 0) + s.actualQty * s.unitCost;
  });
  const chartData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6"];
  const totalValue = chartData.reduce((s, d) => s + d.value, 0);

  const printReport = () => window.print();

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SectionHeader
        icon={BarChart2}
        title="Valuation Report"
        subtitle="Current asset values by category and method"
        color="#f59e0b"
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={printReport}><Printer size={14} /> Print</button>
            <Link to="/valuations" className="btn btn-outline btn-sm"><FileText size={14} /> Full Report</Link>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Bar chart */}
        <div>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--muted-foreground)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Value by Category</p>
          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Valuation table */}
        <div>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--muted-foreground)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Book Values</p>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {["Product", "Method", "Value"].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {valuations.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 500, fontSize: "0.83rem" }}>{v.product}</td>
                    <td><span style={{ background: "rgba(245,158,11,0.1)", color: "#d97706", padding: "0.1rem 0.45rem", borderRadius: "0.375rem", fontSize: "0.72rem", fontWeight: 600 }}>{v.method}</span></td>
                    <td style={{ fontWeight: 700, color: "#059669" }}>${v.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", padding: "0.625rem 1rem", background: "rgba(245,158,11,0.08)", borderRadius: "0.5rem", border: "1px solid rgba(245,158,11,0.2)" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted-foreground)" }}>Total Inventory Value</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#d97706" }}>${totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Company Dashboard ───────────────────────────────────────────────────
export function CompanyDashboard() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: qrCodes = [] } = useQuery({ queryKey: ["qr-codes"], queryFn: fetchQrCodes });
  const totalValue = stockInventory.reduce((s, r) => s + r.actualQty * r.unitCost, 0);
  const shortfalls = stockInventory.filter((r) => r.actualQty < r.expectedQty).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* KPI Row */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))" }}>
        <KpiCard label="Total Products" value={String(products.length || stockInventory.length)} delta="+5.2%" up icon={Package} color="#6366f1" tint="rgba(99,102,241,0.12)" />
        <KpiCard label="Stock Value" value={`$${(totalValue / 1000).toFixed(1)}k`} delta="+1.8%" up icon={DollarSign} color="#059669" tint="rgba(5,150,105,0.12)" />
        <KpiCard label="QR Codes" value={String((qrCodes as QRRow[]).length)} delta="+3" up icon={QrCode} color="#8b5cf6" tint="rgba(139,92,246,0.12)" />
        <KpiCard label="Inventory Gaps" value={String(shortfalls)} delta={`${shortfalls} items`} up={false} icon={AlertTriangle} color="#dc2626" tint="rgba(220,38,38,0.12)" />
      </div>

      {/* Section 1: Product Management */}
      <ProductSection />

      {/* Section 2: Stock Inventory Upload */}
      <StockUploadSection />

      {/* Sections 3 & 4 side-by-side on wider screens */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.75rem" }}>
        <QRGeneratorSection />
        <ValuationSection />
      </div>
    </div>
  );
}
