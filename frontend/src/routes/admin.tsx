import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { StatusBadge } from "@/components/status-badge";
import {
  adminActivities,
  adminAuditors,
  adminAudits,
  adminCompanies,
  adminNotifications,
  adminReports,
  auditStatusChart,
  auditorPerformanceChart,
  companyDistributionChart,
  insightCards,
  registrationTrend,
  systemLogs,
} from "@/lib/admin-data";
import { getMockUser, signOutMock } from "@/lib/auth";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Filter,
  KeyRound,
  PackageCheck,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

type Company = (typeof adminCompanies)[number];
type Auditor = (typeof adminAuditors)[number];
type AdminAudit = (typeof adminAudits)[number];
type AdminReport = (typeof adminReports)[number];
type AdminNotification = (typeof adminNotifications)[number];
type SystemLog = (typeof systemLogs)[number];

const cardGrid = { display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" };
const toolbar = { display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" as const };
const inputStyle = { maxWidth: "18rem", minWidth: "13rem" };

function getCompanies(): Company[] {
  const stored = sessionStorage.getItem("auditone_pending_companies");
  const pending = stored ? JSON.parse(stored) as Array<{ companyName: string; email: string; adminName: string; status: string; createdDate: string }> : [];
  return [
    ...adminCompanies,
    ...pending.map((company, index) => ({
      id: `pending-${index + 1}`,
      companyName: company.companyName,
      industry: "Pending Review",
      adminName: company.adminName,
      email: company.email,
      phone: "Pending",
      products: 0,
      audits: 0,
      status: company.status,
      createdDate: company.createdDate,
    })),
  ];
}

function TableToolbar({ search = "Search" }: { search?: string }) {
  return (
    <div style={toolbar}>
      <div className="input-icon" style={inputStyle}>
        <Search size={16} className="icon" />
        <input className="input" placeholder={search} />
      </div>
      <button className="btn btn-outline btn-sm">
        <Filter size={14} /> Filter
      </button>
      <button className="btn btn-outline btn-sm">Previous</button>
      <button className="btn btn-outline btn-sm">Next</button>
    </div>
  );
}

function AdminCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function ActionButtons({ compact = false }: { compact?: boolean }) {
  const cls = "btn btn-outline btn-sm";
  return (
    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
      <button className={cls}>View</button>
      {!compact && <button className={cls}>Edit</button>}
      {!compact && <button className={cls}>Approve</button>}
      {!compact && <button className={cls}>Reject</button>}
      <button className={cls}>Suspend</button>
      <button className={cls}>Reset Password</button>
    </div>
  );
}

const companyColumns: Column<Company>[] = [
  {
    key: "companyName",
    header: "Company Name",
    render: (c) => (
      <Link to="/admin/companies/$companyId" params={{ companyId: c.id }} style={{ color: "var(--primary)", fontWeight: 600 }}>
        {c.companyName}
      </Link>
    ),
  },
  { key: "industry", header: "Industry" },
  { key: "adminName", header: "Admin Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "products", header: "Products", render: (c) => c.products.toLocaleString() },
  { key: "audits", header: "Audits" },
  { key: "status", header: "Status", render: (c) => <StatusBadge value={c.status} /> },
  { key: "createdDate", header: "Created Date" },
  { key: "id", header: "Actions", render: () => <ActionButtons /> },
];

const auditorColumns: Column<Auditor>[] = [
  { key: "name", header: "Name", render: (a) => <span style={{ fontWeight: 600 }}>{a.name}</span> },
  { key: "employeeId", header: "Employee ID" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "assignedCompany", header: "Assigned Company" },
  { key: "currentAudits", header: "Current Audits" },
  { key: "completedAudits", header: "Completed Audits" },
  { key: "performance", header: "Performance" },
  { key: "status", header: "Status", render: (a) => <StatusBadge value={a.status} /> },
  { key: "id", header: "Actions", render: () => <ActionButtons compact /> },
];

const auditColumns: Column<AdminAudit>[] = [
  { key: "id", header: "Audit ID", render: (a) => <Link to="/admin/audits/$auditId" params={{ auditId: a.id }} style={{ color: "var(--primary)", fontWeight: 600 }}>{a.id}</Link> },
  { key: "company", header: "Company" },
  { key: "auditor", header: "Auditor" },
  { key: "scheduledDate", header: "Scheduled Date" },
  { key: "completion", header: "Completion %", render: (a) => `${a.completion}%` },
  { key: "priority", header: "Priority" },
  { key: "status", header: "Status", render: (a) => <StatusBadge value={a.status} /> },
  {
    key: "id",
    header: "Actions",
    render: () => (
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        <button className="btn btn-outline btn-sm">Assign Auditor</button>
        <button className="btn btn-outline btn-sm">Cancel Audit</button>
        <button className="btn btn-outline btn-sm"><Download size={13} /> Report</button>
      </div>
    ),
  },
];

export function AdminDashboardPage() {
  const companies = getCompanies();
  const totalValue = companies.reduce((sum, company) => sum + company.products * 1240, 0);
  return (
    <PageShell
      title="Admin Dashboard"
      description="Command center for company approvals, auditors, audits, reports, and platform health."
      actions={<Link to="/admin/companies/pending" className="btn btn-primary btn-sm">Approve Company</Link>}
    >
      <KpiStrip
        items={[
          { label: "Total Companies", value: String(companies.length), icon: Building2 },
          { label: "Active Companies", value: String(companies.filter((c) => c.status === "Active").length), icon: CheckCircle2 },
          { label: "Registered Auditors", value: String(adminAuditors.length), icon: Users },
          { label: "Running Audits", value: String(adminAudits.filter((a) => a.status === "Running").length), icon: ClipboardList },
          { label: "Completed Audits", value: String(adminAudits.filter((a) => a.status === "Completed").length), icon: PackageCheck },
          { label: "Pending Company Approvals", value: String(companies.filter((c) => c.status === "Pending Approval").length), icon: Activity },
          { label: "Suspended Companies", value: String(companies.filter((c) => c.status === "Suspended").length), icon: XCircle },
          { label: "Total Inventory Value", value: `$${(totalValue / 1000000).toFixed(1)}M`, icon: FileText },
        ]}
      />

      <div style={cardGrid}>
        <AdminCard title="Company Registration Trend">
          <div style={{ height: "16rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="companies" stroke="var(--primary)" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
        <AdminCard title="Audit Status">
          <div style={{ height: "16rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={auditStatusChart} dataKey="value" nameKey="name" outerRadius={90} label>
                  {auditStatusChart.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
        <AdminCard title="Auditor Performance">
          <div style={{ height: "16rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auditorPerformanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
        <AdminCard title="Company Distribution">
          <div style={{ height: "16rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={companyDistributionChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="industry" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" fill="var(--primary-10)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      <div style={cardGrid}>
        <AdminCard title="Recent Activities">
          <DataTable columns={[
            { key: "event", header: "Activity" },
            { key: "target", header: "Related To" },
            { key: "owner", header: "User" },
            { key: "time", header: "Date & Time" },
          ]} rows={adminActivities} />
        </AdminCard>
        <AdminCard title="Quick Actions">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <Link to="/admin/companies/pending" className="btn btn-primary btn-sm">Approve Company</Link>
            <Link to="/admin/auditors/create" className="btn btn-outline btn-sm"><UserPlus size={14} /> Create Auditor</Link>
            <Link to="/admin/audits/running" className="btn btn-outline btn-sm">Assign Auditor</Link>
            <Link to="/admin/reports" className="btn btn-outline btn-sm">Generate Report</Link>
            <Link to="/admin/notifications" className="btn btn-outline btn-sm"><Send size={14} /> Send Notification</Link>
          </div>
        </AdminCard>
        <AdminCard title="Recent Notifications">
          <DataTable columns={[
            { key: "title", header: "Notification" },
            { key: "type", header: "Type" },
            { key: "status", header: "Status", render: (n: AdminNotification) => <StatusBadge value={n.status} /> },
          ]} rows={adminNotifications.slice(0, 3)} />
        </AdminCard>
        <AdminCard title="Upcoming Audit Schedule">
          <DataTable columns={[
            { key: "id", header: "Audit" },
            { key: "company", header: "Company" },
            { key: "auditor", header: "Auditor" },
            { key: "scheduledDate", header: "Scheduled" },
          ]} rows={adminAudits.filter((a) => a.status !== "Cancelled")} />
        </AdminCard>
      </div>
    </PageShell>
  );
}

export function AdminCompaniesPage() {
  const pathname = useRouterState().location.pathname;
  const rows = getCompanies().filter((company) => {
    if (pathname.endsWith("/pending")) return company.status === "Pending Approval";
    if (pathname.endsWith("/active")) return company.status === "Active";
    if (pathname.endsWith("/suspended")) return company.status === "Suspended";
    return true;
  });
  return (
    <PageShell title="Company Management" description="Review companies, approvals, suspension status, and account actions." actions={<TableToolbar search="Search companies" />}>
      <DataTable columns={companyColumns} rows={rows} />
    </PageShell>
  );
}

export function AdminCompanyDetailsPage() {
  const company = getCompanies()[0];
  return (
    <PageShell title="Company Details" description="Company profile, inventory, audit history, valuation, auditors, and reports." actions={<button className="btn btn-primary btn-sm">Edit Company</button>}>
      <div style={cardGrid}>
        <AdminCard title="Company Information">
          <DataTable columns={[
            { key: "companyName", header: "Company" },
            { key: "industry", header: "Industry" },
            { key: "adminName", header: "Admin" },
            { key: "email", header: "Email" },
            { key: "phone", header: "Phone" },
            { key: "status", header: "Status", render: (c: Company) => <StatusBadge value={c.status} /> },
          ]} rows={[company]} />
        </AdminCard>
        <AdminCard title="Inventory Statistics">
          <KpiStrip items={[
            { label: "Products", value: company.products.toLocaleString(), icon: PackageCheck },
            { label: "Audits", value: String(company.audits), icon: ClipboardList },
            { label: "Inventory Value", value: "$595K", icon: FileText },
          ]} />
        </AdminCard>
        <AdminCard title="Audit History"><DataTable columns={auditColumns.slice(0, 7)} rows={adminAudits.filter((a) => a.company === company.companyName)} /></AdminCard>
        <AdminCard title="Valuation History"><DataTable columns={[
          { key: "name", header: "Report" },
          { key: "date", header: "Date" },
          { key: "status", header: "Status", render: (r: AdminReport) => <StatusBadge value={r.status} /> },
        ]} rows={adminReports.filter((r) => r.category === "Valuation")} /></AdminCard>
        <AdminCard title="Assigned Auditors"><DataTable columns={auditorColumns.slice(0, 6)} rows={adminAuditors.filter((a) => a.assignedCompany === company.companyName)} /></AdminCard>
        <AdminCard title="Generated Reports"><DataTable columns={reportColumns} rows={adminReports.slice(0, 3)} /></AdminCard>
      </div>
    </PageShell>
  );
}

export function AdminAuditorsPage() {
  const pathname = useRouterState().location.pathname;
  const performanceMode = pathname.endsWith("/performance");
  const assignedMode = pathname.endsWith("/assigned");
  return (
    <PageShell
      title={performanceMode ? "Auditor Performance" : assignedMode ? "Assigned Audits" : "Auditor Management"}
      description="Create auditors, manage account status, assign companies, and monitor workload."
      actions={<Link to="/admin/auditors/create" className="btn btn-primary btn-sm"><UserPlus size={15} /> Create Auditor</Link>}
    >
      {performanceMode && <KpiStrip items={adminAuditors.map((a) => ({ label: a.name, value: a.performance, icon: Activity, hint: `${a.completedAudits} completed audits` }))} />}
      <TableToolbar search="Search auditors" />
      <DataTable columns={auditorColumns} rows={adminAuditors} />
    </PageShell>
  );
}

export function AdminCreateAuditorPage() {
  return (
    <PageShell title="Create Auditor" description="Create an auditor account and assign initial access." actions={<Link to="/admin/auditors" className="btn btn-outline btn-sm">Auditor List</Link>}>
      <div className="card" style={{ maxWidth: "46rem" }}>
        <div className="card-body" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {["Name", "Employee ID", "Email", "Phone", "Temporary Password", "Confirm Password"].map((label) => (
            <div className="field-group" key={label}>
              <label className="label">{label}</label>
              <input className="input" type={label.includes("Password") ? "password" : label === "Email" ? "email" : "text"} />
            </div>
          ))}
          <div className="field-group">
            <label className="label">Assigned Company</label>
            <select className="input">{adminCompanies.map((c) => <option key={c.id}>{c.companyName}</option>)}</select>
          </div>
          <div className="field-group">
            <label className="label">Status</label>
            <select className="input"><option>Active</option><option>Inactive</option></select>
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary">Create</button>
            <button className="btn btn-outline">Reset</button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function AdminAuditsPage() {
  const pathname = useRouterState().location.pathname;
  const rows = adminAudits.filter((audit) => {
    if (pathname.endsWith("/running")) return audit.status === "Running";
    if (pathname.endsWith("/completed")) return audit.status === "Completed";
    if (pathname.endsWith("/cancelled")) return audit.status === "Cancelled";
    return true;
  });
  return (
    <PageShell title="Audit Management" description="Assign, reassign, cancel, inspect, and download audit reports." actions={<TableToolbar search="Search audits" />}>
      <DataTable columns={auditColumns} rows={rows} />
    </PageShell>
  );
}

export function AdminAuditDetailsPage() {
  const audit = adminAudits[0];
  return (
    <PageShell title="Audit Details" description="Products, scan progress, discrepancies, and current audit status." actions={<button className="btn btn-primary btn-sm"><Download size={14} /> Download Report</button>}>
      <KpiStrip items={[
        { label: "Products", value: "480", icon: PackageCheck },
        { label: "Scanned Items", value: "374", icon: Search },
        { label: "Verified", value: "341", icon: CheckCircle2 },
        { label: "Missing", value: "18", icon: XCircle },
        { label: "Damaged", value: "9", icon: Activity },
        { label: "Mismatch", value: "6", icon: ClipboardList },
        { label: "Audit Progress", value: `${audit.completion}%`, icon: Activity },
        { label: "Current Status", value: audit.status, icon: ShieldCheck },
      ]} />
      <DataTable columns={auditColumns} rows={[audit]} />
    </PageShell>
  );
}

const reportColumns: Column<AdminReport>[] = [
  { key: "name", header: "Report" },
  { key: "section", header: "Section" },
  { key: "company", header: "Company" },
  { key: "auditor", header: "Auditor" },
  { key: "date", header: "Date" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  { key: "category", header: "Category" },
  { key: "format", header: "Export" },
  { key: "id", header: "Actions", render: () => <button className="btn btn-outline btn-sm"><Download size={13} /> Download</button> },
];

export function AdminReportsPage() {
  return (
    <PageShell title="Reports" description="Company, audit, valuation, revenue, and performance reports." actions={<button className="btn btn-primary btn-sm">Generate Report</button>}>
      <div style={toolbar}>
        <select className="input" style={inputStyle}><option>Company</option><option>Acme Corp</option><option>Globex Solutions</option></select>
        <select className="input" style={inputStyle}><option>Auditor</option><option>Jane Smith</option><option>John Doe</option></select>
        <input className="input" style={inputStyle} type="date" />
        <select className="input" style={inputStyle}><option>Status</option><option>Ready</option><option>Queued</option></select>
        <select className="input" style={inputStyle}><option>Category</option><option>Company</option><option>Audit</option><option>Valuation</option><option>Revenue</option><option>Performance</option></select>
        <button className="btn btn-outline btn-sm">PDF</button>
        <button className="btn btn-outline btn-sm">Excel</button>
        <button className="btn btn-outline btn-sm">CSV</button>
      </div>
      <DataTable columns={reportColumns} rows={adminReports} />
    </PageShell>
  );
}

export function AdminNotificationsPage() {
  return (
    <PageShell title="Notification Center" description="Approve requests and send operational notifications." actions={<button className="btn btn-primary btn-sm"><Send size={14} /> Send System Announcement</button>}>
      <KpiStrip items={[
        { label: "Approve Requests", value: "2", icon: CheckCircle2 },
        { label: "Audit Reminder", value: "6", icon: CalendarDays },
        { label: "Maintenance Notification", value: "1", icon: Settings },
        { label: "Password Reset Notification", value: "4", icon: KeyRound },
        { label: "Company Approval Notification", value: "3", icon: Bell },
      ]} />
      <DataTable columns={[
        { key: "title", header: "Notification" },
        { key: "type", header: "Type" },
        { key: "time", header: "Time" },
        { key: "status", header: "Status", render: (n: AdminNotification) => <StatusBadge value={n.status} /> },
      ]} rows={adminNotifications} />
    </PageShell>
  );
}

export function AdminSystemLogsPage() {
  return (
    <PageShell title="System Logs" description="Trace user actions across modules with search, filters, and pagination." actions={<TableToolbar search="Search logs" />}>
      <DataTable columns={[
        { key: "timestamp", header: "Timestamp" },
        { key: "user", header: "User" },
        { key: "role", header: "Role" },
        { key: "module", header: "Module" },
        { key: "action", header: "Action" },
        { key: "ipAddress", header: "IP Address" },
        { key: "status", header: "Status", render: (l: SystemLog) => <StatusBadge value={l.status} /> },
      ]} rows={systemLogs} />
    </PageShell>
  );
}

export function AdminAiInsightsPage() {
  return (
    <PageShell title="AI Insights" description="Analytics and recommendations for risk, performance, and audit outcomes." actions={<button className="btn btn-primary btn-sm"><Sparkles size={14} /> Refresh Insights</button>}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {insightCards.map((insight) => (
          <div key={insight.title} className="card" style={{ padding: "1.25rem" }}>
            <p className="kpi-label">{insight.title}</p>
            <p className="kpi-value" style={{ fontSize: "1.35rem" }}>{insight.value}</p>
            <p className="kpi-hint">{insight.detail}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function AdminSettingsPage() {
  return (
    <PageShell title="Settings" description="General application settings, security controls, and backup tools.">
      <div style={cardGrid}>
        <AdminCard title="General">
          <div style={{ display: "grid", gap: "1rem" }}>
            {["Application Name", "Logo", "Theme", "Language", "Timezone"].map((label) => (
              <div className="field-group" key={label}>
                <label className="label">{label}</label>
                <input className="input" defaultValue={label === "Application Name" ? "AuditOne" : ""} placeholder={label} />
              </div>
            ))}
          </div>
        </AdminCard>
        <AdminCard title="Security">
          <div style={{ display: "grid", gap: "1rem" }}>
            <div className="field-group"><label className="label">Password Policy</label><select className="input"><option>Strong</option><option>Standard</option></select></div>
            <div className="field-group"><label className="label">Session Timeout</label><input className="input" defaultValue="30 minutes" /></div>
            <div className="field-group"><label className="label">2FA</label><select className="input"><option>Enabled</option><option>Disabled</option></select></div>
            <div className="field-group"><label className="label">Login Attempts</label><input className="input" defaultValue="5" /></div>
          </div>
        </AdminCard>
        <AdminCard title="Database Backup">
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-sm">Create Backup</button>
            <button className="btn btn-outline btn-sm">Restore Backup</button>
          </div>
        </AdminCard>
      </div>
    </PageShell>
  );
}

export function AdminProfilePage() {
  const user = getMockUser();
  return (
    <PageShell title="Admin Profile" description="Profile, contact information, activity history, and password controls." actions={<button className="btn btn-outline btn-sm" onClick={() => signOutMock()}>Logout</button>}>
      <div style={cardGrid}>
        <AdminCard title="Profile">
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>AA</div>
            <div className="field-group"><label className="label">Name</label><input className="input" defaultValue={user?.name ?? "AuditOne Admin"} /></div>
            <div className="field-group"><label className="label">Email</label><input className="input" defaultValue={user?.email ?? "admin@auditone.com"} /></div>
            <div className="field-group"><label className="label">Phone</label><input className="input" defaultValue="+91 98765 43210" /></div>
            <div className="field-group"><label className="label">Role</label><input className="input" readOnly defaultValue="Admin" /></div>
            <button className="btn btn-primary btn-sm" style={{ width: "fit-content" }}>Change Password</button>
          </div>
        </AdminCard>
        <AdminCard title="Activity History">
          <DataTable columns={[
            { key: "timestamp", header: "Timestamp" },
            { key: "module", header: "Module" },
            { key: "action", header: "Action" },
            { key: "status", header: "Status", render: (l: SystemLog) => <StatusBadge value={l.status} /> },
          ]} rows={systemLogs.slice(0, 3)} />
        </AdminCard>
      </div>
    </PageShell>
  );
}

export function AuditorDashboardPage() {
  return (
    <PageShell title="Auditor Dashboard" description="Auditor audit assignments and scan progress.">
      <KpiStrip items={[
        { label: "Current Audits", value: "2", icon: ClipboardList },
        { label: "Completed Audits", value: "38", icon: CheckCircle2 },
        { label: "Performance", value: "96%", icon: Activity },
      ]} />
      <DataTable columns={auditColumns.slice(0, 7)} rows={adminAudits.filter((a) => a.auditor === "Jane Smith")} />
    </PageShell>
  );
}
