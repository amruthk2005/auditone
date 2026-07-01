import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ClipboardList, Package, QrCode, ScanLine,
  DollarSign, TrendingDown, FileText, Building2, Building, Users, Bell,
  Settings, LogOut, ChevronLeft, ChevronRight, Truck,
} from "lucide-react";
import { useState } from "react";
import { getMockUser, signOutMock } from "@/lib/auth";

const groups = [
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

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const user = getMockUser();

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
