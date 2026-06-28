import { PageShell } from "@/components/page-shell";
import { getMockUser } from "@/lib/auth";
import { User, Building2, Save } from "lucide-react";

export function SettingsPage() {
  const user = getMockUser();

  return (
    <PageShell title="Settings" description="Workspace and account preferences.">
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {/* Profile card */}
        <div className="card">
          <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(109,40,217,0.1)", color: "var(--primary)" }}>
              <User size={16} />
            </span>
            <h2 className="card-title">Profile</h2>
          </div>
          <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="field-group">
              <label className="label">Name</label>
              <input className="input" defaultValue={user?.name ?? ""} />
            </div>
            <div className="field-group">
              <label className="label">Email</label>
              <input className="input" type="email" defaultValue={user?.email ?? ""} />
            </div>
            <div className="field-group">
              <label className="label">Role</label>
              <input className="input" readOnly defaultValue={user?.role ?? "Auditor"} style={{ background: "var(--muted)", cursor: "not-allowed" }} />
            </div>
            <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }}>
              <Save size={14} /> Save changes
            </button>
          </div>
        </div>

        {/* Workspace card */}
        <div className="card">
          <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(109,40,217,0.1)", color: "var(--primary)" }}>
              <Building2 size={16} />
            </span>
            <h2 className="card-title">Workspace</h2>
          </div>
          <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="field-group">
              <label className="label">Company name</label>
              <input className="input" defaultValue="Acme Corp" />
            </div>
            <div className="field-group">
              <label className="label">Industry</label>
              <select className="select" style={{ paddingLeft: "0.875rem" }}>
                <option>Manufacturing</option>
                <option>Technology</option>
                <option>Finance</option>
                <option>Retail</option>
              </select>
            </div>
            <div className="field-group">
              <label className="label">Timezone</label>
              <select className="select" style={{ paddingLeft: "0.875rem" }}>
                <option>UTC+05:30 — India Standard Time</option>
                <option>UTC+00:00 — Greenwich Mean Time</option>
                <option>UTC-05:00 — Eastern Standard Time</option>
              </select>
            </div>
            <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }}>
              <Save size={14} /> Save changes
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
