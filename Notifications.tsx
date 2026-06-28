import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { notifications } from "@/lib/mock-data";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — AuditOne" }] }),
function NotificationsPage() {
  return (
    <PageShell title="Notifications" description="System and audit alerts.">
      <div className="rounded-xl border bg-card">
    <PageShell
      title="Notifications"
      description="System and audit alerts."
      actions={
        <Button variant="secondary">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      }
    >
      <div className="rounded-xl border bg-card shadow-sm">
        <ul className="divide-y">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-3 p-4">
              <span className={`mt-1.5 h-2 w-2 rounded-full ${n.read ? "bg-muted" : "bg-primary"}`} />
            <li
              key={n.id}
              className={`flex items-start gap-3 p-4 transition-colors hover:bg-muted/40 ${
                !n.read ? "bg-primary/5" : ""
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ${
                  n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                <Bell className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm">{n.title}</p>
                <p className={`text-sm ${!n.read ? "font-medium" : ""}`}>{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.time}</p>
              </div>
              {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-primary" />}
            </li>
          ))}
        </ul>