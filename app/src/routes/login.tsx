import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Home } from "lucide-react";
import { signInMock } from "@/lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@acme.com");
  const [password, setPassword] = useState("demo");
  const [show, setShow] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signInMock({ email, password });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck size={28} />
          <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>AuditOne</span>
        </div>
        <Link to="/dashboard" className="btn btn-outline btn-sm" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>
          <Home size={15} /> Home
        </Link>
      </header>

      <div className="auth-main">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="field-group">
              <label className="label" htmlFor="email">Email</label>
              <div className="input-icon">
                <Mail size={16} className="icon" />
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="label" htmlFor="password">Password</label>
              <div className="input-icon">
                <Lock size={16} className="icon" />
                <input
                  id="password"
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

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ justifyContent: "center", marginTop: "0.25rem" }}
            >
              <Lock size={16} /> Sign in
            </button>

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
              Demo mode — use any credentials to log in.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
