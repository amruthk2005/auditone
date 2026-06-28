import { DataTable, type Column } from "@/components/data-table";
import { qrCodes, products } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Download, QrCode, ScanLine, Sparkles } from "lucide-react";
import { KpiStrip } from "@/components/kpi-strip";
export const Route = createFileRoute("/_authenticated/qr-codes")({
  head: () => ({ meta: [{ title: "QR Codes — AuditOne" }] }),
}));
const cols: Column<Row>[] = [
  { key: "code", header: "Code" },
  {
    key: "code",
    header: "Code",
    render: (r) => (
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <QrCode className="h-4 w-4" />
        </span>
        <span className="font-mono text-xs">{r.code}</span>
      </div>
    ),
  },
  { key: "productName", header: "Product" },
  { key: "generatedAt", header: "Generated" },
  { key: "scans", header: "Scans" },
  { key: "scans", header: "Scans", render: (r) => <span className="font-semibold text-primary">{r.scans}</span> },
];
function QrCodesPage() {
  const totalScans = qrCodes.reduce((s, q) => s + q.scans, 0);
  return (
    <PageShell
      title="QR Codes"
      description="Generate and download printable QR codes for any product."
      actions={
        <Button>
        <Button variant="secondary">
          <Download className="h-4 w-4" /> Bulk download
        </Button>
      }
    >
      <KpiStrip
        items={[
          { label: "Active Codes", value: String(qrCodes.length), icon: QrCode },
          { label: "Total Scans", value: String(totalScans), icon: ScanLine, tint: "bg-sky-100 text-sky-600" },
          { label: "Coverage", value: `${Math.round((qrCodes.length / products.length) * 100)}%`, icon: Sparkles, tint: "bg-emerald-100 text-emerald-600" },
        ]}
      />
      <DataTable columns={cols} rows={rows} />
    </PageShell>
  );