import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Building2, User, Mail, Lock, Eye, EyeOff, Users, Home, ShieldCheck, FileKey, Phone, MapPin } from "lucide-react";
import { signUpUser } from "@/lib/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("company");
  
  // Audit Firm Specific fields
  const [auditFirmName, setAuditFirmName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  
  // Company specific fields
  const [companyName, setCompanyName] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("Technology");
  const [companyPhone, setCompanyPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  const [loading, setLoading] = useState(false);

  // Read initial role query parameter from URL
  const [hasRoleParam, setHasRoleParam] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    if (roleParam) {
      setHasRoleParam(true);
      if (roleParam === "auditor") {
        setRole("auditor");
      } else if (roleParam === "admin") {
        setRole("admin");
      } else {
        setRole("company");
      }
    } else {
      setRole("company");
    }
  }, []);

  // Indian Phone Validation Helper (allows optional +91 or 91, followed by 10-digit number starting with 6-9)
  const validateIndianPhone = (num: string) => {
    const cleanNum = num.replace(/\s+/g, "");
    const regex = /^(?:\+91|91)?[6789]\d{9}$/;
    return regex.test(cleanNum);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Perform phone validation if registering as a company
    if (role === "company") {
      if (companyPhone && !validateIndianPhone(companyPhone)) {
        setPhoneError("Please enter a valid 10-digit Indian phone number (optionally starting with +91).");
        return;
      }
    }

    setLoading(true);
    try {
      await signUpUser({
        name: name || email.split("@")[0] || "User",
        email: email || "user@acme.com",
        password: password || "demo",
        role: role === "company" ? "company_user" : role,
      });
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <h1 className="auth-title" style={{ color: "var(--foreground)", marginBottom: "0.5rem" }}>Create your account</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "1.5rem", textAlign: "center" }}>
            {role === "auditor" 
              ? "Register as an authorized auditor / verification firm" 
              : "Register to manage company assets and valuations"}
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            
            {/* Dynamic fields based on role (Company vs Auditor vs Admin) */}
            {role === "auditor" ? (
              <>
                {/* Audit Firm Name */}
                <div className="field-group">
                  <label className="label">Audit Firm / Organisation Name *</label>
                  <div className="input-icon">
                    <Building2 size={16} className="icon" />
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Deloitte, KPMG, or Independent Auditor"
                      value={auditFirmName}
                      onChange={(e) => setAuditFirmName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Auditor Registration License */}
                <div className="field-group">
                  <label className="label">Auditor Registration / License Number *</label>
                  <div className="input-icon">
                    <FileKey size={16} className="icon" />
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. AUD-90218-IN"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Specialization */}
                <div className="field-group">
                  <label className="label">Practice Specialization / Audit Focus</label>
                  <div className="input-icon">
                    <ShieldCheck size={16} className="icon" />
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Asset Valuation, Stock & Inventory Audits"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Standard Company / Org Name & Additional Fields */
              <>
                <div className="field-group">
                  <label className="label">
                    {role === "admin" ? "Organisation Name *" : "Company Name *"}
                  </label>
                  <div className="input-icon">
                    <Building2 size={16} className="icon" />
                    <input
                      type="text"
                      className="input"
                      placeholder={role === "admin" ? "e.g. System Admin Org" : "e.g. Acme Corp"}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {role === "company" && (
                  <>
                    {/* CIN / Registration Number */}
                    <div className="field-group">
                      <label className="label">Company CIN / Registration Number *</label>
                      <div className="input-icon">
                        <FileKey size={16} className="icon" />
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. U72200DL2026PTC123456"
                          value={cinNumber}
                          onChange={(e) => setCinNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Primary Contact Number (Indian Only Validation) */}
                    <div className="field-group">
                      <label className="label">Primary Contact Number (Indian Phone Only) *</label>
                      <div className="input-icon">
                        <Phone size={16} className="icon" />
                        <input
                          type="tel"
                          className="input"
                          placeholder="e.g. +91 98765 43210 or 9876543210"
                          value={companyPhone}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCompanyPhone(val);
                            if (val && !validateIndianPhone(val)) {
                              setPhoneError("Please enter a valid 10-digit Indian phone number.");
                            } else {
                              setPhoneError("");
                            }
                          }}
                          required
                        />
                      </div>
                      {phoneError && (
                        <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: "0.25rem 0 0", fontWeight: 500 }}>{phoneError}</p>
                      )}
                    </div>

                    {/* Head Office Location */}
                    <div className="field-group">
                      <label className="label">Head Office Location / Address</label>
                      <div className="input-icon">
                        <MapPin size={16} className="icon" />
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Gurugram, Haryana"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Industry Dropdown */}
                    <div className="field-group">
                      <label className="label">Business Industry Segment</label>
                      <div className="input-icon">
                        <Building2 size={16} className="icon" style={{ opacity: 0.6 }} />
                        <select
                          className="select"
                          value={companyIndustry}
                          onChange={(e) => setCompanyIndustry(e.target.value)}
                        >
                          <option value="Technology">Technology & Software</option>
                          <option value="Manufacturing">Manufacturing & Heavy Industry</option>
                          <option value="Finance">Finance, Insurance & Banking</option>
                          <option value="Retail">Retail & E-commerce</option>
                          <option value="Healthcare">Healthcare & Pharmaceutics</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Full name */}
            <div className="field-group">
              <label className="label">Full Name</label>
              <div className="input-icon">
                <User size={16} className="icon" />
                <input
                  type="text"
                  className="input"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="label">Email Address</label>
              <div className="input-icon">
                <Mail size={16} className="icon" />
                <input
                  type="email"
                  className="input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="label">Password</label>
              <div className="input-icon">
                <Lock size={16} className="icon" />
                <input
                  type={show ? "text" : "password"}
                  className="input input-right"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
                <input 
                  type={show2 ? "text" : "password"} 
                  className="input input-right" 
                  placeholder="Confirm your password"
                  required 
                />
                <button type="button" className="icon-right" onClick={() => setShow2((s) => !s)}>
                  {show2 ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role dropdown */}
            {!hasRoleParam && (
              <div className="field-group">
                <label className="label">Select Portal Role</label>
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
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: "center", marginTop: "0.25rem" }} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
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
