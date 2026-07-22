import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { signOutMock } from "@/lib/auth";

interface PageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {actions}
          <button
            onClick={() => signOutMock()}
            className="btn btn-outline btn-sm"
            style={{ gap: "0.35rem" }}
            title="Logout"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
      <div className="page-body">{children}</div>
    </div>
  );
}
