import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Building2, User, Mail, Lock, Eye, EyeOff, Home, ShieldCheck, Hash, MapPin, Phone, Briefcase } from "lucide-react";
import { registerCompanyPending } from "@/lib/auth";


export function RegisterPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("company");
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    registerCompanyPending({
      companyName: companyName || "New Company",
      email: email || "admin@company.com",
      adminName: adminName || "Company Admin",
    });
    setSubmitted(true);
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
          <h1 className="auth-title">Company registration</h1>
          {submitted ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "rgba(22,163,74,0.12)", border: "1px solid rgba(22,163,74,0.35)", borderRadius: "0.75rem", padding: "1rem", color: "#86efac" }}>
                Registration submitted. Your company status is now Pending Approval.
              </div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "0.875rem" }}>
                An AuditOne admin must approve the company before login is enabled.
              </p>
              <button type="button" className="btn btn-primary btn-lg" style={{ justifyContent: "center" }} onClick={() => navigate({ to: "/login" })}>
                Go to sign in
              </button>
            </div>
          ) : (
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
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="label">Registration Number</label>
              <div className="input-icon">
                <Hash size={16} className="icon" />
                <input type="text" className="input" placeholder="CIN / registration number" required />
              </div>
            </div>

            <div className="field-group">
              <label className="label">GST Number</label>
              <div className="input-icon">
                <Hash size={16} className="icon" />
                <input type="text" className="input" placeholder="GSTIN" required />
              </div>
            </div>

            <div className="field-group">
              <label className="label">Industry</label>
              <div className="input-icon">
                <Briefcase size={16} className="icon" />
                <select className="input" required>
                  <option>Manufacturing</option>
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Retail</option>
                  <option>Healthcare</option>
                  <option>Logistics</option>
                </select>
              </div>
            </div>

            <div className="field-group">
              <label className="label">Address</label>
              <div className="input-icon">
                <MapPin size={16} className="icon" />
                <input type="text" className="input" placeholder="Registered office address" required />
              </div>
            </div>

            <div className="field-group">
              <label className="label">Company Email</label>
              <div className="input-icon">
                <Mail size={16} className="icon" />
                <input
                  type="email"
                  className="input"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="label">Phone Number</label>
              <div className="input-icon">
                <Phone size={16} className="icon" />
                <input type="tel" className="input" placeholder="+91 98765 43210" required />
              </div>
            </div>

            <div className="field-group">
              <label className="label">Company Admin Name</label>
              <div className="input-icon">
                <User size={16} className="icon" />
                <input type="text" className="input" placeholder="Primary admin name" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
              </div>
            </div>

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
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: "center", marginTop: "0.25rem" }}>
              Submit for Approval
            </button>

            <p style={{ textAlign: "center", fontSize: "0.875rem", margin: 0 }}>
              Already registered?{" "}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
