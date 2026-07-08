import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { getMockUser } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { AuditorDashboard } from "@/components/dashboards/AuditorDashboard";
import { CompanyDashboard } from "@/components/dashboards/CompanyDashboard";
import { Plus, Download } from "lucide-react";

export function DashboardPage() {
  const user = getMockUser();
  const role = user?.role?.toLowerCase() || "admin";

  let DashboardContent = AdminDashboard;
  let title = "Dashboard";
  let description = "An overview of your system health, registered companies, and users.";
  let actions = null;

  if (role === "auditor") {
    DashboardContent = AuditorDashboard;
    title = "Auditor Workspace";
    description = "Conduct audits, scan assets, and track inventory discrepancies.";
    actions = (
      <>
        <Link to="/reports" className="btn btn-outline btn-sm">
          <Download size={14} /> Export Reports
        </Link>
      </>
    );
  } else if (role === "company" || role === "companyuser" || role === "company_user") {
    DashboardContent = CompanyDashboard;
    title = "Company Operations";
    description = "Manage your product catalog, stock inventory, and asset valuations.";
    actions = (
      <>
        <Link to="/products" className="btn btn-primary btn-sm">
          <Plus size={14} /> View All Products
        </Link>
      </>
    );
  } else {
    actions = (
      <Link to="/audits" className="btn btn-primary btn-sm">
        <Plus size={14} /> New Audit
      </Link>
    );
  }

  return (
    <PageShell
      title={title}
      description={description}
      actions={actions}
    >
      <DashboardContent />
    </PageShell>
  );
}
