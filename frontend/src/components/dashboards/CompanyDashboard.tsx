import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Home, DollarSign, Boxes, TrendingDown, TrendingUp, BarChart2,
  PieChart, LineChart as LineChartIcon, Layers, FileText, ArrowRight, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/lib/api";

// ─── Colors Palette ───────────────────────────────────────────────────────────
const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#64748b"];

// ─── KPI Card Component ───────────────────────────────────────────────────────
function KpiCard({
  label, value, subtitle, icon: Icon, color, tint,
}: {
  label: string; value: string; subtitle?: string;
  icon: React.ElementType; color: string; tint: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        justify: "space-between",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {label}
          </p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.35rem 0 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            {value}
          </p>
        </div>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", background: tint, color }}>
          <Icon size={20} />
        </span>
      </div>
      {subtitle && (
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Section Card Wrapper ─────────────────────────────────────────────────────
function ChartCard({
  title, subtitle, icon: Icon, color = "#6366f1", children, action,
}: {
  title: string; subtitle: string; icon: React.ElementType; color?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: "1.5rem", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
            <Icon size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700 }}>{title}</h3>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Fallback Sample Data ─────────────────────────────────────────────────────
const DEFAULT_VALUATION_BY_CAT = [
  { category: "Computing", valuation: 36000 },
  { category: "Peripherals", valuation: 9450 },
  { category: "AV Equipment", valuation: 3900 },
  { category: "Displays", valuation: 12800 },
  { category: "Printing", valuation: 3600 },
  { category: "Furniture", valuation: 17600 },
];

const DEFAULT_DEPRECIATION_BY_CAT = [
  { category: "Computing", depreciation: 6400 },
  { category: "Peripherals", depreciation: 1650 },
  { category: "AV Equipment", depreciation: 700 },
  { category: "Displays", depreciation: 2200 },
  { category: "Printing", depreciation: 650 },
  { category: "Furniture", depreciation: 3100 },
];

const DEFAULT_ASSETS_BY_CAT = [
  { category: "Furniture", count: 80 },
  { category: "Peripherals", count: 110 },
  { category: "Displays", count: 40 },
  { category: "Computing", count: 30 },
  { category: "Printing", count: 8 },
  { category: "AV Equipment", count: 5 },
];

const DEFAULT_DEPRECIATION_TREND = [
  { year: "2026", book_value: 83350, accumulated_depreciation: 14700 },
  { year: "2027", book_value: 68630, accumulated_depreciation: 29420 },
  { year: "2028", book_value: 53910, accumulated_depreciation: 44140 },
  { year: "2029", book_value: 39190, accumulated_depreciation: 58860 },
  { year: "2030", book_value: 24470, accumulated_depreciation: 73580 },
];

// ─── Main Company Operations Dashboard ────────────────────────────────────────
export function CompanyDashboard() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5,
  });

  const totalAssets = stats?.total_assets_count ?? 273;
  const acquisitionCost = stats?.total_acquisition_cost ?? 98050;
  const currentValuation = stats?.total_book_value ?? 83350;
  const totalDepreciation = stats?.total_depreciation ?? 14700;

  const valuationData = stats?.valuation_by_category?.length > 0
    ? stats.valuation_by_category
    : DEFAULT_VALUATION_BY_CAT;

  const depreciationData = stats?.depreciation_by_category?.length > 0
    ? stats.depreciation_by_category
    : DEFAULT_DEPRECIATION_BY_CAT;

  const assetCountData = stats?.assets_by_category?.length > 0
    ? stats.assets_by_category
    : DEFAULT_ASSETS_BY_CAT;

  const trendData = stats?.depreciation_trend?.length > 0
    ? stats.depreciation_trend
    : DEFAULT_DEPRECIATION_TREND;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Top Bar Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>Financial & Asset Operations Analytics</h2>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
            Live valuation, depreciation, and category asset distribution dashboard
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            to="/login"
            className="btn btn-outline btn-sm"
            style={{ gap: "0.35rem", fontSize: "0.78rem" }}
            title="Go to Welcome Portal to switch to Auditor or Company Login"
          >
            <Home size={13} color="var(--primary)" /> Welcome Portal
          </Link>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => refetch()}
            style={{ gap: "0.35rem", fontSize: "0.78rem" }}
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} /> Refresh Analytics
          </button>
        </div>
      </div>

      {/* ─── 1. Top KPI Summary Strip ─────────────────────────────────────── */}
      <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <KpiCard
          label="Total Tracked Assets"
          value={totalAssets.toLocaleString()}
          subtitle="Physical inventory across all locations"
          icon={Boxes}
          color="#6366f1"
          tint="rgba(99,102,241,0.12)"
        />
        <KpiCard
          label="Acquisition Cost"
          value={`$${(acquisitionCost / 1000).toFixed(1)}k`}
          subtitle="Original purchase capital cost"
          icon={DollarSign}
          color="#3b82f6"
          tint="rgba(59,130,246,0.12)"
        />
        <KpiCard
          label="Net Book Valuation"
          value={`$${(currentValuation / 1000).toFixed(1)}k`}
          subtitle="Current estimated fair market value"
          icon={BarChart2}
          color="#10b981"
          tint="rgba(16,185,129,0.12)"
        />
        <KpiCard
          label="Accumulated Depreciation"
          value={`$${(totalDepreciation / 1000).toFixed(1)}k`}
          subtitle="Total written-off asset value"
          icon={TrendingDown}
          color="#f59e0b"
          tint="rgba(245,158,11,0.12)"
        />
      </div>

      {/* ─── 2. Valuation & Depreciation Chart Row ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>

        {/* Valuation by Category Bar Chart */}
        <ChartCard
          title="Valuation by Category"
          subtitle="Current book value distributed by category"
          icon={BarChart2}
          color="#6366f1"
          action={
            <Link to="/valuations" className="btn btn-ghost btn-sm" style={{ fontSize: "0.78rem", gap: "0.3rem" }}>
              Details <ArrowRight size={12} />
            </Link>
          }
        >
          <div style={{ height: "240px", marginTop: "0.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valuationData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, "Valuation"]} />
                <Bar dataKey="valuation" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {valuationData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Depreciation by Category Bar Chart */}
        <ChartCard
          title="Depreciation Analysis"
          subtitle="Accumulated depreciation written off per category"
          icon={TrendingDown}
          color="#f59e0b"
          action={
            <Link to="/depreciation" className="btn btn-ghost btn-sm" style={{ fontSize: "0.78rem", gap: "0.3rem" }}>
              Ledger <ArrowRight size={12} />
            </Link>
          }
        >
          <div style={{ height: "240px", marginTop: "0.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depreciationData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, "Depreciation"]} />
                <Bar dataKey="depreciation" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {depreciationData.map((_: any, i: number) => (
                    <Cell key={i} fill="#f59e0b" opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

      </div>

      {/* ─── 3. Total Assets Count & Depreciation Curve Row ───────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>

        {/* Total Assets in All Categories */}
        <ChartCard
          title="Total Assets in All Categories"
          subtitle="Unit count distribution of physical assets"
          icon={Layers}
          color="#10b981"
        >
          <div style={{ height: "240px", marginTop: "0.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetCountData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val: number) => [`${val} units`, "Total Assets"]} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={25}>
                  {assetCountData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* 5-Year Asset Depreciation Curve Line Chart */}
        <ChartCard
          title="5-Year Asset Depreciation Projection"
          subtitle="Projected net book value vs. accumulated depreciation curve"
          icon={LineChartIcon}
          color="#8b5cf6"
        >
          <div style={{ height: "240px", marginTop: "0.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "5px" }} />
                <Area type="monotone" dataKey="book_value" name="Net Book Value" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                <Area type="monotone" dataKey="accumulated_depreciation" name="Accumulated Depreciation" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDep)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

      </div>

      {/* ─── 4. Quick Operations Navigator Strip ───────────────────────────── */}
      <div
        className="card"
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justify: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Quick Operations Workspace</h4>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Direct navigation to specialized operational modules</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/products" className="btn btn-primary btn-sm">Products Catalog</Link>
          <Link to="/qr-codes" className="btn btn-outline btn-sm">QR Generator</Link>
          <Link to="/valuations" className="btn btn-outline btn-sm">Valuations</Link>
          <Link to="/depreciation" className="btn btn-outline btn-sm">Depreciation Ledger</Link>
        </div>
      </div>

    </div>
  );
}
