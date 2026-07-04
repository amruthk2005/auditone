import { api } from "./api";

// Auth state
let currentUser: { email: string; name: string; role: string } | null = null;

export async function signInMock(opts: { email: string; password?: string } | string) {
  const email = typeof opts === "string" ? opts : opts.email;
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

    // Get user info
    const meResponse = await api.get("/auth/me");
    currentUser = {
      email: meResponse.data.email,
      name: meResponse.data.name || email.split("@")[0],
      role: meResponse.data.role,
    };
    sessionStorage.setItem("auditone_user", JSON.stringify(currentUser));
  } catch (error) {
    console.error("Login failed:", error);
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
