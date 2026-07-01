import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/lib/api";
import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { StatusBadge } from "@/components/status-badge";
import { audits, notifications } from "@/lib/mock-data";
import {
  Package, ClipboardList, Hourglass, DollarSign,
  TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, XCircle, ArrowLeftRight, Building2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

type Audit = (typeof audits)[number];

const auditCols: Column<Audit>[] = [
  { key: "name", header: "Audit", render: (a) => <span style={{ fontWeight: 500, color: "var(--primary)" }}>{a.name}</span> },
  { key: "scope", header: "Scope" },
  { key: "scheduledFor", header: "Scheduled" },
  { key: "status", header: "Status", render: (a) => <StatusBadge value={a.status} /> },
];

const trend = [
  { m: "Dec '23", v: 1.6 }, { m: "Jan '24", v: 1.85 }, { m: "Feb '24", v: 1.75 },
  { m: "Mar '24", v: 2.1 }, { m: "Apr '24", v: 2.35 }, { m: "May '24", v: 2.55 },
];

const breakdown = [
  { name: "Verified", value: 1102, color: "#10b981" },
  { name: "Missing", value: 312, color: "#f43f5e" },
  { name: "Damaged", value: 231, color: "#f59e0b" },
  { name: "Mismatch", value: 197, color: "#0ea5e9" },
];

const activity = [
  { icon: ClipboardList, tint: "rgba(109,40,217,0.1)", color: "var(--primary)", what: "Audit Completed", to: "Audit #AUD-2024-0518", type: "Audit", user: "John Doe", when: "May 18, 2024 10:24 AM" },
  { icon: CheckCircle2, tint: "#d1fae5", color: "#059669", what: "Product Verified", to: "Wireless Mouse — WM-102", type: "Product", user: "Jane Smith", when: "May 18, 2024 09:41 AM" },
  { icon: AlertTriangle, tint: "#fef3c7", color: "#d97706", what: "Item Marked as Damaged", to: "Laptop Dell — DL-5300", type: "Product", user: "Mike Johnson", when: "May 17, 2024 04:15 PM" },
];

export function DashboardPage() {
  const { data: stats = { products_count: 0, companies_count: 0, audits_count: 0 } } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const total = breakdown.reduce((s, b) => s + b.value, 0);

  const kpis = [
    { label: "Total Products", value: String(stats.products_count), delta: "+12.5%", up: true, icon: Package },
    { label: "Registered Companies", value: String(stats.companies_count), delta: "+9.1%", up: true, icon: Building2 },
    { label: "Total Audits", value: String(stats.audits_count), delta: "-4.3%", up: false, icon: ClipboardList },
    { label: "Stock Value", value: "$2.4M", delta: "+7.8%", up: true, icon: DollarSign },
  ];

  return (
    <PageShell
      title="Dashboard"
      description="An overview of your inventory, audits, and asset health."
      actions={
        <Link to="/audits" className="btn btn-primary btn-sm">
          New audit
        </Link>
      }
    >
      {/* KPI Row */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))" }}>
        {kpis.map((k) => (
          <div key={k.label} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: 0 }}>{k.label}</p>
                <p style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0.375rem 0 0", letterSpacing: "-0.02em" }}>{k.value}</p>
              </div>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", background: "rgba(109,40,217,0.1)", color: "var(--primary)" }}>
                <k.icon size={20} />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.75rem", fontSize: "0.78rem" }}>
              {k.up
                ? <TrendingUp size={13} style={{ color: "#059669" }} />
                : <TrendingDown size={13} style={{ color: "#dc2626" }} />}
              <span style={{ fontWeight: 600, color: k.up ? "#059669" : "#dc2626" }}>{k.delta}</span>
              <span style={{ color: "var(--muted-foreground)" }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Audits + Notifications */}
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 340px" }}>
        <div>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--muted-foreground)", marginBottom: "0.625rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Upcoming Audits</h2>
          <DataTable columns={auditCols} rows={audits} />
        </div>
        <div>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--muted-foreground)", marginBottom: "0.625rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent Activity</h2>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {notifications.map((n) => (
                <li key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ marginTop: "0.375rem", width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: n.read ? "var(--muted-foreground)" : "var(--primary)", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "0.82rem", margin: 0 }}>{n.title}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", margin: "0.2rem 0 0" }}>{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
        {/* Line chart */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontWeight: 600 }}>Stock Valuation Trend</h3>
            <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", border: "1px solid var(--border)", padding: "0.2rem 0.5rem", borderRadius: "0.375rem" }}>Last 6 Months</span>
          </div>
          <div style={{ height: "16rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}M`} />
                <Tooltip formatter={(v: number) => [`$${v}M`, "Value"]} />
                <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontWeight: 600 }}>Audit Status Breakdown</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ position: "relative", width: "12rem", height: "12rem", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {breakdown.map((b) => <Cell key={b.name} fill={b.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>{total.toLocaleString()}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Total Audited</span>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {breakdown.map((b) => {
                const pct = ((b.value / total) * 100).toFixed(1);
                return (
                  <li key={b.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "0.625rem", height: "0.625rem", borderRadius: "50%", background: b.color }} />
                      {b.name}
                    </span>
                    <span style={{ fontWeight: 600 }}>{b.value.toLocaleString()} <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>({pct}%)</span></span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontWeight: 600 }}>Recent Activity</h3>
          <Link to="/audits" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Related To</th>
                <th>Type</th>
                <th>User</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((a, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "0.375rem", background: a.tint, color: a.color }}>
                        <a.icon size={14} />
                      </span>
                      {a.what}
                    </div>
                  </td>
                  <td style={{ color: "var(--primary)" }}>{a.to}</td>
                  <td><span style={{ background: "var(--muted)", padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem" }}>{a.type}</span></td>
                  <td>{a.user}</td>
                  <td style={{ color: "var(--muted-foreground)" }}>{a.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
