import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { stockInventory, mismatches } from "@/lib/mock-data";
import {
  ClipboardList, PlayCircle, CheckCircle2, CalendarPlus,
  Calculator, AlertTriangle, CheckCircle, Check, X,
  MessageSquare, ChevronDown, ChevronUp, Loader2, AlertCircle, UserCheck, Calendar
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAudits, createAuditApi } from "@/lib/api";

type AuditRow = {
  id: number;
  type: string;
  audit_date: string;
  auditor_name: string;
  scope: string | null;
  instructions: string | null;
  status: string;
};

const INITIAL_FALLBACK_AUDITS: AuditRow[] = [
  { id: 1, type: "Physical Stock Audit", audit_date: "2026-07-26", auditor_name: "Rohan Sharma (Lead Auditor)", scope: "Warehouse A & HQ Floor 3", instructions: "Verify computing and peripheral assets", status: "Scheduled" },
  { id: 2, type: "Asset Valuation Audit", audit_date: "2026-07-19", auditor_name: "Priya Verma (Senior Auditor)", scope: "HQ Operations & Printing Unit", instructions: "Verify depreciation ledger against condition", status: "In Progress" },
  { id: 3, type: "Compliance Audit", audit_date: "2026-07-11", auditor_name: "Anish Kumar", scope: "All Locations", instructions: "Annual physical inventory compliance verification", status: "Completed" },
];

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

// ─── Schedule Audit Modal ──────────────────────────────────────────────────────
function ScheduleAuditModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split("T")[0];

  const [auditorName, setAuditorName] = useState("");
  const [auditDate, setAuditDate] = useState(todayStr);
  const [auditType, setAuditType] = useState("Physical Stock Audit");
  const [scope, setScope] = useState("");
  const [instructions, setInstructions] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => createAuditApi({
      auditor_name: auditorName,
      audit_date: auditDate,
      type: auditType,
      scope: scope || "HQ & All Warehouses",
      instructions: instructions || "Full QR verification of tracked physical assets.",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audits"] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.detail || "Failed to schedule audit session.");
    },
  });

  const handleSubmit = () => {
    if (!auditorName.trim()) {
      setErrorMsg("Please specify who is going to audit (Auditor Name).");
      return;
    }
    if (!auditDate) {
      setErrorMsg("Please select the scheduled audit date.");
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
      onClick={(e) => e.target === e.currentTarget && !mutation.isPending && onClose()}
    >
      <div
        style={{
          background: "var(--card, #fff)", border: "1px solid var(--border)",
          borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "540px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)", maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CalendarPlus size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Schedule New Audit</h2>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                Specify assigned auditor and scheduled execution date
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={mutation.isPending} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.82rem" }}>
            <AlertCircle size={14} /> {errorMsg}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Who is going to audit */}
          <div className="field-group">
            <label className="label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <UserCheck size={13} color="var(--primary)" /> Who is going to audit? (Auditor Name) *
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Rohan Sharma (Lead Auditor)"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
            />
          </div>

          {/* Audit Date & Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="field-group">
              <label className="label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Calendar size={13} color="var(--primary)" /> Scheduled Date *
              </label>
              <input
                type="date"
                className="input"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="label">Audit Category</label>
              <select
                className="input"
                value={auditType}
                onChange={(e) => setAuditType(e.target.value)}
              >
                <option value="Physical Stock Audit">Physical Stock Audit</option>
                <option value="Asset Valuation Audit">Asset Valuation Audit</option>
                <option value="Compliance Audit">Compliance Audit</option>
                <option value="Quarterly Review">Quarterly Review</option>
              </select>
            </div>
          </div>

          {/* Audit Scope */}
          <div className="field-group">
            <label className="label">Audit Scope & Location</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Warehouse A & HQ Floor 3"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            />
          </div>

          {/* Instructions */}
          <div className="field-group">
            <label className="label">Audit Instructions & Notes</label>
            <textarea
              className="input"
              placeholder="e.g. Perform full physical QR validation and record discrepancies."
              rows={2}
              style={{ resize: "vertical" }}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={onClose} disabled={mutation.isPending}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", border: "none" }}
            disabled={mutation.isPending}
            onClick={handleSubmit}
          >
            {mutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Scheduling…</> : <><CalendarPlus size={14} /> Schedule Audit</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Audit Schedule Table ─────────────────────────────────────────────────────
function AuditScheduleTable({ auditsList }: { auditsList: AuditRow[] }) {
  const scheduled = auditsList.filter(a => (a.status || "").toLowerCase() === "scheduled").length;
  const inProgress = auditsList.filter(a => (a.status || "").toLowerCase() === "in progress").length;
  const completed = auditsList.filter(a => (a.status || "").toLowerCase() === "completed").length;

  return (
    <>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Audits", value: auditsList.length, icon: ClipboardList, color: "#6366f1" },
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
                <th>ID</th>
                <th>Auditor Assigned</th>
                <th>Audit Category</th>
                <th>Scope / Location</th>
                <th>Scheduled Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditsList.map((a) => (
                <tr key={a.id}>
                  <td><span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--primary)", fontWeight: 700 }}>#{a.id}</span></td>
                  <td style={{ fontWeight: 600 }}>{a.auditor_name || "Unassigned"}</td>
                  <td>
                    <span style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", padding: "0.15rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.73rem", fontWeight: 600 }}>
                      {a.type}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>{a.scope || "—"}</td>
                  <td style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", fontWeight: 600 }}>{a.audit_date}</td>
                  <td><StatusBadge value={a.status || "Scheduled"} /></td>
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
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{m.productName}</span>
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const { data: apiAudits } = useQuery<AuditRow[]>({
    queryKey: ["audits"],
    queryFn: fetchAudits,
    staleTime: 1000 * 60 * 5,
  });

  const auditsList: AuditRow[] = Array.isArray(apiAudits) && apiAudits.length > 0
    ? apiAudits
    : INITIAL_FALLBACK_AUDITS;

  return (
    <>
      {showScheduleModal && (
        <ScheduleAuditModal onClose={() => setShowScheduleModal(false)} />
      )}

      <PageShell
        title="Audit Centre"
        description="Schedule audits, validate stock, calculate depreciation and resolve discrepancies."
        actions={
          <button className="btn btn-primary btn-sm" id="schedule-audit-btn" onClick={() => setShowScheduleModal(true)}>
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
            <AuditScheduleTable auditsList={auditsList} />
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
    </>
  );
}
