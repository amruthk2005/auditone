import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { audits, stockInventory, mismatches } from "@/lib/mock-data";
import {
  ClipboardList, PlayCircle, CheckCircle2, CalendarPlus,
  Calculator, AlertTriangle, CheckCircle, Check, X,
  MessageSquare, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon, title, subtitle, color = "var(--primary)",
}: { icon: React.ElementType; title: string; subtitle?: string; color?: string }) {
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

// ─── Collapsible Card ─────────────────────────────────────────────────────────
function CollapsibleCard({
  icon, title, subtitle, color, children, defaultOpen = true,
}: {
  icon: React.ElementType; title: string; subtitle?: string; color?: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ overflow: "visible" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 1.5rem", background: "none", border: "none", cursor: "pointer",
          borderBottom: open ? "1px solid var(--border)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: `${color ?? "var(--primary)"}22`, display: "flex", alignItems: "center", justifyContent: "center", color: color ?? "var(--primary)", flexShrink: 0 }}>
            {(() => { const I = icon; return <I size={18} />; })()}
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>{title}</p>
            {subtitle && <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{subtitle}</p>}
          </div>
        </div>
        <span style={{ color: "var(--muted-foreground)", flexShrink: 0 }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && <div style={{ padding: "1.5rem" }}>{children}</div>}
    </div>
  );
}

// ─── Audit Schedule Table ─────────────────────────────────────────────────────
function AuditScheduleTable() {
  const scheduled = audits.filter(a => a.status === "Scheduled").length;
  const inProgress = audits.filter(a => a.status === "In Progress").length;
  const completed = audits.filter(a => a.status === "Completed").length;

  return (
    <>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Audits", value: audits.length, icon: ClipboardList, color: "#6366f1" },
          { label: "Scheduled", value: scheduled, icon: CalendarPlus, color: "#0ea5e9" },
          { label: "In Progress", value: inProgress, icon: PlayCircle, color: "#f59e0b" },
          { label: "Completed", value: completed, icon: CheckCircle2, color: "#059669" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: `${color}0f`, border: `1px solid ${color}33`, borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Icon size={18} style={{ color }} />
            <div>
              <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
              <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="data-table-wrap">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit Name</th>
                <th>Scope</th>
                <th>Scheduled For</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a.id}>
                  <td><span style={{ fontWeight: 500, color: "var(--primary)" }}>{a.name}</span></td>
                  <td style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{a.scope}</td>
                  <td style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{a.scheduledFor}</td>
                  <td><StatusBadge value={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Stock Validator ──────────────────────────────────────────────────────────
function StockValidator() {
  return (
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
                      display: "inline-flex", alignItems: "center", gap: "0.3rem",
                      padding: "0.15rem 0.5rem", borderRadius: "0.375rem",
                      fontSize: "0.75rem", fontWeight: 600,
                      background: match ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
                      color: match ? "#059669" : "#dc2626",
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
  );
}

// ─── Depreciation Simulator ───────────────────────────────────────────────────
function DepreciationSimulator() {
  const [methods, setMethods] = useState<Record<string, string>>({});

  const calculateDepreciation = (cost: number, method: string) => {
    switch (method) {
      case "Straight-line": return cost * 0.2;
      case "Declining Balance": return cost * 0.3;
      case "FIFO": return cost * 0.15;
      case "WDV": return cost * 0.25;
      default: return cost * 0.2;
    }
  };

  return (
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
            {stockInventory.slice(0, 6).map((item) => {
              const method = methods[item.id] || "Straight-line";
              const dep = calculateDepreciation(item.unitCost, method);
              const current = item.unitCost - dep;
              return (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td style={{ color: "var(--muted-foreground)" }}>₹{item.unitCost.toLocaleString("en-IN")}</td>
                  <td>
                    <select
                      className="input"
                      style={{ padding: "0.3rem 1.5rem 0.3rem 0.5rem", fontSize: "0.78rem", minWidth: "140px" }}
                      value={method}
                      onChange={(e) => setMethods({ ...methods, [item.id]: e.target.value })}
                    >
                      <option>Straight-line</option>
                      <option>Declining Balance</option>
                      <option>FIFO</option>
                      <option>WDV</option>
                    </select>
                  </td>
                  <td style={{ color: "#dc2626", fontWeight: 500 }}>
                    -₹{dep.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ fontWeight: 700, color: "#059669" }}>
                    ₹{current.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Mismatch Reporter ────────────────────────────────────────────────────────
function MismatchReporter() {
  const [localMismatches, setLocalMismatches] = useState(mismatches);
  const [filter, setFilter] = useState("All");

  const displayed = filter === "All"
    ? localMismatches
    : localMismatches.filter(m => m.resolved === (filter === "Resolved"));

  const toggleResolved = (id: string) =>
    setLocalMismatches(prev => prev.map(m => m.id === id ? { ...m, resolved: !m.resolved } : m));

  const updateNote = (id: string, note: string) =>
    setLocalMismatches(prev => prev.map(m => m.id === id ? { ...m, notes: note } : m));

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {["All", "Pending", "Resolved"].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`}
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
                  Location: {m.location} · Audit: {m.auditSession} · {m.scannedAt}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <StatusBadge value={m.type} />
                <button
                  onClick={() => toggleResolved(m.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    padding: "0.25rem 0.6rem", borderRadius: "0.375rem",
                    border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                    background: m.resolved ? "rgba(5,150,105,0.15)" : "rgba(245,158,11,0.15)",
                    color: m.resolved ? "#059669" : "#d97706",
                  }}
                >
                  {m.resolved ? <><CheckCircle size={12} /> Resolved</> : "Mark Resolved"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <MessageSquare size={14} style={{ color: "var(--muted-foreground)", marginTop: "0.4rem" }} />
              <input
                type="text"
                className="input"
                style={{ flex: 1, fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
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
    </>
  );
}

// ─── Main Audits Page ─────────────────────────────────────────────────────────
export function AuditsPage() {
  return (
    <PageShell
      title="Audit Centre"
      description="Schedule audits, validate stock, calculate depreciation and resolve discrepancies."
      actions={
        <button className="btn btn-primary btn-sm">
          <CalendarPlus size={15} /> Schedule Audit
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Audit Schedule */}
        <CollapsibleCard
          icon={ClipboardList}
          title="Audit Schedule"
          subtitle="View and manage all planned and active audit sessions"
          color="#6366f1"
          defaultOpen={true}
        >
          <AuditScheduleTable />
        </CollapsibleCard>

        {/* Stock Validator */}
        <CollapsibleCard
          icon={CheckCircle2}
          title="Stock Validator"
          subtitle="Compare physical count vs system expected count"
          color="#3b82f6"
          defaultOpen={true}
        >
          <StockValidator />
        </CollapsibleCard>

        {/* Depreciation Simulator */}
        <CollapsibleCard
          icon={Calculator}
          title="Depreciation Simulator"
          subtitle="Apply accounting methods to verify asset book values"
          color="#8b5cf6"
          defaultOpen={true}
        >
          <DepreciationSimulator />
        </CollapsibleCard>

        {/* Mismatch Reporter */}
        <CollapsibleCard
          icon={AlertTriangle}
          title="Mismatch Reporter"
          subtitle="Log and resolve discrepancies found during audit"
          color="#f59e0b"
          defaultOpen={true}
        >
          <MismatchReporter />
        </CollapsibleCard>

      </div>
    </PageShell>
  );
}
