import { stockInventory, mismatches, audits } from "@/lib/mock-data";
import {
  ClipboardList, AlertTriangle, CheckCircle2, FileText,
  ScanLine, TrendingUp, Clock, ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, tint, sub }: {
  label: string; value: string; icon: React.ElementType;
  color: string; tint: string; sub?: string;
}) {
  return (
    <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
        <p style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.25rem 0 0", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", margin: "0.3rem 0 0" }}>{sub}</p>}
      </div>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", background: tint, color }}>
        <Icon size={20} />
      </span>
    </div>
  );
}

// ─── Recent Audits Card ────────────────────────────────────────────────────────
function RecentAuditsCard() {
  const recent = audits.slice(0, 4);
  const statusColor = (s: string) => {
    if (s === "Completed") return { bg: "rgba(5,150,105,0.1)", color: "#059669" };
    if (s === "In Progress") return { bg: "rgba(99,102,241,0.1)", color: "#6366f1" };
    return { bg: "rgba(245,158,11,0.1)", color: "#d97706" };
  };
  return (
    <div className="card" style={{ padding: "1.5rem", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
            <ClipboardList size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Recent Audits</span>
        </div>
        <Link to="/audits" className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          View All <ArrowRight size={13} />
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {recent.map((a) => {
          const sc = statusColor(a.status);
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem" }}>{a.name}</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{a.scope} · {a.scheduledFor}</p>
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", background: sc.bg, color: sc.color, whiteSpace: "nowrap" }}>
                {a.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mismatch Summary Card ────────────────────────────────────────────────────
function MismatchSummaryCard() {
  const open = mismatches.filter(m => !m.resolved);
  return (
    <div className="card" style={{ padding: "1.5rem", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
            <AlertTriangle size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Open Mismatches</span>
        </div>
        <Link to="/audits" className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          Resolve <ArrowRight size={13} />
        </Link>
      </div>
      {open.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>
          <CheckCircle2 size={32} style={{ margin: "0 auto 0.5rem", color: "#059669" }} />
          <p style={{ margin: 0 }}>All mismatches resolved!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {open.slice(0, 4).map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.04)" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem" }}>{m.productName}</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{m.location} · {m.sku}</p>
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(220,38,38,0.1)", color: "#dc2626", whiteSpace: "nowrap" }}>
                {m.type}
              </span>
            </div>
          ))}
          {open.length > 4 && (
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)", textAlign: "center" }}>+{open.length - 4} more mismatches</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────
function QuickActions() {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <p style={{ margin: "0 0 1rem", fontWeight: 700, fontSize: "0.95rem" }}>Quick Actions</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
        {[
          { to: "/scans", icon: ScanLine, label: "Scan Assets", color: "#059669", tint: "rgba(5,150,105,0.1)" },
          { to: "/audits", icon: ClipboardList, label: "Run Audit Tools", color: "#6366f1", tint: "rgba(99,102,241,0.1)" },
          { to: "/reports", icon: FileText, label: "View Reports", color: "#8b5cf6", tint: "rgba(139,92,246,0.1)" },
          { to: "/audits", icon: TrendingUp, label: "Depreciation", color: "#f59e0b", tint: "rgba(245,158,11,0.1)" },
        ].map(({ to, icon: Icon, label, color, tint }) => (
          <Link
            key={label}
            to={to}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
              padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--border)",
              background: tint, cursor: "pointer", textDecoration: "none",
              transition: "transform 0.15s, box-shadow 0.15s", color,
            }}
          >
            <Icon size={22} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", textAlign: "center" }}>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main Auditor Dashboard ───────────────────────────────────────────────────
export function AuditorDashboard() {
  const scannedTotal = stockInventory.reduce((s, r) => s + r.actualQty, 0);
  const pendingMismatches = mismatches.filter(m => !m.resolved).length;
  const completedAudits = audits.filter(a => a.status === "Completed").length;
  const inProgressAudits = audits.filter(a => a.status === "In Progress").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* KPI Row */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))" }}>
        <KpiCard label="Active Sessions" value={String(inProgressAudits)} icon={Clock} color="#6366f1" tint="rgba(99,102,241,0.12)" sub={`${completedAudits} completed`} />
        <KpiCard label="Assets Scanned" value={String(scannedTotal)} icon={ScanLine} color="#059669" tint="rgba(5,150,105,0.12)" sub="Go to Scans →" />
        <KpiCard label="Open Mismatches" value={String(pendingMismatches)} icon={AlertTriangle} color="#f59e0b" tint="rgba(245,158,11,0.12)" sub="Requires attention" />
        <KpiCard label="Reports Due" value="2" icon={FileText} color="#dc2626" tint="rgba(220,38,38,0.12)" sub="View in Reports →" />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Two-column: Recent Audits + Open Mismatches */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.75rem" }}>
        <RecentAuditsCard />
        <MismatchSummaryCard />
      </div>
    </div>
  );
}
