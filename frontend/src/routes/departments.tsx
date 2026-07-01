import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { Plus, Users, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDepartments } from "@/lib/api";

type Department = {
  dept_id: number;
  company_id: number;
  department_name: string;
};

const cols: Column<Department>[] = [
  { key: "dept_id", header: "ID", render: (d) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--primary)" }}>#{d.dept_id}</span> },
  { key: "department_name", header: "Department Name" },
  { key: "company_id", header: "Company ID" },
];

export function DepartmentsPage() {
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  return (
    <PageShell
      title="Departments"
      description="Manage organizational departments."
      actions={
        <button className="btn btn-primary btn-sm">
          <Plus size={15} /> Add Department
        </button>
      }
    >
      <KpiStrip
        items={[
          { label: "Total Departments", value: String(departments.length), icon: Building },
          { label: "Active", value: String(departments.length), icon: Users },
        ]}
      />
      {isLoading ? <p>Loading...</p> : <DataTable columns={cols} rows={departments} />}
    </PageShell>
  );
}
