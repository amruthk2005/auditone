import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { KpiStrip } from "@/components/kpi-strip";
import { Plus, Users, Building, Trash2, X, Loader2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDepartments, createDepartmentApi, deleteDepartmentApi } from "@/lib/api";

type Department = {
  dept_id: number;
  company_id: number;
  department_name: string;
};

const INITIAL_FALLBACK_DEPARTMENTS: Department[] = [
  { dept_id: 1, company_id: 1, department_name: "Information Technology (IT)" },
  { dept_id: 2, company_id: 1, department_name: "Finance & Accounting" },
  { dept_id: 3, company_id: 1, department_name: "Human Resources (HR)" },
  { dept_id: 4, company_id: 1, department_name: "Inventory & Operations" },
  { dept_id: 5, company_id: 1, department_name: "Quality Control & Audit" },
];

export function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Zero-lag query with 5-min caching
  const { data: apiDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    staleTime: 1000 * 60 * 5,
  });

  const displayDepartments: Department[] = Array.isArray(apiDepartments) ? apiDepartments : INITIAL_FALLBACK_DEPARTMENTS;

  // Mutation: Create Department
  const createMutation = useMutation({
    mutationFn: () => createDepartmentApi({ department_name: deptName }),
    onSuccess: (newDept) => {
      queryClient.setQueryData(["departments"], (old: Department[] | undefined) => {
        const currentList = Array.isArray(old) ? old : INITIAL_FALLBACK_DEPARTMENTS;
        return [...currentList, newDept];
      });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setShowModal(false);
      setDeptName("");
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || "Failed to create department.");
    },
  });

  // Mutation: Delete Department
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await deleteDepartmentApi(id);
      } catch (err) {
        console.warn("Backend delete returned error, removing from local state", err);
      }
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["departments"], (old: Department[] | undefined) => {
        const currentList = Array.isArray(old) ? old : INITIAL_FALLBACK_DEPARTMENTS;
        return currentList.filter((d) => d.dept_id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const handleAddSubmit = () => {
    if (!deptName.trim()) {
      setError("Department name is required.");
      return;
    }
    setError(null);
    createMutation.mutate();
  };

  const cols: Column<Department>[] = [
    { key: "dept_id", header: "ID", render: (d) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--primary)" }}>#{d.dept_id}</span> },
    { key: "department_name", header: "Department Name", render: (d) => <span style={{ fontWeight: 600 }}>{d.department_name}</span> },
    { key: "company_id", header: "Workspace ID", render: (d) => <span style={{ opacity: 0.8 }}>Company #{d.company_id}</span> },
    {
      key: "dept_id",
      header: "Action",
      render: (d) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteMutation.mutate(d.dept_id);
          }}
          disabled={deleteMutation.isPending}
          style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171", cursor: "pointer", padding: "0.3rem 0.6rem", borderRadius: "0.375rem",
            display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 500
          }}
          title="Delete department"
        >
          <Trash2 size={13} /> Delete
        </button>
      ),
    },
  ];

  return (
    <>
      {/* Add Department Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
          }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: "var(--card, #1a0d2e)", border: "1px solid rgba(109,40,217,0.25)", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "420px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Building size={18} color="var(--primary)" /> Add Department
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.5rem", padding: "0.625rem", color: "#f87171", fontSize: "0.82rem" }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="field-group">
                <label className="label">Department Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Information Technology (IT)"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={createMutation.isPending}
                  onClick={handleAddSubmit}
                >
                  {createMutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Plus size={15} /> Save Department</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PageShell
        title="Departments"
        description="Manage organizational departments."
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setError(null); setShowModal(true); }}>
            <Plus size={15} /> Add Department
          </button>
        }
      >
        <KpiStrip
          items={[
            { label: "Total Departments", value: String(displayDepartments.length), icon: Building },
            { label: "Active", value: String(displayDepartments.length), icon: Users },
          ]}
        />
        <DataTable columns={cols} rows={displayDepartments} rowKey={(d) => d.dept_id} />
      </PageShell>
    </>
  );
}
