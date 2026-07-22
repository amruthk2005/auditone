import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ClipboardList, Package, QrCode, ScanLine,
  DollarSign, TrendingDown, FileText, Building2, Building, Users, Bell,
  Settings, LogOut, ChevronLeft, ChevronRight, Truck, ClipboardCheck,
  Activity, Brain, ShieldCheck, UserCircle, ListChecks, UserPlus, BarChart3, History,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import { getMockUser, signOutMock } from "@/lib/auth";

type NavGroup = { label: string; items: { to: string; icon: React.ElementType; label: string }[] };

function buildNavGroups(role: string): NavGroup[] {
  if (role === "admin") {
    return adminGroups;
  }

  if (role === "auditor") {
    return [
      {
        label: "Overview",
        items: [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
      },
      {
        label: "Auditing",
        items: [
          { to: "/audits", icon: ClipboardList, label: "Audits" },
          { to: "/audit-sessions", icon: ClipboardCheck, label: "Audit Sessions" },
          { to: "/scans", icon: ScanLine, label: "Scans" },
          { to: "/qr-codes", icon: QrCode, label: "QR Codes" },
        ],
      },
      {
        label: "Reports",
        items: [
          { to: "/reports", icon: FileText, label: "Reports" },
          { to: "/notifications", icon: Bell, label: "Notifications" },
          { to: "/chat", icon: MessageSquare, label: "Chat" },
        ],
      },
      {
        label: "Account",
        items: [{ to: "/settings", icon: Settings, label: "Settings" }],
      },
    ];
  }

  // company_user (default for all other roles)
  return [
    {
      label: "Overview",
      items: [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
    },
    {
      label: "Operations",
      items: [
        { to: "/products", icon: Package, label: "Products" },
        { to: "/qr-codes", icon: QrCode, label: "QR Codes" },
        { to: "/departments", icon: Building, label: "Departments" },
        { to: "/vendors", icon: Truck, label: "Vendors" },
      ],
    },
    {
      label: "Finance",
      items: [
        { to: "/valuations", icon: DollarSign, label: "Valuations" },
        { to: "/depreciation", icon: TrendingDown, label: "Depreciation" },
        { to: "/reports", icon: FileText, label: "Reports" },
      ],
    },
    {
      label: "Account",
      items: [
        { to: "/notifications", icon: Bell, label: "Notifications" },
        { to: "/chat", icon: MessageSquare, label: "Chat" },
        { to: "/settings", icon: Settings, label: "Settings" },
      ],
    },
  ];
}

/** Small coloured pill to indicate user role */
function RolePill({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string }> = {
    admin: { label: "Admin", color: "#f59e0b" },
    auditor: { label: "Auditor", color: "#10b981" },
    company_user: { label: "Company", color: "#6366f1" },
  };
  const { label, color } = map[role.toLowerCase()] ?? { label: role, color: "#94a3b8" };
  return (
    <span style={{
      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", color, background: `${color}22`,
      borderRadius: "999px", padding: "0.15rem 0.5rem",
    }}>
      {label}
    </span>
  );
}

const adminGroups = [
  {
    label: "Overview",
    items: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Company Management",
    items: [
      { to: "/admin/companies", icon: Building2, label: "Company List" },
      { to: "/admin/companies/pending", icon: ListChecks, label: "Pending Approvals" },
      { to: "/admin/companies/active", icon: ShieldCheck, label: "Active Companies" },
      { to: "/admin/companies/suspended", icon: Building, label: "Suspended Companies" },
    ],
  },
  {
    label: "Auditor Management",
    items: [
      { to: "/admin/auditors", icon: Users, label: "Auditor List" },
      { to: "/admin/auditors/create", icon: UserPlus, label: "Create Auditor" },
      { to: "/admin/auditors/assigned", icon: ClipboardList, label: "Assigned Audits" },
      { to: "/admin/auditors/performance", icon: BarChart3, label: "Performance" },
    ],
  },
  {
    label: "Audit Management",
    items: [
      { to: "/admin/audits/running", icon: Activity, label: "Running Audits" },
      { to: "/admin/audits/completed", icon: ClipboardList, label: "Completed Audits" },
      { to: "/admin/audits/cancelled", icon: ListChecks, label: "Cancelled Audits" },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/admin/reports", icon: FileText, label: "Reports" },
      { to: "/admin/notifications", icon: Bell, label: "Notifications" },
      { to: "/admin/conversations", icon: MessageSquare, label: "Conversations (Read Only)" },
      { to: "/admin/system-logs", icon: History, label: "System Logs" },
      { to: "/admin/ai-insights", icon: Brain, label: "AI Insights" },
      { to: "/admin/settings", icon: Settings, label: "Settings" },
      { to: "/admin/profile", icon: UserCircle, label: "Admin Profile" },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const user = getMockUser();
  const role = user?.role?.toLowerCase() ?? "company_user";

  const navGroups = buildNavGroups(role);

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-header" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div className="sidebar-logo">A1</div>
          {!collapsed && (
            <span className="sidebar-brand">
              Audit<span>One</span>
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "0.375rem",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "1.75rem",
            height: "1.75rem",
            flexShrink: 0,
          }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="sidebar-content">
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: "0.5rem" }}>
            {!collapsed && <div className="sidebar-group-label">{group.label}</div>}
            {group.items.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`sidebar-item${active ? " active" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={16} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() : "AU"}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{user?.name ?? "Guest"}</div>
              <RolePill role={role} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
