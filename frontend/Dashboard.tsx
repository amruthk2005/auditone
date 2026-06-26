import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { DataTable, type Column } from "@/components/data-table";
import { dashboardStats, audits, notifications } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ClipboardList, Hourglass, DollarSign, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, XCircle, ArrowLeftRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AuditOne" }] }),
  component: DashboardPage,
});
type Audit = (typeof audits)[number];
const kpis = [
  { label: "Total Products", value: "8,420", delta: "+12.5%", up: true, icon: Package, tint: "bg-primary/10 text-primary" },
  { label: "Active Audits", value: "12", delta: "+9.1%", up: true, icon: ClipboardList, tint: "bg-primary/10 text-primary" },
  { label: "Pending Validation", value: "145", delta: "-4.3%", up: false, icon: Hourglass, tint: "bg-amber-100 text-amber-600" },
  { label: "Stock Value", value: "$2.4M", delta: "+7.8%", up: true, icon: DollarSign, tint: "bg-emerald-100 text-emerald-600" },
];
const cols: Column<Audit>[] = [
  { key: "name", header: "Audit" },
  { key: "scope", header: "Scope" },
  { key: "scheduledFor", header: "Scheduled for" },
  {
    key: "status",
    header: "Status",
    render: (a) => (
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{a.status}</span>
    ),
  },
const trend = [
  { m: "Dec '23", v: 1.6 }, { m: "Jan '24", v: 1.85 }, { m: "Feb '24", v: 1.75 },
  { m: "Mar '24", v: 2.1 }, { m: "Apr '24", v: 2.35 }, { m: "May '24", v: 2.55 },
];
const breakdown = [
  { name: "Verified", value: 1102, color: "oklch(0.7 0.18 150)" },
  { name: "Missing", value: 312, color: "oklch(0.6 0.24 25)" },
  { name: "Damaged", value: 231, color: "oklch(0.78 0.17 75)" },
  { name: "Mismatch", value: 197, color: "oklch(0.62 0.18 230)" },
];
const activity = [
  { icon: ClipboardList, tint: "bg-primary/10 text-primary", what: "Audit Completed", to: "Audit #AUD-2024-0518", type: "Audit", user: "John Doe", when: "May 18, 2024 10:24 AM" },
  { icon: CheckCircle2, tint: "bg-emerald-100 text-emerald-600", what: "Products Verified", to: "Wireless Mouse — WM-102", type: "Product", user: "Jane Smith", when: "May 18, 2024 09:41 AM" },
  { icon: AlertTriangle, tint: "bg-amber-100 text-amber-600", what: "Item Marked as Damaged", to: "Laptop Dell — DL-5300", type: "Product", user: "Mike Johnson", when: "May 17, 2024 04:15 PM" },
  { icon: XCircle, tint: "bg-rose-100 text-rose-600", what: "Item Marked as Missing", to: "Projector Epson — EB-X41", type: "Product", user: "Sarah Lee", when: "May 17, 2024 02:32 PM" },
  { icon: ArrowLeftRight, tint: "bg-sky-100 text-sky-600", what: "Mismatch Detected", to: "Monitor LG — 24MK600M", type: "Audit", user: "David Brown", when: "May 17, 2024 11:08 AM" },
];
function DashboardPage() {
  const total = breakdown.reduce((s, b) => s + b.value, 0);
  return (
    <PageShell
      title="Dashboard"
      description="An overview of your inventory, audits, and asset health."
      actions={
        <Button asChild>
          <Link to="/audits">New audit</Link>
        </Button>
      }
    >
    <PageShell title="Company Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((s) => (
          <StatCard key={s.label} {...s} />
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{k.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{k.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${k.tint}`}>
                  <k.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                {k.up ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-600" />}
                <span className={k.up ? "font-medium text-emerald-600" : "font-medium text-rose-600"}>{k.delta}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Upcoming audits</h2>
          <DataTable columns={cols} rows={audits} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Recent activity</h2>
          <div className="rounded-xl border bg-card">
            <ul className="divide-y">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-start gap-2 p-3 text-sm">
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${n.read ? "bg-muted" : "bg-primary"}`} />
                  <div>
                    <p>{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Stock Valuation Trend</h3>
              <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">Last 6 Months</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 280)" />
                  <XAxis dataKey="m" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}M`} />
                  <Tooltip formatter={(v: number) => `$${v}M`} />
                  <Line type="monotone" dataKey="v" stroke="oklch(0.5 0.27 285)" strokeWidth={2.5} dot={{ r: 4, fill: "oklch(0.5 0.27 285)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 font-semibold">Audit Status Breakdown</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-56 w-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdown} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={2}>
                      {breakdown.map((b) => <Cell key={b.name} fill={b.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{total.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Total Audited</span>
                </div>
              </div>
              <ul className="flex-1 space-y-2 text-sm">
                {breakdown.map((b) => {
                  const pct = ((b.value / total) * 100).toFixed(1);
                  return (
                    <li key={b.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                        {b.name}
                      </span>
                      <span className="font-medium">
                        {b.value.toLocaleString()} <span className="text-muted-foreground">({pct}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Recent Activity</h3>
            <Button asChild variant="outline" size="sm"><Link to="/audits">View All</Link></Button>
          </div>
        </div>
      </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 font-medium">Activity</th>
                  <th className="py-3 font-medium">Related To</th>
                  <th className="py-3 font-medium">Type</th>
                  <th className="py-3 font-medium">User</th>
                  <th className="py-3 font-medium">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((a, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${a.tint}`}>
                          <a.icon className="h-3.5 w-3.5" />
                        </span>
                        {a.what}
                      </div>
                    </td>
                    <td className="py-3 text-primary">{a.to}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{a.type}</span>
                    </td>
                    <td className="py-3">{a.user}</td>
                    <td className="py-3 text-muted-foreground">{a.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
