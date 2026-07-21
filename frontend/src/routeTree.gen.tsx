import { createRootRoute, createRoute, createRouter, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/sidebar";
import { isAuthenticated } from "@/lib/auth";

// ── Root ──────────────────────────────────────────────────────────────────────
import { LoginPage, CompanyLoginPage, AuditorLoginPage } from "@/routes/login";
import { RegisterPage } from "@/routes/register";
import { DashboardPage } from "@/routes/dashboard";
import { AuditsPage } from "@/routes/audits";
import { AuditSessionsPage } from "@/routes/audit-sessions";
import { ProductsPage } from "@/routes/products";
import { QrCodesPage } from "@/routes/qr-codes";
import { ScansPage } from "@/routes/scans";
import { ValuationsPage } from "@/routes/valuations";
import { DepreciationPage } from "@/routes/depreciation";
import { ReportsPage } from "@/routes/reports";
import { CompaniesPage } from "@/routes/companies";
import { UsersPage } from "@/routes/users";
import { NotificationsPage } from "@/routes/notifications";
import { SettingsPage } from "@/routes/settings";
import { DepartmentsPage } from "@/routes/departments";
import { VendorsPage } from "@/routes/vendors";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ── Auth layout ───────────────────────────────────────────────────────────────
const authLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "_auth",
  component: () => (
    <div className="app-layout">
      <AppSidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  ),
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: "/login" });
  },
});

// ── Public routes ─────────────────────────────────────────────────────────────
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage });
const companyLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login/company", component: CompanyLoginPage });
const auditorLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login/auditor", component: AuditorLoginPage });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: "/register", component: RegisterPage });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/login" });
  },
  component: () => null,
});

// ── Authenticated routes ───────────────────────────────────────────────────────
const dashboardRoute = createRoute({ getParentRoute: () => authLayout, path: "/dashboard", component: DashboardPage });
const auditsRoute = createRoute({ getParentRoute: () => authLayout, path: "/audits", component: AuditsPage });
const auditSessionsRoute = createRoute({ getParentRoute: () => authLayout, path: "/audit-sessions", component: AuditSessionsPage });
const productsRoute = createRoute({ getParentRoute: () => authLayout, path: "/products", component: ProductsPage });
const qrCodesRoute = createRoute({ getParentRoute: () => authLayout, path: "/qr-codes", component: QrCodesPage });
const scansRoute = createRoute({ getParentRoute: () => authLayout, path: "/scans", component: ScansPage });
const valuationsRoute = createRoute({ getParentRoute: () => authLayout, path: "/valuations", component: ValuationsPage });
const depreciationRoute = createRoute({ getParentRoute: () => authLayout, path: "/depreciation", component: DepreciationPage });
const reportsRoute = createRoute({ getParentRoute: () => authLayout, path: "/reports", component: ReportsPage });
const companiesRoute = createRoute({ getParentRoute: () => authLayout, path: "/companies", component: CompaniesPage });
const usersRoute = createRoute({ getParentRoute: () => authLayout, path: "/users", component: UsersPage });
const notificationsRoute = createRoute({ getParentRoute: () => authLayout, path: "/notifications", component: NotificationsPage });
const settingsRoute = createRoute({ getParentRoute: () => authLayout, path: "/settings", component: SettingsPage });
const departmentsRoute = createRoute({ getParentRoute: () => authLayout, path: "/departments", component: DepartmentsPage });
const vendorsRoute = createRoute({ getParentRoute: () => authLayout, path: "/vendors", component: VendorsPage });

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  companyLoginRoute,
  auditorLoginRoute,
  registerRoute,
  authLayout.addChildren([
    dashboardRoute,
    auditsRoute,
    auditSessionsRoute,
    productsRoute,
    qrCodesRoute,
    scansRoute,
    valuationsRoute,
    depreciationRoute,
    reportsRoute,
    companiesRoute,
    usersRoute,
    notificationsRoute,
    settingsRoute,
    departmentsRoute,
    vendorsRoute,
  ]),
]);
