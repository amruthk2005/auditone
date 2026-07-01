import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import {
  Download, QrCode, ScanLine, Sparkles, X, Plus,
  CheckCircle2, AlertCircle, Copy, Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchQrCodes, generateQrCode, fetchProducts, getQrImageUrl } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
type QRRow = {
  qr_id: number;
  product_id: number | null;
  qr_code: string;
  generated_date: string | null;
  barcode_type: string | null;
};

type GenerateResult = {
  qr_id: number;
  qr_code: string;
  product_id: number;
  image_base64: string;
  already_existed: boolean;
};

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
    header: "QR Code",
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
        <span style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{r.qr_code}</span>
      </div>
    ),
  },
  {
    key: "product_id",
    header: "Product ID",
    render: (r) =>
      r.product_id ? (
        <span style={{ fontWeight: 600 }}>#{r.product_id}</span>
      ) : (
        <span style={{ color: "var(--muted-foreground)" }}>—</span>
      ),
  },
  {
    key: "barcode_type",
    header: "Type",
    render: (r) => (
      <span
        style={{
          background: "rgba(109,40,217,0.1)", color: "var(--primary)",
          padding: "0.125rem 0.5rem", borderRadius: "0.375rem",
          fontSize: "0.75rem", fontWeight: 600,
        }}
      >
        {r.barcode_type || "QR"}
      </span>
    ),
  },
  {
    key: "generated_date",
    header: "Generated",
    render: (r) =>
      r.generated_date
        ? new Date(r.generated_date).toLocaleDateString("en-IN", {
            year: "numeric", month: "short", day: "2-digit",
          })
        : "—",
  },
  {
    key: "qr_id",
    header: "Download",
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
  const [productId, setProductId] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const mutation = useMutation({
    mutationFn: (id: number) => generateQrCode(id),
    onSuccess: (data: GenerateResult) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
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

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--card, #1a0d2e)", border: "1px solid rgba(109,40,217,0.25)",
          borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "480px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
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
                Select a product to create a unique QR code
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
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="field-group">
              <label className="label" htmlFor="gen-product">Product</label>
              <select
                id="gen-product"
                className="input"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">— Select a product —</option>
                {products.map((p: { id: number; name: string }) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            {mutation.isError && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
                  borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.85rem",
                }}
              >
                <AlertCircle size={15} />
                {(mutation.error as Error)?.message || "Failed to generate QR code."}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ justifyContent: "center" }}
              disabled={!productId || mutation.isPending}
              onClick={() => mutation.mutate(Number(productId))}
            >
              {mutation.isPending ? (
                <><Loader2 size={15} className="animate-spin" /> Generating…</>
              ) : (
                <><QrCode size={15} /> Generate QR Code</>
              )}
            </button>
          </div>
        ) : (
          /* Result view */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
            {result.already_existed && (
              <div
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.3)",
                  borderRadius: "0.5rem", padding: "0.75rem", color: "#fbbf24", fontSize: "0.82rem",
                }}
              >
                <AlertCircle size={14} /> A QR code already existed for this product — showing existing code.
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

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(109,40,217,0.08)", borderRadius: "0.5rem",
                  padding: "0.5rem 1rem", cursor: "pointer",
                  border: "1px solid rgba(109,40,217,0.2)",
                }}
                onClick={handleCopy}
              >
                <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{result.qr_code}</span>
                {copied ? <CheckCircle2 size={14} color="#22c55e" /> : <Copy size={14} />}
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
  const { data: qrCodes = [], isLoading } = useQuery({
    queryKey: ["qr-codes"],
    queryFn: fetchQrCodes,
  });

  return (
    <>
      {showModal && <GenerateModal onClose={() => setShowModal(false)} />}

      <PageShell
        title="QR Codes"
        description="Generate and manage printable QR codes for your assets."
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
            { label: "Linked to Products", value: String(qrCodes.filter((q: QRRow) => q.product_id).length), icon: ScanLine },
            { label: "Unlinked Codes", value: String(qrCodes.filter((q: QRRow) => !q.product_id).length), icon: Sparkles },
          ]}
        />

        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted-foreground)" }}>
            Loading QR codes…
          </div>
        ) : (
          <DataTable
            columns={cols}
            rows={qrCodes}
            rowKey={(r: QRRow) => r.qr_id}
            emptyMessage="No QR codes generated yet. Click 'Generate QR' to get started."
          />
        )}
      </PageShell>
    </>
  );
}
