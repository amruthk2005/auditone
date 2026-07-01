import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { QRScanner } from "@/components/scanner/QRScanner";
import { Search } from "lucide-react";

export function ScansPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
  };

  return (
    <PageShell
      title="Scans & Validation"
      description="Scan QR codes or barcodes to validate stock."
      actions={
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input type="text" placeholder="Search by asset ID..." className="input input-sm" style={{ paddingLeft: "2rem" }} />
          </div>
          <button className="btn btn-primary btn-sm">Scan Now</button>
        </div>
      }
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <p style={{ marginBottom: "2rem", color: "var(--muted-foreground)" }}>Point your camera at a QR code to scan.</p>
        <QRScanner onScanSuccess={handleScanSuccess} />
        {scanResult && (
          <div className="card" style={{ marginTop: "2rem", padding: "1rem", background: "var(--accent)" }}>
            <h3 style={{ margin: "0 0 0.5rem" }}>Scan Successful!</h3>
            <p style={{ margin: 0, fontFamily: "monospace" }}>{scanResult}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
