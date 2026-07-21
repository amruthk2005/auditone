import { api } from "./api";

// Auth state
let currentUser: { email: string; name: string; role: string } | null = null;

export async function signInMock(opts: { email: string; password?: string } | string) {
  const email = typeof opts === "string" ? opts.trim() : (opts.email ? opts.email.trim() : "");
  const password = typeof opts === "string" ? "demo" : (opts.password || "demo");
  
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

    // Get user info from backend
    try {
      const meResponse = await api.get("/auth/me");
      currentUser = {
        email: meResponse.data.email,
        name: meResponse.data.name || email.split("@")[0],
        role: meResponse.data.role,
      };
    } catch {
      let role = "company_user";
      if (email.toLowerCase().includes("auditor")) role = "auditor";
      if (email.toLowerCase().includes("admin")) role = "admin";
      currentUser = { email, name: email.split("@")[0], role };
    }
    sessionStorage.setItem("auditone_user", JSON.stringify(currentUser));
  } catch (error: any) {
    console.error("Login failed:", error);
    
    // Offline/network fallback for demo users when backend dev server is not active
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';
    if (isNetworkError) {
      let role = "company_user";
      if (email.toLowerCase().includes("auditor")) role = "auditor";
      if (email.toLowerCase().includes("admin")) role = "admin";

      localStorage.setItem("token", "demo-token-" + Date.now());
      currentUser = {
        email: email || "company@acme.com",
        name: (email || "company").split("@")[0],
        role: role,
      };
      sessionStorage.setItem("auditone_user", JSON.stringify(currentUser));
      return;
    }
    throw error;
  }
}

export async function signUpUser(opts: { name: string; email: string; password?: string; role: string }) {
  try {
    await api.post("/auth/register", {
      name: opts.name,
      email: opts.email,
      password: opts.password || "demo",
      role: opts.role,
    });
    await signInMock({ email: opts.email, password: opts.password || "demo" });
  } catch (error) {
    console.error("Sign up error:", error);
    await signInMock({ email: opts.email, password: opts.password || "demo" });
  }
}

export async function signInWithQR(qrCode: string) {
  try {
    const response = await api.post("/auth/qr-login", { qr_code: qrCode });
    const token = response.data.access_token;
    localStorage.setItem("token", token);

    try {
      const meResponse = await api.get("/auth/me");
      currentUser = {
        email: meResponse.data.email,
        name: meResponse.data.name || meResponse.data.email.split("@")[0],
        role: meResponse.data.role,
      };
    } catch {
      const isAuditor = qrCode.toLowerCase().includes("auditor");
      currentUser = {
        email: isAuditor ? "auditor@acme.com" : "company@acme.com",
        name: isAuditor ? "Bob Smith (Auditor)" : "Alice Johnson",
        role: isAuditor ? "auditor" : "company_user",
      };
    }
    sessionStorage.setItem("auditone_user", JSON.stringify(currentUser));
  } catch (error: any) {
    console.error("QR login failed:", error);
    // Offline/demo fallback
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';
    const isAuditor = qrCode.toLowerCase().includes("auditor");
    if (isNetworkError || qrCode.includes("company") || qrCode.includes("AO-") || qrCode.includes("LOGIN")) {
      localStorage.setItem("token", "demo-qr-token-" + Date.now());
      currentUser = {
        email: isAuditor ? "auditor@acme.com" : "company@acme.com",
        name: isAuditor ? "Bob Smith (Auditor)" : "Company User",
        role: isAuditor ? "auditor" : "company_user",
      };
      sessionStorage.setItem("auditone_user", JSON.stringify(currentUser));
      return;
    }
    throw error;
  }
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
