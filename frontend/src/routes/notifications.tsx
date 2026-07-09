import { PageShell } from "@/components/page-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications } from "@/lib/api";
import { Bell, CheckCheck } from "lucide-react";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 5000, // poll for new notifications every 5s
  });

  const markAllRead = () => {
    // Clear notifications or mark all as read locally/backend
    const localNotifs = sessionStorage.getItem("auditone_local_notifications");
    if (localNotifs) {
      const parsed = JSON.parse(localNotifs).map((n: any) => ({ ...n, read: true }));
      sessionStorage.setItem("auditone_local_notifications", JSON.stringify(parsed));
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  };

  return (
    <PageShell
      title="Notifications"
      description="System and audit alerts."
      actions={
        <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
          <CheckCheck size={15} /> Mark all read
        </button>
      }
    >
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>
            No notifications.
          </div>
        ) : (
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
        )}
      </div>
    </PageShell>
  );
}
