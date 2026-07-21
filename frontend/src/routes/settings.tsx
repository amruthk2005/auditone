import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { getMockUser } from "@/lib/auth";
import { User, Building2, Save, CheckCircle2, AlertCircle, Loader2, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { updateProfileApi, updateWorkspaceApi } from "@/lib/api";

const ROLES = [
  { value: "company_user", label: "Company User" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "finance_manager", label: "Finance Manager" },
  { value: "inventory_manager", label: "Inventory Manager" },
  { value: "auditor", label: "Auditor" },
  { value: "admin", label: "System Administrator" },
];

export function SettingsPage() {
  const initialUser = getMockUser();

  // Profile Form State
  const [name, setName] = useState(initialUser?.name ?? "Company Admin");
  const [email, setEmail] = useState(initialUser?.email ?? "company@acme.com");
  const [role, setRole] = useState(initialUser?.role ?? "company_user");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Workspace Form State
  const [companyName, setCompanyName] = useState("Acme Corp");
  const [industry, setIndustry] = useState("Technology");
  const [timezone, setTimezone] = useState("UTC+05:30 — India Standard Time");
  const [workspaceMsg, setWorkspaceMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile Save Mutation
  const profileMutation = useMutation({
    mutationFn: () => updateProfileApi({ name, email, role }),
    onSuccess: (data) => {
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      // Update mock storage user
      const currentUser = getMockUser();
      if (currentUser) {
        localStorage.setItem("mock_user", JSON.stringify({ ...currentUser, name, email, role }));
      }
      setTimeout(() => setProfileMsg(null), 3000);
    },
    onError: (err: any) => {
      setProfileMsg({ type: "error", text: err?.response?.data?.detail || "Failed to update profile." });
    },
  });

  // Workspace Save Mutation
  const workspaceMutation = useMutation({
    mutationFn: () => updateWorkspaceApi({ company_name: companyName, industry, timezone }),
    onSuccess: () => {
      setWorkspaceMsg({ type: "success", text: "Workspace settings saved!" });
      setTimeout(() => setWorkspaceMsg(null), 3000);
    },
    onError: (err: any) => {
      setWorkspaceMsg({ type: "error", text: err?.response?.data?.detail || "Failed to save workspace settings." });
    },
  });

  return (
    <PageShell title="Settings" description="Workspace and account preferences.">
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(109,40,217,0.1)", color: "var(--primary)" }}>
              <User size={16} />
            </span>
            <h2 className="card-title">Profile</h2>
          </div>

          <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {profileMsg && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.625rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.82rem",
                  background: profileMsg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  color: profileMsg.type === "success" ? "#10b981" : "#ef4444",
                  border: `1px solid ${profileMsg.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}
              >
                {profileMsg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                {profileMsg.text}
              </div>
            )}

            <div className="field-group">
              <label className="label">Full Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="field-group">
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="company@acme.com"
              />
            </div>

            {/* Interactive Role Dropdown */}
            <div className="field-group">
              <label className="label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Shield size={13} color="var(--primary)" /> Role / Functionality
              </label>
              <select
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ cursor: "pointer" }}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => profileMutation.mutate()}
              disabled={profileMutation.isPending}
              style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}
            >
              {profileMutation.isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Saving...</>
              ) : (
                <><Save size={14} /> Save changes</>
              )}
            </button>
          </div>
        </div>

        {/* Workspace Card */}
        {role !== "auditor" && (
          <div className="card">
            <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(109,40,217,0.1)", color: "var(--primary)" }}>
                <Building2 size={16} />
              </span>
              <h2 className="card-title">Workspace</h2>
            </div>

            <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {workspaceMsg && (
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.625rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.82rem",
                    background: workspaceMsg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                    color: workspaceMsg.type === "success" ? "#10b981" : "#ef4444",
                    border: `1px solid ${workspaceMsg.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}
                >
                  {workspaceMsg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  {workspaceMsg.text}
                </div>
              )}

              <div className="field-group">
                <label className="label">Company Name</label>
                <input
                  className="input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>

              <div className="field-group">
                <label className="label">Industry</label>
                <select
                  className="input"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="Technology">Technology</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Finance">Finance & Banking</option>
                  <option value="Retail">Retail & E-commerce</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>

              <div className="field-group">
                <label className="label">Timezone</label>
                <select
                  className="input"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="UTC+05:30 — India Standard Time">UTC+05:30 — India Standard Time</option>
                  <option value="UTC+00:00 — Greenwich Mean Time">UTC+00:00 — Greenwich Mean Time</option>
                  <option value="UTC-05:00 — Eastern Standard Time">UTC-05:00 — Eastern Standard Time</option>
                  <option value="UTC+01:00 — Central European Time">UTC+01:00 — Central European Time</option>
                </select>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => workspaceMutation.mutate()}
                disabled={workspaceMutation.isPending}
                style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}
              >
                {workspaceMutation.isPending ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving...</>
                ) : (
                  <><Save size={14} /> Save changes</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
