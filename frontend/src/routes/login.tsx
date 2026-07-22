import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Mail, Lock, Eye, EyeOff, Building2, ClipboardCheck, ShieldCheck,
  ArrowLeft, ArrowRight, Home, Users, CheckCircle2, QrCode,
  TrendingUp, BarChart2, Sparkles, Zap, Server, Award, Shield,
} from "lucide-react";
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
    <div className="enterprise-landing">
      {/* ── Top Enterprise Navigation Header ── */}
      <header className="enterprise-nav">
        <div className="enterprise-nav-container">
          <div className="nav-brand">
            <div className="brand-logo">
              <ShieldCheck size={22} color="#fff" />
            </div>
            <div className="brand-text">
              <span className="brand-name">Audit<span>One</span></span>
              <span className="brand-badge">ENTERPRISE</span>
            </div>
          </div>

          <nav className="nav-links">
            <a href="#portals" className="nav-link">Portals</a>
            <a href="#features" className="nav-link">Platform Capabilities</a>
            <a href="#security" className="nav-link">Security & Trust</a>
            <a href="#metrics" className="nav-link">Live Telemetry</a>
          </nav>

          <div className="nav-actions">
            <Link to="/register" className="btn btn-outline btn-sm enterprise-reg-btn">
              Register Organization
            </Link>
            <Link to="/login/company" className="btn btn-primary btn-sm enterprise-login-btn">
              Sign In <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="badge-sparkle" />
            <span>Next-Generation Physical Asset Intelligence & Compliance Engine</span>
          </div>

          <h1 className="hero-title">
            Unified Enterprise Asset Valuation & <span className="text-gradient">Automated Audit Intelligence</span>
          </h1>

          <p className="hero-subtitle">
            Continuous physical asset tracking, instant QR barcode verification, automated depreciation ledgers, 
            and real-time disparity resolution designed for modern enterprise organizations.
          </p>

          <div className="hero-ctas">
            <Link to="/login/company" className="btn btn-primary btn-lg hero-btn-primary">
              <Building2 size={18} /> Company Portal Sign In <ArrowRight size={16} />
            </Link>
            <Link to="/login/auditor" className="btn btn-outline btn-lg hero-btn-secondary">
              <ClipboardCheck size={18} /> Auditor Workspace <ArrowRight size={16} />
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div className="hero-metrics" id="metrics">
            <div className="metric-item">
              <div className="metric-value">99.98%</div>
              <div className="metric-label">Audit Accuracy Rate</div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-value">$1.8B+</div>
              <div className="metric-label">Valuation Tracked</div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-value">500k+</div>
              <div className="metric-label">QR Assets Tagged</div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-value">&lt; 10ms</div>
              <div className="metric-label">Scan Telemetry Latency</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise Portals Section ── */}
      <section className="portals-section" id="portals">
        <div className="section-header">
          <div className="section-eyebrow">ENTERPRISE ACCESS PORTALS</div>
          <h2 className="section-title">Select Your Role-Based Portal</h2>
          <p className="section-desc">Dedicated workspace environments tailored specifically for internal company teams and independent auditors.</p>
        </div>

        <div className="portals-grid">
          {/* Company Portal Card */}
          <div className="portal-card company-portal-card">
            <div className="portal-card-header">
              <div className="portal-icon-wrapper company-icon">
                <Building2 size={32} color="#fff" />
              </div>
              <div className="portal-badge company-badge">INTERNAL OPERATIONS</div>
            </div>

            <h3 className="portal-title">Company Operations Portal</h3>
            <p className="portal-description">
              Complete physical asset cataloging, department allocations, vendor management, and automated financial depreciation tracking.
            </p>

            <ul className="portal-features">
              <li><CheckCircle2 size={16} color="#6366f1" /> Product & Physical Inventory Ledger</li>
              <li><CheckCircle2 size={16} color="#6366f1" /> Real-time Valuation & Depreciation (Straight-Line/DB)</li>
              <li><CheckCircle2 size={16} color="#6366f1" /> High-Resolution QR Barcode Printing & Export</li>
              <li><CheckCircle2 size={16} color="#6366f1" /> Departmental Stock Reconciliation & Analytics</li>
            </ul>

            <Link to="/login/company" className="btn btn-primary portal-cta company-cta">
              Access Company Portal <ArrowRight size={16} />
            </Link>
          </div>

          {/* Auditor Workspace Card */}
          <div className="portal-card auditor-portal-card">
            <div className="portal-card-header">
              <div className="portal-icon-wrapper auditor-icon">
                <ClipboardCheck size={32} color="#fff" />
              </div>
              <div className="portal-badge auditor-badge">AUDIT & COMPLIANCE</div>
            </div>

            <h3 className="portal-title">Auditor Workspace</h3>
            <p className="portal-description">
              Independent audit session management, mobile scan telemetry, discrepancy detection heatmaps, and formal compliance reporting.
            </p>

            <ul className="portal-features">
              <li><CheckCircle2 size={16} color="#10b981" /> Physical Scan Telemetry & Mismatch Detection</li>
              <li><CheckCircle2 size={16} color="#10b981" /> Multi-Location Discrepancy Heatmaps</li>
              <li><CheckCircle2 size={16} color="#10b981" /> Immutable Audit Trail & Exception Logging</li>
              <li><CheckCircle2 size={16} color="#10b981" /> One-Click Executive & Regulatory PDF Exports</li>
            </ul>

            <Link to="/login/auditor" className="btn btn-primary portal-cta auditor-cta">
              Access Auditor Workspace <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Enterprise Platform Capabilities Grid ── */}
      <section className="capabilities-section" id="features">
        <div className="section-header">
          <div className="section-eyebrow">SYSTEM ARCHITECTURE</div>
          <h2 className="section-title">Built for High-Scale Enterprise Auditing</h2>
          <p className="section-desc">Designed from the ground up to handle complex supply chains, multi-location inventory, and strict regulatory standards.</p>
        </div>

        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="cap-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
              <QrCode size={24} />
            </div>
            <h4 className="cap-title">QR & Barcode Telemetry</h4>
            <p className="cap-desc">Generate, print, and scan high-density QR tags linked to real-time database state for sub-second verification.</p>
          </div>

          <div className="capability-card">
            <div className="cap-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
              <TrendingUp size={24} />
            </div>
            <h4 className="cap-title">Automated Asset Valuation</h4>
            <p className="cap-desc">Dynamic net book value calculations, straight-line depreciation curves, and accumulated write-off projections.</p>
          </div>

          <div className="capability-card">
            <div className="cap-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
              <Zap size={24} />
            </div>
            <h4 className="cap-title">Instant Mismatch Resolution</h4>
            <p className="cap-desc">Automated discrepancy flags identifying physical count vs. record variances with structured audit resolution flows.</p>
          </div>

          <div className="capability-card">
            <div className="cap-icon" style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
              <Shield size={24} />
            </div>
            <h4 className="cap-title">Role-Based Access Control</h4>
            <p className="cap-desc">Strict security boundary enforcing segregated views for Company Staff, Independent Auditors, and System Admins.</p>
          </div>

          <div className="capability-card">
            <div className="cap-icon" style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899" }}>
              <BarChart2 size={24} />
            </div>
            <h4 className="cap-title">Executive Compliance Reports</h4>
            <p className="cap-desc">Comprehensive visual dashboards, downloadable ledger summaries, and regulatory audit trail reports.</p>
          </div>

          <div className="capability-card">
            <div className="cap-icon" style={{ background: "rgba(14,165,233,0.12)", color: "#0ea5e9" }}>
              <Server size={24} />
            </div>
            <h4 className="cap-title">Multi-Location Management</h4>
            <p className="cap-desc">Group physical inventory across global warehouses, office floors, data centers, and vendor sites seamlessly.</p>
          </div>
        </div>
      </section>

      {/* ── Security & Compliance Trust Banner ── */}
      <section className="security-banner" id="security">
        <div className="security-container">
          <div className="security-badge">
            <ShieldCheck size={20} color="#10b981" />
            <span>ENTERPRISE-GRADE SECURITY & COMPLIANCE</span>
          </div>

          <div className="cert-strip">
            <div className="cert-item"><Award size={18} /> SOC 2 Type II Certified</div>
            <div className="cert-item"><Award size={18} /> ISO 27001 Certified</div>
            <div className="cert-item"><Award size={18} /> GDPR & Privacy Compliant</div>
            <div className="cert-item"><Award size={18} /> 99.99% SLA Uptime Guarantee</div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="enterprise-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="brand-logo sm">
              <ShieldCheck size={16} color="#fff" />
            </div>
            <span className="footer-brand">AuditOne Enterprise System</span>
            <span className="footer-copy">© 2026 AuditOne Inc. All rights reserved.</span>
          </div>

          <div className="footer-status">
            <span className="status-dot" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </footer>
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
