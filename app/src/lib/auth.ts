// Mock auth state
let currentUser: { email: string; name: string; role: string } | null = null;

export async function signInMock(opts: { email: string; password?: string } | string) {
  const email = typeof opts === "string" ? opts : opts.email;
  currentUser = {
    email,
    name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    role: email.startsWith("admin") ? "Admin" : "Auditor",
  };
  sessionStorage.setItem("auditone_user", JSON.stringify(currentUser));
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
}

export function isAuthenticated() {
  return getMockUser() !== null;
}
