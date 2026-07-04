import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { QRScanner } from "@/components/scanner/QRScanner";
import { stockInventory, mismatches } from "@/lib/mock-data";
import type { StockItem, MismatchRecord } from "@/lib/mock-data";
import {
  ClipboardList, AlertTriangle, CheckCircle2, FileText,
  ScanLine, Calculator, MessageSquare, Check, X,
} from "lucide-react";

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, color = "var(--primary)" }: {
  icon: React.ElementType; title: string; subtitle?: string; color?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
      <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
        <Icon size={18} />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{title}</h2>
        {subtitle && <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, tint }: {
  label: string; value: string; icon: React.ElementType; color: string; tint: string;
}) {
  return (
    <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
        <p style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.25rem 0 0", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
      </div>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", background: tint, color }}>
        <Icon size={20} />
      </span>
    </div>
  );
}

// ─── 1. Live QR Scanner Section ──────────────────────────────────────────────
function QRScannerSection() {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SectionHeader icon={ScanLine} title="Asset Scanner" subtitle="Scan QR codes to verify physical assets in the field" color="#059669" />
      <QRScanner autoValidate showProductCard />
    </div>
  );
}

// ─── 2. Stock Quantity Validator ─────────────────────────────────────────────
function StockValidatorSection() {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SectionHeader icon={CheckCircle2} title="Stock Validator" subtitle="Compare physical count vs system expected count" color="#3b82f6" />
      <div className="data-table-wrap">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Location</th>
                <th style={{ textAlign: "center" }}>Expected</th>
                <th style={{ textAlign: "center" }}>Scanned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stockInventory.map((item) => {
                const match = item.actualQty === item.expectedQty;
                return (
                  <tr key={item.id}>
                    <td><span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--primary)" }}>{item.sku}</span></td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>{item.location}</td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{item.expectedQty}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: match ? "#059669" : "#dc2626" }}>{item.actualQty}</td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.15rem 0.5rem", borderRadius: "0.375rem",
                        fontSize: "0.75rem", fontWeight: 600,
                        background: match ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
                        color: match ? "#059669" : "#dc2626"
                      }}>
                        {match ? <Check size={12} /> : <X size={12} />}
                        {match ? "Match" : "Mismatch"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Depreciation Method Selector ─────────────────────────────────────────
function DepreciationSection() {
  const [methods, setMethods] = useState<Record<string, string>>({});

  const calculateDepreciation = (cost: number, method: string) => {
    switch (method) {
      case "Straight-line": return cost * 0.2; // 20%
      case "Declining Balance": return cost * 0.3; // 30%
      case "FIFO": return cost * 0.15; // 15%
      case "WDV": return cost * 0.25; // 25%
      default: return cost * 0.2;
    }
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SectionHeader icon={Calculator} title="Depreciation Simulator" subtitle="Apply accounting methods to verify asset book values" color="#8b5cf6" />
      <div className="data-table-wrap">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Original Cost</th>
                <th>Method</th>
                <th>Depreciation</th>
                <th>Current Book Value</th>
              </tr>
            </thead>
            <tbody>
              {stockInventory.slice(0, 5).map((item) => {
                const method = methods[item.id] || "Straight-line";
                const dep = calculateDepreciation(item.unitCost, method);
                const current = item.unitCost - dep;

                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ color: "var(--muted-foreground)" }}>${item.unitCost.toLocaleString()}</td>
                    <td>
                      <select
                        className="input"
                        style={{ padding: "0.3rem 1.5rem 0.3rem 0.5rem", fontSize: "0.78rem" }}
                        value={method}
                        onChange={(e) => setMethods({ ...methods, [item.id]: e.target.value })}
                      >
                        <option>Straight-line</option>
                        <option>Declining Balance</option>
                        <option>FIFO</option>
                        <option>WDV</option>
                      </select>
                    </td>
                    <td style={{ color: "#dc2626", fontWeight: 500 }}>-${dep.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 700, color: "#059669" }}>${current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── 4. Mismatch Reporter ────────────────────────────────────────────────────
function MismatchReporterSection() {
  const [localMismatches, setLocalMismatches] = useState(mismatches);
  const [filter, setFilter] = useState("All");

  const displayed = filter === "All" ? localMismatches : localMismatches.filter(m => m.resolved === (filter === "Resolved"));

  const toggleResolved = (id: string) => {
    setLocalMismatches(prev => prev.map(m => m.id === id ? { ...m, resolved: !m.resolved } : m));
  };

  const updateNote = (id: string, note: string) => {
    setLocalMismatches(prev => prev.map(m => m.id === id ? { ...m, notes: note } : m));
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <SectionHeader icon={AlertTriangle} title="Mismatch Reporter" subtitle="Log and resolve discrepancies found during audit" color="#f59e0b" />
      
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {["All", "Pending", "Resolved"].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {displayed.map(m => (
          <div key={m.id} style={{ border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem", background: m.resolved ? "rgba(5,150,105,0.03)" : "rgba(245,158,11,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{m.productName}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--primary)", background: "rgba(109,40,217,0.1)", padding: "0.1rem 0.4rem", borderRadius: "0.25rem" }}>{m.sku}</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
                  Location: {m.location} | Audit: {m.auditSession} | {m.scannedAt}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <StatusBadge value={m.type} />
                <button
                  onClick={() => toggleResolved(m.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.6rem", borderRadius: "0.375rem",
                    border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                    background: m.resolved ? "rgba(5,150,105,0.15)" : "rgba(245,158,11,0.15)",
                    color: m.resolved ? "#059669" : "#d97706"
                  }}
                >
                  {m.resolved ? <><CheckCircle2 size={12} /> Resolved</> : "Mark Resolved"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <MessageSquare size={14} style={{ color: "var(--muted-foreground)", marginTop: "0.4rem" }} />
              <input
                type="text"
                className="input"
                style={{ flex: 1, fontSize: "0.8rem", padding: "0.3rem 0.6rem", background: "rgba(255,255,255,0.5)" }}
                placeholder="Add auditor notes here..."
                value={m.notes}
                onChange={(e) => updateNote(m.id, e.target.value)}
              />
            </div>
          </div>
        ))}
        {displayed.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>
            No {filter.toLowerCase()} mismatches found.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Auditor Dashboard ───────────────────────────────────────────────────
export function AuditorDashboard() {
  const scannedTotal = stockInventory.reduce((s, r) => s + r.actualQty, 0);
  const pendingMismatches = mismatches.filter(m => !m.resolved).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* KPI Row */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))" }}>
        <KpiCard label="Active Sessions" value="3" icon={ClipboardList} color="#6366f1" tint="rgba(99,102,241,0.12)" />
        <KpiCard label="Assets Scanned" value={String(scannedTotal)} icon={ScanLine} color="#059669" tint="rgba(5,150,105,0.12)" />
        <KpiCard label="Open Mismatches" value={String(pendingMismatches)} icon={AlertTriangle} color="#f59e0b" tint="rgba(245,158,11,0.12)" />
        <KpiCard label="Reports Due" value="2" icon={FileText} color="#dc2626" tint="rgba(220,38,38,0.12)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.75rem" }}>
        <QRScannerSection />
        <MismatchReporterSection />
      </div>

      <StockValidatorSection />
      <DepreciationSection />
    </div>
  );
}
