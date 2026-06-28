import { PageShell } from "@/components/page-shell";
import { notifications } from "@/lib/mock-data";
import { Bell, CheckCheck } from "lucide-react";

export function NotificationsPage() {
  return (
    <PageShell
      title="Notifications"
      description="System and audit alerts."
      actions={
        <button className="btn btn-secondary btn-sm">
          <CheckCheck size={15} /> Mark all read
        </button>
      }
    >
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`notif-item${!n.read ? " unread" : ""}`}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span
                className="notif-icon"
                style={{
                  background: n.read ? "var(--muted)" : "rgba(109,40,217,0.1)",
                  color: n.read ? "var(--muted-foreground)" : "var(--primary)",
                }}
              >
                <Bell size={16} />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: n.read ? 400 : 500 }}>{n.title}</p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{n.time}</p>
              </div>
              {!n.read && <span className="notif-dot" />}
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
