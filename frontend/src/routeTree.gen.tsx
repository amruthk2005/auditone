import { createRootRoute, createRoute, createRouter, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/sidebar";
import { isAuthenticated } from "@/lib/auth";

// ── Root ──────────────────────────────────────────────────────────────────────
import { LoginPage, CompanyLoginPage, AuditorLoginPage } from "@/routes/login";
import { RegisterPage } from "@/routes/register";
import { DashboardPage } from "@/routes/dashboard";
import { ChatPage } from "@/routes/chat";
import { AdminConversationsPage } from "@/routes/admin-conversations";
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
import {
  AdminAiInsightsPage,
  AdminAuditDetailsPage,
  AdminAuditsPage,
  AdminAuditorsPage,
  AdminCompanyDetailsPage,
  AdminCompaniesPage,
  AdminCreateAuditorPage,
  AdminDashboardPage,
  AdminNotificationsPage,
  AdminProfilePage,
  AdminReportsPage,
  AdminSettingsPage,
  AdminSystemLogsPage,
  AuditorDashboardPage,
} from "@/routes/admin";

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
  beforeLoad: () => { throw redirect({ to: "/login" }); },
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
const chatRoute = createRoute({ getParentRoute: () => authLayout, path: "/chat", component: ChatPage });
const adminConversationsRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/conversations", component: AdminConversationsPage });
const adminDashboardRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/dashboard", component: AdminDashboardPage });
const adminCompaniesRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/companies", component: AdminCompaniesPage });
const adminCompanyPendingRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/companies/pending", component: AdminCompaniesPage });
const adminCompanyActiveRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/companies/active", component: AdminCompaniesPage });
const adminCompanySuspendedRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/companies/suspended", component: AdminCompaniesPage });
const adminCompanyDetailsRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/companies/$companyId", component: AdminCompanyDetailsPage });
const adminAuditorsRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/auditors", component: AdminAuditorsPage });
const adminAuditorCreateRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/auditors/create", component: AdminCreateAuditorPage });
const adminAuditorAssignedRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/auditors/assigned", component: AdminAuditorsPage });
const adminAuditorPerformanceRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/auditors/performance", component: AdminAuditorsPage });
const adminAuditsRunningRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/audits/running", component: AdminAuditsPage });
const adminAuditsCompletedRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/audits/completed", component: AdminAuditsPage });
const adminAuditsCancelledRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/audits/cancelled", component: AdminAuditsPage });
const adminAuditDetailsRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/audits/$auditId", component: AdminAuditDetailsPage });
const adminReportsRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/reports", component: AdminReportsPage });
const adminNotificationsRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/notifications", component: AdminNotificationsPage });
const adminSystemLogsRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/system-logs", component: AdminSystemLogsPage });
const adminAiInsightsRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/ai-insights", component: AdminAiInsightsPage });
const adminSettingsRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/settings", component: AdminSettingsPage });
const adminProfileRoute = createRoute({ getParentRoute: () => authLayout, path: "/admin/profile", component: AdminProfilePage });
const auditorDashboardRoute = createRoute({ getParentRoute: () => authLayout, path: "/auditor/dashboard", component: AuditorDashboardPage });

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
    chatRoute,
    adminConversationsRoute,
    adminDashboardRoute,
    adminCompaniesRoute,
    adminCompanyPendingRoute,
    adminCompanyActiveRoute,
    adminCompanySuspendedRoute,
    adminCompanyDetailsRoute,
    adminAuditorsRoute,
    adminAuditorCreateRoute,
    adminAuditorAssignedRoute,
    adminAuditorPerformanceRoute,
    adminAuditsRunningRoute,
    adminAuditsCompletedRoute,
    adminAuditsCancelledRoute,
    adminAuditDetailsRoute,
    adminReportsRoute,
    adminNotificationsRoute,
    adminSystemLogsRoute,
    adminAiInsightsRoute,
    adminSettingsRoute,
    adminProfileRoute,
    auditorDashboardRoute,
  ]),
]);
