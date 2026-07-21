import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import {
  Download, QrCode, ScanLine, Sparkles, X, Plus,
  CheckCircle2, AlertCircle, Copy, Loader2, Calendar, MapPin, Layers, FileText
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchQrCodes, generateAdvancedQrCodeApi, fetchProducts, getQrImageUrl } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
type QRRow = {
  qr_id: number;
  product_id: number | null;
  qr_code: string;
  generated_date: string | null;
  barcode_type: string | null;
  generation_type?: string | null;
  batch_quantity?: number | null;
  location_tag?: string | null;
  auditor_notes?: string | null;
};

type ProductItem = {
  id: number;
  name: string;
  category?: string;
  location?: string;
  serial_no?: string;
};

type GenerateResult = {
  qr_id: number;
  qr_code: string;
  product_id?: number | null;
  product_name?: string | null;
  generation_type?: string;
  generated_date?: string;
  batch_quantity?: number;
  location_tag?: string;
  auditor_notes?: string;
  image_base64: string;
  already_existed?: boolean;
};

const INITIAL_FALLBACK_QR_CODES: QRRow[] = [
  { qr_id: 1, product_id: 1, qr_code: "AO-1-QR889A12", generated_date: "2026-07-21", barcode_type: "QR", generation_type: "SINGLE", batch_quantity: 1, location_tag: "HQ Floor 3", auditor_notes: "Laptop asset tag" },
  { qr_id: 2, product_id: 2, qr_code: "AO-2-QR441B34", generated_date: "2026-07-21", barcode_type: "QR", generation_type: "SINGLE", batch_quantity: 1, location_tag: "Warehouse A", auditor_notes: "Mouse peripheral tag" },
  { qr_id: 3, product_id: 3, qr_code: "AO-3-QR112C56", generated_date: "2026-07-20", barcode_type: "QR", generation_type: "BULK", batch_quantity: 5, location_tag: "Meeting Rm 2", auditor_notes: "AV Equipment batch" },
  { qr_id: 4, product_id: 4, qr_code: "AO-4-QR993D78", generated_date: "2026-07-19", barcode_type: "QR", generation_type: "SINGLE", batch_quantity: 1, location_tag: "HQ Floor 3", auditor_notes: "Monitor asset tag" },
];

const INITIAL_FALLBACK_PRODUCTS: ProductItem[] = [
  { id: 1, name: "Laptop Dell Latitude 5300", category: "Computing", location: "HQ Floor 3" },
  { id: 2, name: "Wireless Ergonomic Mouse", category: "Peripherals", location: "Warehouse A" },
  { id: 3, name: "Projector Epson EB-X41", category: "AV Equipment", location: "Meeting Rm 2" },
  { id: 4, name: "Monitor LG 24\" FHD", category: "Displays", location: "HQ Floor 3" },
  { id: 5, name: "HP LaserJet Pro Printer", category: "Printing", location: "HQ Floor 1" },
];

// ── Column definitions ─────────────────────────────────────────────────────────
const cols: Column<QRRow>[] = [
  {
    key: "qr_id",
    header: "ID",
    render: (r) => (
      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--primary)" }}>
        #{r.qr_id}
      </span>
    ),
  },
  {
    key: "qr_code",
    header: "QR Code Token",
    render: (r) => (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "1.75rem", height: "1.75rem", borderRadius: "0.375rem",
            background: "rgba(109,40,217,0.12)", color: "var(--primary)",
          }}
        >
          <QrCode size={14} />
        </span>
        <span style={{ fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 600 }}>{r.qr_code}</span>
      </div>
    ),
  },
  {
    key: "product_id",
    header: "Target Asset",
    render: (r) =>
      r.product_id ? (
        <span style={{ fontWeight: 600 }}>Product #{r.product_id}</span>
      ) : (
        <span style={{ color: "var(--muted-foreground)" }}>Bulk Batch</span>
      ),
  },
  {
    key: "generation_type",
    header: "QR Mode",
    render: (r) => (
      <span
        style={{
          background: r.generation_type === "BULK" ? "rgba(234,179,8,0.1)" : "rgba(109,40,217,0.1)",
          color: r.generation_type === "BULK" ? "#eab308" : "var(--primary)",
          padding: "0.125rem 0.5rem", borderRadius: "0.375rem",
          fontSize: "0.75rem", fontWeight: 600,
        }}
      >
        {r.generation_type || "SINGLE"} {r.batch_quantity && r.batch_quantity > 1 ? `(${r.batch_quantity}x)` : ""}
      </span>
    ),
  },
  {
    key: "location_tag",
    header: "Location Tag",
    render: (r) => <span style={{ opacity: 0.85 }}>{r.location_tag || "HQ Warehouse"}</span>,
  },
  {
    key: "generated_date",
    header: "Gen Date",
    render: (r) =>
      r.generated_date
        ? new Date(r.generated_date).toLocaleDateString("en-IN", {
            year: "numeric", month: "short", day: "2-digit",
          })
        : "—",
  },
  {
    key: "qr_id",
    header: "Action",
    render: (r) => (
      <a
        href={getQrImageUrl(r.qr_id)}
        target="_blank"
        rel="noreferrer"
        className="btn btn-outline btn-sm"
        style={{ fontSize: "0.75rem", gap: "0.3rem" }}
      >
        <Download size={12} /> PNG
      </a>
    ),
  },
];

// ── Generate Modal ─────────────────────────────────────────────────────────────
function GenerateModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split("T")[0];

  const [generationType, setGenerationType] = useState<"SINGLE" | "BULK">("SINGLE");
  const [productId, setProductId] = useState("");
  const [generatedDate, setGeneratedDate] = useState(todayStr);
  const [batchQuantity, setBatchQuantity] = useState("1");
  const [locationTag, setLocationTag] = useState("");
  const [auditorNotes, setAuditorNotes] = useState("");

  const [result, setResult] = useState<GenerateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch real product list for dropdown menu
  const { data: apiProducts } = useQuery<ProductItem[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const productOptions: ProductItem[] = Array.isArray(apiProducts) && apiProducts.length > 0
    ? apiProducts
    : INITIAL_FALLBACK_PRODUCTS;

  const mutation = useMutation({
    mutationFn: () => generateAdvancedQrCodeApi({
      product_id: productId ? Number(productId) : undefined,
      generation_type: generationType,
      generated_date: generatedDate,
      batch_quantity: Number(batchQuantity) || 1,
      location_tag: locationTag || undefined,
      auditor_notes: auditorNotes || undefined,
    }),
    onSuccess: (data: GenerateResult) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.detail || "Failed to generate QR code.");
    },
  });

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${result.image_base64}`;
    link.download = `QR-${result.qr_code}.png`;
    link.click();
  };

  const handleGenerateSubmit = () => {
    if (generationType === "SINGLE" && !productId) {
      setErrorMsg("Please select a target product for single QR generation.");
      return;
    }
    setErrorMsg(null);
    mutation.mutate();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--card, #1a0d2e)", border: "1px solid rgba(109,40,217,0.25)",
          borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "520px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <QrCode size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Generate QR Code</h2>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                Configure QR metadata for physical auditor scanning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "0.25rem" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        {!result ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {errorMsg && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
                  borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.85rem",
                }}
              >
                <AlertCircle size={15} />
                {errorMsg}
              </div>
            )}

            {/* Mode Selection */}
            <div className="field-group">
              <label className="label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Layers size={13} color="var(--primary)" /> QR Mode
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <button
                  type="button"
                  className={`btn ${generationType === "SINGLE" ? "btn-primary" : "btn-outline"}`}
                  style={{ justifyContent: "center", fontSize: "0.85rem" }}
                  onClick={() => { setGenerationType("SINGLE"); setBatchQuantity("1"); }}
                >
                  Single Product QR
                </button>
                <button
                  type="button"
                  className={`btn ${generationType === "BULK" ? "btn-primary" : "btn-outline"}`}
                  style={{ justifyContent: "center", fontSize: "0.85rem" }}
                  onClick={() => { setGenerationType("BULK"); setBatchQuantity("10"); }}
                >
                  Bulk Batch QR
                </button>
              </div>
            </div>

            {/* Product Dropdown */}
            <div className="field-group">
              <label className="label" htmlFor="gen-product">
                Target Product {generationType === "SINGLE" ? "*" : "(Optional for Bulk)"}
              </label>
              <select
                id="gen-product"
                className="input"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  const selected = productOptions.find((p) => String(p.id) === e.target.value);
                  if (selected && selected.location && !locationTag) {
                    setLocationTag(selected.location);
                  }
                }}
              >
                <option value="">— Select product from inventory —</option>
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {p.name} {p.category ? `(${p.category})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Generation Date & Batch Quantity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
              <div className="field-group">
                <label className="label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Calendar size={13} color="var(--primary)" /> Generation Date *
                </label>
                <input
                  type="date"
                  className="input"
                  value={generatedDate}
                  onChange={(e) => setGeneratedDate(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="label">Quantity / Batch Units</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  max="100"
                  value={batchQuantity}
                  onChange={(e) => setBatchQuantity(e.target.value)}
                />
              </div>
            </div>

            {/* Location Tag */}
            <div className="field-group">
              <label className="label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <MapPin size={13} color="var(--primary)" /> Location / Warehouse Tag
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. HQ Floor 3 / Warehouse A"
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
              />
            </div>

            {/* Auditor Notes */}
            <div className="field-group">
              <label className="label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <FileText size={13} color="var(--primary)" /> Auditor Notes & Metadata
              </label>
              <textarea
                className="input"
                placeholder="e.g. Annual physical inventory audit tag. Scan for serial validation."
                rows={2}
                value={auditorNotes}
                onChange={(e) => setAuditorNotes(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ justifyContent: "center", marginTop: "0.5rem" }}
              disabled={mutation.isPending}
              onClick={handleGenerateSubmit}
            >
              {mutation.isPending ? (
                <><Loader2 size={15} className="animate-spin" /> Generating QR Code…</>
              ) : (
                <><QrCode size={15} /> Generate QR Code</>
              )}
            </button>
          </div>
        ) : (
          /* Result View */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
            {result.already_existed && (
              <div
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.3)",
                  borderRadius: "0.5rem", padding: "0.75rem", color: "#fbbf24", fontSize: "0.82rem",
                }}
              >
                <AlertCircle size={14} /> Showing existing QR token for this asset.
              </div>
            )}

            <div
              style={{
                background: "#fff", borderRadius: "0.75rem", padding: "1rem",
                boxShadow: "0 4px 20px rgba(109,40,217,0.2)",
              }}
            >
              <img
                src={`data:image/png;base64,${result.image_base64}`}
                alt="QR Code"
                style={{ width: "200px", height: "200px", display: "block" }}
              />
            </div>

            <div style={{ textAlign: "center", width: "100%" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  background: "rgba(109,40,217,0.08)", borderRadius: "0.5rem",
                  padding: "0.5rem 1rem", cursor: "pointer",
                  border: "1px solid rgba(109,40,217,0.2)", marginBottom: "0.75rem"
                }}
                onClick={handleCopy}
              >
                <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700 }}>{result.qr_code}</span>
                {copied ? <CheckCircle2 size={14} color="#22c55e" /> : <Copy size={14} />}
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span>Mode: <strong>{result.generation_type || "SINGLE"}</strong> ({result.batch_quantity || 1} unit)</span>
                <span>Gen Date: <strong>{result.generated_date}</strong></span>
                {result.location_tag && <span>Location Tag: <strong>{result.location_tag}</strong></span>}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setResult(null)}
              >
                Generate Another
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={handleDownload}
              >
                <Download size={15} /> Download PNG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function QrCodesPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: apiQrCodes } = useQuery<QRRow[]>({
    queryKey: ["qr-codes"],
    queryFn: fetchQrCodes,
    staleTime: 1000 * 60 * 5, // Zero-lag 5 min caching
  });

  const qrCodes: QRRow[] = Array.isArray(apiQrCodes) && apiQrCodes.length > 0
    ? apiQrCodes
    : INITIAL_FALLBACK_QR_CODES;

  return (
    <>
      {showModal && <GenerateModal onClose={() => setShowModal(false)} />}

      <PageShell
        title="QR Codes"
        description="Generate and manage printable QR codes with auditor scanning metadata."
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Generate QR
            </button>
          </div>
        }
      >
        <KpiStrip
          items={[
            { label: "Total QR Codes", value: String(qrCodes.length), icon: QrCode },
            { label: "Linked to Products", value: String(qrCodes.filter((q) => q.product_id).length), icon: ScanLine },
            { label: "Bulk / Unlinked", value: String(qrCodes.filter((q) => !q.product_id || q.generation_type === "BULK").length), icon: Sparkles },
          ]}
        />

        <DataTable
          columns={cols}
          rows={qrCodes}
          rowKey={(r: QRRow) => r.qr_id}
          emptyMessage="No QR codes generated yet. Click 'Generate QR' to get started."
        />
      </PageShell>
    </>
  );
}
