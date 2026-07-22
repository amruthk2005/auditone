import { api } from "./api";

// Auth state
export type LoginRole = "Admin" | "Company" | "Auditor";

let currentUser: { email: string; name: string; role: LoginRole } | null = null;

const roleDefaults: Record<LoginRole, { email: string; name: string; redirectTo: string }> = {
  Admin: { email: "admin@auditone.com", name: "AuditOne Admin", redirectTo: "/admin/dashboard" },
  Company: { email: "admin@acme.com", name: "Acme Admin", redirectTo: "/dashboard" },
  Auditor: { email: "auditor@auditone.com", name: "Audit Auditor", redirectTo: "/auditor/dashboard" },
};

export function getRoleRedirect(role?: string) {
  if (role === "Admin") return roleDefaults.Admin.redirectTo;
  if (role === "Auditor") return roleDefaults.Auditor.redirectTo;
  return roleDefaults.Company.redirectTo;
}

function isPendingCompanyEmail(email: string) {
  const pending = JSON.parse(sessionStorage.getItem("auditone_pending_companies") ?? "[]") as Array<{ email: string; status: string }>;
  return pending.some((company) => company.email.toLowerCase() === email.toLowerCase() && company.status === "Pending Approval");
}

export async function signInMock(opts: { email: string; password?: string; role?: LoginRole } | string) {
  const email = typeof opts === "string" ? opts : opts.email;
  const password = typeof opts === "string" ? "demo" : (opts.password || "demo");
  const selectedRole: LoginRole = typeof opts === "string" ? "Company" : (opts.role ?? "Company");

  if (selectedRole === "Company" && isPendingCompanyEmail(email)) {
    throw new Error("Your company registration is pending admin approval.");
  }

  try {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await api.post("/auth/login", params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const token = response.data.access_token;
    localStorage.setItem("token", token);

    // Get user info
    const meResponse = await api.get("/auth/me");
    currentUser = {
      email: meResponse.data.email,
      name: meResponse.data.name || email.split("@")[0],
      role: selectedRole,
    };
    sessionStorage.setItem("auditone_user", JSON.stringify(currentUser));
  } catch (error) {
    const defaults = roleDefaults[selectedRole];
    currentUser = {
      email: email || defaults.email,
      name: defaults.name,
      role: selectedRole,
    };
    localStorage.setItem("token", `mock-${selectedRole.toLowerCase()}-token`);
    sessionStorage.setItem("auditone_user", JSON.stringify(currentUser));
  }
}

export function registerCompanyPending(company: { companyName: string; email: string; adminName: string }) {
  const pending = JSON.parse(sessionStorage.getItem("auditone_pending_companies") ?? "[]");
  pending.push({
    ...company,
    status: "Pending Approval",
    createdDate: new Date().toISOString().slice(0, 10),
  });
  sessionStorage.setItem("auditone_pending_companies", JSON.stringify(pending));
}

export function getMockUser() {
  if (currentUser) return currentUser;
  const raw = sessionStorage.getItem("auditone_user");
  if (raw) {
    currentUser = JSON.parse(raw);
    return currentUser;
  }
  return null;
}

export function signOutMock() {
  currentUser = null;
  sessionStorage.removeItem("auditone_user");
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export function isAuthenticated() {
  return getMockUser() !== null && localStorage.getItem("token") !== null;
}
