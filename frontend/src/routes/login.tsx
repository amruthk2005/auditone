import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, Building2, ClipboardCheck, ShieldCheck, ArrowLeft, QrCode, ScanLine, Sparkles, RefreshCw } from "lucide-react";
import { signInMock, signInWithQR } from "@/lib/auth";
import { generateCompanyLoginQr, generateAuditorLoginQr } from "@/lib/api";

// ────────────────────────────────────────────────────────────────────────────
// Shared login form (used by both actor pages)
// ────────────────────────────────────────────────────────────────────────────
interface ActorLoginFormProps {
  actor: "company" | "auditor";
}

function ActorLoginForm({ actor }: ActorLoginFormProps) {
  const navigate = useNavigate();
  const isCompany = actor === "company";

  const defaultEmail = isCompany ? "company@acme.com" : "auditor@acme.com";
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("demo");
  const [show, setShow] = useState(false);
  const [loginMode, setLoginMode] = useState<"standard" | "qr">("standard");
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [qrImageB64, setQrImageB64] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingQr, setGeneratingQr] = useState(false);

  const accentColor = isCompany ? "#6366f1" : "#10b981";
  const accentGradient = isCompany
    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
    : "linear-gradient(135deg, #10b981, #059669)";

  // Load login QR code when switching to QR mode
  useEffect(() => {
    if (loginMode === "qr" && !qrImageB64) {
      fetchLoginQr();
    }
  }, [loginMode]);

  const fetchLoginQr = async () => {
    setGeneratingQr(true);
    try {
      const fetcher = isCompany ? generateCompanyLoginQr : generateAuditorLoginQr;
      const data = await fetcher(email || defaultEmail);
      if (data?.image_base64) {
        setQrImageB64(data.image_base64);
        setQrCodeInput(data.qr_code || (isCompany ? `AO-LOGIN-COMP-${email}` : `AO-AUDITOR-LOGIN-${email}`));
      }
    } catch {
      setQrCodeInput(isCompany ? `AO-LOGIN-COMP-${email}` : `AO-AUDITOR-LOGIN-${email}`);
    } finally {
      setGeneratingQr(false);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      if (loginMode === "qr") {
        await signInWithQR(qrCodeInput || `AO-LOGIN-COMP-${email}`);
      } else {
        await signInMock({ email, password });
      }
      navigate({ to: "/dashboard" });
    } catch {
      setLoginError(loginMode === "qr" ? "Invalid or unrecognised QR login code." : "Invalid email or password. Please try again.");
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

          {/* Mode Switcher */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", background: "rgba(255,255,255,0.06)", padding: "0.25rem", borderRadius: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setLoginMode("standard")}
              style={{
                flex: 1, padding: "0.5rem", borderRadius: "0.375rem", border: "none",
                background: loginMode === "standard" ? accentColor : "transparent",
                color: loginMode === "standard" ? "#fff" : "var(--muted-foreground)",
                fontSize: "0.825rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
                transition: "all 0.2s"
              }}
            >
              <Mail size={14} /> Password Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode("qr")}
              style={{
                flex: 1, padding: "0.5rem", borderRadius: "0.375rem", border: "none",
                background: loginMode === "qr" ? accentColor : "transparent",
                color: loginMode === "qr" ? "#fff" : "var(--muted-foreground)",
                fontSize: "0.825rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
                transition: "all 0.2s"
              }}
            >
              <QrCode size={14} /> QR Code Login
            </button>
          </div>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {loginMode === "standard" ? (
              <>
                {/* Email */}
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
              </>
            ) : (
              /* QR Code Login Mode */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  background: "#fff", padding: "0.85rem", borderRadius: "0.75rem",
                  boxShadow: `0 8px 24px ${accentColor}33`, display: "flex", flexDirection: "column", alignItems: "center"
                }}>
                  {qrImageB64 ? (
                    <img
                      src={`data:image/png;base64,${qrImageB64}`}
                      alt="Company Login QR Code"
                      style={{ width: "170px", height: "170px", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: "170px", height: "170px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRadius: "0.5rem" }}>
                      <QrCode size={48} color={accentColor} />
                    </div>
                  )}
                  <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.4rem", fontFamily: "monospace" }}>
                    {qrCodeInput || `AO-LOGIN-COMP-${email}`}
                  </span>
                </div>

                <div className="field-group" style={{ width: "100%" }}>
                  <label className="label" htmlFor="qr-code-payload">Scanned / Generated QR Payload</label>
                  <div className="input-icon">
                    <ScanLine size={16} className="icon" />
                    <input
                      id="qr-code-payload"
                      type="text"
                      className="input"
                      value={qrCodeInput}
                      onChange={(e) => setQrCodeInput(e.target.value)}
                      placeholder="Scan or paste QR code..."
                      required
                    />
                  </div>
                </div>
              </div>
            )}

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
              {loading ? "Authenticating…" : loginMode === "qr" ? <><QrCode size={16} /> Sign in via QR Code</> : <><Lock size={16} /> Sign in</>}
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
              <Link to={actor === "auditor" ? "/register?role=auditor" : "/register?role=company"} className="auth-link">Sign up</Link>
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
