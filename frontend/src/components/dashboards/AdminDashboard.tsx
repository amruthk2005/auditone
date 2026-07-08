import { Link } from "@tanstack/react-router";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import {
  Building2, Users, Bell, Activity,
  TrendingUp, TrendingDown, ShieldCheck, Mail, ArrowRight
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const companyCols: Column<any>[] = [
  { key: "name", header: "Company", render: (c) => <span style={{ fontWeight: 500, color: "var(--primary)" }}>{c.name}</span> },
  { key: "domain", header: "Domain" },
  { key: "plan", header: "Plan" },
  { key: "status", header: "Status", render: (c) => <StatusBadge value={c.status} /> },
];

const recentCompanies = [
  { name: "Acme Corp", domain: "acme.com", plan: "Enterprise", status: "Active" },
  { name: "Global Tech", domain: "globaltech.io", plan: "Pro", status: "Active" },
  { name: "Stark Industries", domain: "stark.com", plan: "Enterprise", status: "Pending" },
  { name: "Wayne Ent", domain: "wayne.ent", plan: "Basic", status: "Active" },
];

const regTrend = [
  { m: "Dec", companies: 12, users: 45 },
  { m: "Jan", companies: 15, users: 60 },
  { m: "Feb", companies: 18, users: 85 },
  { m: "Mar", companies: 22, users: 110 },
  { m: "Apr", companies: 25, users: 135 },
  { m: "May", companies: 30, users: 160 },
];

const roleBreakdown = [
  { name: "Admins", value: 5, color: "#f43f5e" },
  { name: "Auditors", value: 45, color: "#3b82f6" },
  { name: "Company Users", value: 110, color: "#10b981" },
];

const systemActivity = [
  { icon: ShieldCheck, tint: "#d1fae5", color: "#059669", what: "System Backup Completed", time: "10 mins ago" },
  { icon: Users, tint: "rgba(59,130,246,0.1)", color: "#3b82f6", what: "New User Registration Spike", time: "1 hour ago" },
  { icon: Mail, tint: "#fef3c7", color: "#d97706", what: "Email Delivery Delay Warning", time: "3 hours ago" },
];

export function AdminDashboard() {
  const totalUsers = roleBreakdown.reduce((s, b) => s + b.value, 0);

  const kpis = [
    { label: "Total Companies", value: "30", delta: "+5", up: true, icon: Building2, color: "var(--primary)", tint: "rgba(109,40,217,0.1)" },
    { label: "Total Users", value: "160", delta: "+25", up: true, icon: Users, color: "#3b82f6", tint: "rgba(59,130,246,0.1)" },
    { label: "System Alerts", value: "3", delta: "-2", up: true, icon: Bell, color: "#f59e0b", tint: "#fef3c7" },
    { label: "Active Sessions", value: "42", delta: "+12%", up: true, icon: Activity, color: "#10b981", tint: "#d1fae5" },
  ];

  return (
    <>
      {/* KPI Row */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))" }}>
        {kpis.map((k) => (
          <div key={k.label} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: 0 }}>{k.label}</p>
                <p style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0.375rem 0 0", letterSpacing: "-0.02em" }}>{k.value}</p>
              </div>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", background: k.tint, color: k.color }}>
                <k.icon size={20} />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.75rem", fontSize: "0.78rem" }}>
              {k.up
                ? <TrendingUp size={13} style={{ color: "#059669" }} />
                : <TrendingDown size={13} style={{ color: "#dc2626" }} />}
              <span style={{ fontWeight: 600, color: k.up ? "#059669" : "#dc2626" }}>{k.delta}</span>
              <span style={{ color: "var(--muted-foreground)" }}>this month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr", marginTop: "1.5rem" }}>
        {/* Line chart */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontWeight: 600 }}>System Growth</h3>
            <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", border: "1px solid var(--border)", padding: "0.2rem 0.5rem", borderRadius: "0.375rem" }}>Last 6 Months</span>
          </div>
          <div style={{ height: "16rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={regTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ stroke: 'rgba(0,0,0,0.1)' }} />
                <Line type="monotone" name="Users" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Companies" dataKey="companies" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontWeight: 600 }}>User Roles Breakdown</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ position: "relative", width: "12rem", height: "12rem", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleBreakdown} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={4} cornerRadius={4}>
                    {roleBreakdown.map((b) => <Cell key={b.name} fill={b.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>{totalUsers}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Total Users</span>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {roleBreakdown.map((b) => {
                const pct = ((b.value / totalUsers) * 100).toFixed(1);
                return (
                  <li key={b.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "1px", background: b.color }} />
                      {b.name}
                    </span>
                    <span style={{ fontWeight: 600 }}>{b.value} <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>({pct}%)</span></span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Tables */}
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr", marginTop: "1.5rem" }}>
        {/* Recent Companies */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontWeight: 600 }}>Recent Companies</h3>
            <Link to="/companies" className="btn btn-outline btn-sm" style={{ padding: "0.25rem 0.5rem", height: "auto", fontSize: "0.75rem" }}>View All</Link>
          </div>
          <DataTable columns={companyCols} rows={recentCompanies} />
        </div>

        {/* System Activity */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontWeight: 600 }}>System Activity</h3>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {systemActivity.map((a, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", background: a.tint, color: a.color, flexShrink: 0 }}>
                  <a.icon size={18} />
                </span>
                <div style={{ flex: 1, marginTop: "0.25rem" }}>
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500 }}>{a.what}</p>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{a.time}</span>
                </div>
              </li>
            ))}
          </ul>
          <button className="btn btn-outline" style={{ width: "100%", marginTop: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
            View Full Log <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
