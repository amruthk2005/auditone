import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { DataTable, type Column } from "@/components/data-table";
import { reports as initialMockReports } from "@/lib/mock-data";
import { Download, FileText, Plus, X, Loader2, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReports, generateReportApi, getReportDownloadUrl } from "@/lib/api";

type ReportItem = {
  id: number;
  name: string;
  type: string;
  generatedAt: string;
  format: string;
};

const formatTint: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "#ffe4e6", color: "#b91c1c" },
  XLSX: { bg: "#d1fae5", color: "#047857" },
  CSV: { bg: "#e0f2fe", color: "#0369a1" },
};

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("Finance");
  const [reportFormat, setReportFormat] = useState("CSV");

  // Fetch reports from backend or fallback to initial mock list
  const { data: apiReports, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  const displayReports: ReportItem[] = apiReports && Array.isArray(apiReports) ? apiReports : initialMockReports;

  const generateMutation = useMutation({
    mutationFn: () => generateReportApi(reportName || "Asset Valuation Report", reportType, reportFormat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setShowModal(false);
      setReportName("");
    },
  });

  const handleDownload = (r: ReportItem) => {
    const url = getReportDownloadUrl(r.id, r.format);
    const ext = r.format.toLowerCase();
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.setAttribute("download", `${r.name.replace(/\s+/g, "_")}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cols: Column<ReportItem>[] = [
    {
      key: "name",
      header: "Report Name",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.375rem", background: "rgba(109,40,217,0.1)", color: "var(--primary)" }}>
            <FileText size={14} />
          </span>
          <span style={{ fontWeight: 500 }}>{r.name}</span>
        </div>
      ),
    },
    { key: "type", header: "Type", render: (r) => <span style={{ background: "rgba(109,40,217,0.1)", color: "var(--primary)", padding: "0.125rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}>{r.type}</span> },
    { key: "generatedAt", header: "Generated Date" },
    {
      key: "format",
      header: "Format",
      render: (r) => {
        const t = formatTint[r.format] ?? { bg: "var(--muted)", color: "var(--foreground)" };
        return <span style={{ background: t.bg, color: t.color, padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500 }}>{r.format}</span>;
      },
    },
    {
      key: "id",
      header: "Action",
      render: (r) => (
        <button
          className="btn btn-outline btn-sm"
          onClick={() => handleDownload(r)}
          style={{ gap: "0.375rem" }}
        >
          <Download size={13} /> Download
        </button>
      ),
    },
  ];

  return (
    <>
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
          }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: "var(--card, #1a0d2e)", border: "1px solid rgba(109,40,217,0.25)", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: "460px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={18} color="var(--primary)" /> Generate New Report
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div className="field-group">
                <label className="label">Report Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Q4 Financial Valuation"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="label">Report Type</label>
                <select className="input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="Finance">Finance & Valuation</option>
                  <option value="Asset">Asset Inventory</option>
                  <option value="Audit">Audit Compliance</option>
                </select>
              </div>

              <div className="field-group">
                <label className="label">Format</label>
                <select className="input" value={reportFormat} onChange={(e) => setReportFormat(e.target.value)}>
                  <option value="CSV">CSV (Spreadsheet)</option>
                  <option value="XLSX">Excel (.xlsx)</option>
                  <option value="PDF">PDF Document</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                style={{ justifyContent: "center", marginTop: "0.5rem" }}
                disabled={generateMutation.isPending}
                onClick={() => generateMutation.mutate()}
              >
                {generateMutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : <><Download size={15} /> Generate & Save Report</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <PageShell
        title="Reports"
        description="Exported asset, audit, and finance reports."
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Generate report
          </button>
        }
      >
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted-foreground)" }}>
            Loading reports list...
          </div>
        ) : (
          <DataTable columns={cols} rows={displayReports} rowKey={(r) => r.id} />
        )}
      </PageShell>
    </>
  );
}
