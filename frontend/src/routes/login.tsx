import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, Building2, ClipboardCheck, ShieldCheck, ArrowLeft, Home, Users } from "lucide-react";
import { getRoleRedirect, signInMock, type LoginRole } from "@/lib/auth";

// ────────────────────────────────────────────────────────────────────────────
// Shared login form (used by both actor pages)
// ────────────────────────────────────────────────────────────────────────────
interface ActorLoginFormProps {
  actor: "company" | "auditor";
}

function ActorLoginForm({ actor }: ActorLoginFormProps) {
  const navigate = useNavigate();
  const isCompany = actor === "company";
  const defaultRole: LoginRole = isCompany ? "Company" : "Auditor";
  const [role, setRole] = useState<LoginRole>(defaultRole);

  const defaultEmail = isCompany ? "admin@acme.com" : "auditor@auditone.com";
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("demo");
  const [show, setShow] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const accentColor = isCompany ? "#6366f1" : "#10b981";
  const accentGradient = isCompany
    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
    : "linear-gradient(135deg, #10b981, #059669)";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      await signInMock({ email, password, role });
      navigate({ to: getRoleRedirect(role) });
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: isCompany ? "linear-gradient(135deg, #1e1b4b 0%, #0f0c29 50%, #302b63 100%)" : "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)" }}>
      {/* Header */}
      <header className="auth-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck size={28} />
          <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>AuditOne</span>
        </div>
        <Link
          to="/login"
          className="btn btn-outline btn-sm"
          style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "0.375rem" }}
        >
          <ArrowLeft size={14} /> Back
        </Link>
      </header>

      <div className="auth-main">
        <div className="auth-card" style={{ borderTop: `3px solid ${accentColor}` }}>
          {/* Actor badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem",
              background: accentGradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 14px ${accentColor}55`,
            }}>
              {isCompany ? <Building2 size={18} color="#fff" /> : <ClipboardCheck size={18} color="#fff" />}
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: accentColor, fontWeight: 600 }}>
                {isCompany ? "Company Portal" : "Auditor Portal"}
              </div>
              <h1 className="auth-title" style={{ margin: 0, fontSize: "1.4rem" }}>
                {isCompany ? "Company Sign In" : "Auditor Sign In"}
              </h1>
            </div>
          </div>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Email */}
            <div className="field-group">
              <label className="label" htmlFor="role">Login role</label>
              <div className="input-icon">
                <Users size={16} className="icon" />
                <select
                  id="role"
                  className="input"
                  value={role}
                  onChange={(e) => {
                    const nextRole = e.target.value as LoginRole;
                    setRole(nextRole);
                    if (nextRole === "Admin") setEmail("admin@auditone.com");
                    if (nextRole === "Company") setEmail("admin@acme.com");
                    if (nextRole === "Auditor") setEmail("auditor@auditone.com");
                  }}
                  required
                >
                  <option>Admin</option>
                  <option>Company</option>
                  <option>Auditor</option>
                </select>
              </div>
            </div>

            <div className="field-group">
              <label className="label" htmlFor={`${actor}-email`}>Email</label>
              <div className="input-icon">
                <Mail size={16} className="icon" />
                <input
                  id={`${actor}-email`}
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isCompany ? "you@company.com" : "auditor@firm.com"}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="label" htmlFor={`${actor}-password`}>Password</label>
              <div className="input-icon">
                <Lock size={16} className="icon" />
                <input
                  id={`${actor}-password`}
                  type={show ? "text" : "password"}
                  className="input input-right"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="icon-right" onClick={() => setShow((s) => !s)}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ textAlign: "right", marginTop: "0.25rem" }}>
                <a href="#" className="auth-link" style={{ fontSize: "0.8rem" }}>Forgot password?</a>
              </div>
            </div>

            {/* Error */}
            {loginError && (
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
                borderRadius: "0.5rem", padding: "0.75rem", color: "#f87171", fontSize: "0.85rem",
              }}>
                ⚠ {loginError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ justifyContent: "center", marginTop: "0.25rem", background: accentGradient, border: "none" }}
              disabled={loading}
            >
              {loading ? "Signing in…" : <><Lock size={16} /> Sign in</>}
            </button>

            {/* Demo hint */}
            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--muted-foreground)", margin: 0 }}>
              Demo: <strong>{defaultEmail}</strong> / <strong>demo</strong>
            </p>

            <div className="auth-divider">
              <span className="line" />
              or
              <span className="line" />
            </div>

            <p style={{ textAlign: "center", fontSize: "0.875rem", margin: 0 }}>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="auth-link">Sign up</Link>
            </p>
            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--muted-foreground)", margin: 0 }}>
              Demo password for all roles: <strong>demo</strong>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Landing — pick your actor
// ────────────────────────────────────────────────────────────────────────────
export function LoginPage() {
  return (
    <div className="auth-page" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      <header className="auth-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck size={28} />
          <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>AuditOne</span>
        </div>
        <Link to="/register" className="btn btn-outline btn-sm" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>
          Register
        </Link>
      </header>

      <div className="auth-main">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.03em" }}>
            Welcome to AuditOne
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", marginTop: "0.5rem", fontSize: "1rem" }}>
            Select your portal to continue
          </p>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "640px" }}>
          {/* Company User card */}
          <Link
            to="/login/company"
            style={{ textDecoration: "none", flex: "1 1 260px", maxWidth: "280px" }}
          >
            <div className="actor-card" id="card-company">
              <div className="actor-card-icon" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 8px 24px #6366f155" }}>
                <Building2 size={36} color="#fff" />
              </div>
              <h2 className="actor-card-title">Company User</h2>
              <p className="actor-card-desc">
                Manage assets, departments, products, vendors and track valuations for your organisation.
              </p>
              <div className="actor-card-cta" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                Sign in as Company User
              </div>
            </div>
          </Link>

          {/* Auditor card */}
          <Link
            to="/login/auditor"
            style={{ textDecoration: "none", flex: "1 1 260px", maxWidth: "280px" }}
          >
            <div className="actor-card" id="card-auditor">
              <div className="actor-card-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 8px 24px #10b98155" }}>
                <ClipboardCheck size={36} color="#fff" />
              </div>
              <h2 className="actor-card-title">Auditor</h2>
              <p className="actor-card-desc">
                Conduct audit sessions, review scans, generate reports and verify compliance across clients.
              </p>
              <div className="actor-card-cta" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                Sign in as Auditor
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Company login page
// ────────────────────────────────────────────────────────────────────────────
export function CompanyLoginPage() {
  return <ActorLoginForm actor="company" />;
}

// ────────────────────────────────────────────────────────────────────────────
// Auditor login page
// ────────────────────────────────────────────────────────────────────────────
export function AuditorLoginPage() {
  return <ActorLoginForm actor="auditor" />;
}
