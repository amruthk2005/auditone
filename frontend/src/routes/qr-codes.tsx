import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { qrCodes, products } from "@/lib/mock-data";
import { Download, QrCode, ScanLine, Sparkles } from "lucide-react";

type Row = (typeof qrCodes)[number];

const cols: Column<Row>[] = [
  {
    key: "code",
    header: "Code",
    render: (r) => (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.375rem", background: "rgba(109,40,217,0.1)", color: "var(--primary)" }}>
          <QrCode size={15} />
        </span>
        <span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{r.code}</span>
      </div>
    ),
  },
  { key: "productName", header: "Product" },
  { key: "generatedAt", header: "Generated" },
  { key: "scans", header: "Scans", render: (r) => <span style={{ fontWeight: 600, color: "var(--primary)" }}>{r.scans}</span> },
];

export function QrCodesPage() {
  const totalScans = qrCodes.reduce((s, q) => s + q.scans, 0);

  return (
    <PageShell
      title="QR Codes"
      description="Generate and download printable QR codes for any product."
      actions={
        <button className="btn btn-primary btn-sm">
          <Download size={15} /> Bulk download
        </button>
      }
    >
      <KpiStrip
        items={[
          { label: "Active Codes", value: String(qrCodes.length), icon: QrCode },
          { label: "Total Scans", value: String(totalScans), icon: ScanLine },
          { label: "Coverage", value: `${Math.round((qrCodes.length / products.length) * 100)}%`, icon: Sparkles },
        ]}
      />
      <DataTable columns={cols} rows={qrCodes} />
    </PageShell>
  );
}
