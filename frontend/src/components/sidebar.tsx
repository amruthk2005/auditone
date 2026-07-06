import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ClipboardList, Package, QrCode, ScanLine,
  DollarSign, TrendingDown, FileText, Building2, Building, Users, Bell,
  Settings, LogOut, ChevronLeft, ChevronRight, Truck, Activity, Brain,
  ShieldCheck, UserCircle, ListChecks, UserPlus, BarChart3, History,
} from "lucide-react";
import { useState } from "react";
import { getMockUser, signOutMock } from "@/lib/auth";

const companyGroups = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/audits", icon: ClipboardList, label: "Audits" },
      { to: "/audit-sessions", icon: ClipboardList, label: "Audit Sessions" },
      { to: "/products", icon: Package, label: "Products" },
      { to: "/qr-codes", icon: QrCode, label: "QR Codes" },
      { to: "/scans", icon: ScanLine, label: "Scans" },
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
    label: "Admin",
    items: [
      { to: "/companies", icon: Building2, label: "Companies" },
      { to: "/departments", icon: Building, label: "Departments" },
      { to: "/vendors", icon: Truck, label: "Vendors" },
      { to: "/users", icon: Users, label: "Users" },
      { to: "/notifications", icon: Bell, label: "Notifications" },
      { to: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

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
  const groups = user?.role === "Admin" ? adminGroups : companyGroups;

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
        {groups.map((group) => (
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
              <div className="sidebar-user-role">{user?.role ?? "—"}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOutMock()}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                padding: "0.25rem",
              }}
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
