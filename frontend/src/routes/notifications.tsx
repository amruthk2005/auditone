import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { notifications as initialMockNotifications } from "@/lib/mock-data";
import { Bell, CheckCheck, Check, Trash2, Loader2, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, deleteNotificationApi } from "@/lib/api";

type NotificationItem = {
  id: number;
  title: string;
  message?: string;
  read: boolean;
  is_read?: boolean;
  time: string;
};

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [localItems, setLocalItems] = useState<NotificationItem[]>([]);

  // Fetch notifications from backend
  const { data: apiNotifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  useEffect(() => {
    if (apiNotifications && Array.isArray(apiNotifications) && apiNotifications.length > 0) {
      setLocalItems(
        apiNotifications.map((n: any) => ({
          id: n.id,
          title: n.title || "Notification",
          message: n.message,
          read: n.read ?? n.is_read ?? false,
          time: n.time || n.created_at || "Just now",
        }))
      );
    } else {
      setLocalItems(
        initialMockNotifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: undefined,
          read: n.read,
          time: n.time,
        }))
      );
    }
  }, [apiNotifications]);

  // Mutation: Mark all as read
  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => {
      setLocalItems((prev) => prev.map((item) => ({ ...item, read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mutation: Mark single notification as read
  const markSingleMutation = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onMutate: (id: number) => {
      setLocalItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mutation: Delete single notification
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNotificationApi(id),
    onMutate: (id: number) => {
      setLocalItems((prev) => prev.filter((item) => item.id !== id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = localItems.filter((n) => !n.read).length;

  return (
    <PageShell
      title="Notifications"
      description={`System and audit alerts. ${unreadCount > 0 ? `(${unreadCount} unread)` : "All caught up!"}`}
      actions={
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => markAllMutation.mutate()}
          disabled={unreadCount === 0 || markAllMutation.isPending}
          style={{
            gap: "0.4rem",
            opacity: unreadCount === 0 ? 0.6 : 1,
            cursor: unreadCount === 0 ? "not-allowed" : "pointer",
          }}
        >
          {markAllMutation.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CheckCheck size={15} color="var(--primary)" />
          )}
          Mark all read
        </button>
      }
    >
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {isLoading && localItems.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted-foreground)" }}>
            <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto 0.5rem" }} />
            Loading notifications...
          </div>
        ) : localItems.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted-foreground)" }}>
            <Bell size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.3 }} />
            No notifications at this time.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {localItems.map((n) => (
              <li
                key={n.id}
                className={`notif-item${!n.read ? " unread" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--border)",
                  background: n.read ? "transparent" : "rgba(109, 40, 217, 0.04)",
                  transition: "background 0.2s",
                }}
              >
                {/* Icon */}
                <span
                  className="notif-icon"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "0.5rem",
                    flexShrink: 0,
                    background: n.read ? "var(--muted)" : "rgba(109,40,217,0.12)",
                    color: n.read ? "var(--muted-foreground)" : "var(--primary)",
                  }}
                >
                  <Bell size={16} />
                </span>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: n.read ? 400 : 600 }}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span
                        style={{
                          background: "var(--primary)",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "0.1rem 0.4rem",
                          borderRadius: "9999px",
                          textTransform: "uppercase",
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>
                  {n.message && (
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      {n.message}
                    </p>
                  )}
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--muted-foreground)", opacity: 0.8 }}>
                    {n.time}
                  </p>
                </div>

                {/* Individual Mark as Read & Delete Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {!n.read ? (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => markSingleMutation.mutate(n.id)}
                      title="Mark as read"
                      style={{
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.75rem",
                        gap: "0.3rem",
                        borderColor: "rgba(109,40,217,0.3)",
                        color: "var(--primary)",
                      }}
                    >
                      <Check size={13} /> Mark read
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--muted-foreground)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        padding: "0.2rem 0.5rem",
                        background: "var(--muted)",
                        borderRadius: "0.375rem",
                      }}
                    >
                      <CheckCheck size={12} color="#10b981" /> Read
                    </span>
                  )}

                  <button
                    onClick={() => deleteMutation.mutate(n.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--muted-foreground)",
                      cursor: "pointer",
                      padding: "0.3rem",
                      borderRadius: "0.375rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Delete notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
