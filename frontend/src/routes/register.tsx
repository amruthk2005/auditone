import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Building2, User, Mail, Lock, Eye, EyeOff, Users, Home, ShieldCheck } from "lucide-react";
import { signInMock } from "@/lib/auth";


export function RegisterPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("company");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signInMock({ email: email || "user@acme.com" });
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

      <div className="auth-main" style={{ padding: "2.5rem 1rem" }}>
        <div className="auth-card" style={{ maxWidth: "36rem" }}>
          <h1 className="auth-title" style={{ color: "var(--foreground)" }}>Create your account</h1>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

            {/* Company / Org */}
            <div className="field-group">
              <label className="label">
                {role === "admin" ? "Organisation Name" : role === "auditor" ? "Firm / Organisation Name" : "Company Name"}
              </label>
              <div className="input-icon">
                <Building2 size={16} className="icon" />
                <input
                  type="text"
                  className="input"
                  placeholder={role === "admin" ? "Organisation name" : role === "auditor" ? "Audit firm or organisation" : "Your company name"}
                />
              </div>
            </div>

            {/* Full name */}
            <div className="field-group">
              <label className="label">Full Name</label>
              <div className="input-icon">
                <User size={16} className="icon" />
                <input type="text" className="input" placeholder="Your full name" />
              </div>
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="label">Email</label>
              <div className="input-icon">
                <Mail size={16} className="icon" />
                <input
                  type="email"
                  className="input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="label">Password</label>
              <div className="input-icon">
                <Lock size={16} className="icon" />
                <input type={show ? "text" : "password"} className="input input-right" placeholder="Create a password" />
                <button type="button" className="icon-right" onClick={() => setShow((s) => !s)}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="field-group">
              <label className="label">Confirm Password</label>
              <div className="input-icon">
                <Lock size={16} className="icon" />
                <input type={show2 ? "text" : "password"} className="input input-right" placeholder="Confirm your password" />
                <button type="button" className="icon-right" onClick={() => setShow2((s) => !s)}>
                  {show2 ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="field-group">
              <label className="label">Role</label>
              <div className="input-icon">
                <Users size={16} className="icon" />
                <select
                  className="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="company">Company User</option>
                  <option value="auditor">Auditor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: "center", marginTop: "0.25rem" }}>
              Create Account
            </button>

            <p style={{ textAlign: "center", fontSize: "0.875rem", margin: 0 }}>
              Already registered?{" "}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
