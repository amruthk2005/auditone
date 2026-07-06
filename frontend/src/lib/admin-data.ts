export const adminCompanies = [
  {
    id: "co-001",
    companyName: "Acme Corp",
    industry: "Manufacturing",
    adminName: "Riya Mehta",
    email: "riya@acme.com",
    phone: "+91 98765 43210",
    products: 480,
    audits: 18,
    status: "Active",
    createdDate: "2024-01-12",
  },
  {
    id: "co-002",
    companyName: "Globex Solutions",
    industry: "Technology",
    adminName: "Aarav Shah",
    email: "aarav@globex.com",
    phone: "+91 98765 43211",
    products: 220,
    audits: 9,
    status: "Pending Approval",
    createdDate: "2024-05-04",
  },
  {
    id: "co-003",
    companyName: "Initech",
    industry: "Finance",
    adminName: "Meera Nair",
    email: "meera@initech.com",
    phone: "+91 98765 43212",
    products: 95,
    audits: 6,
    status: "Suspended",
    createdDate: "2023-11-20",
  },
  {
    id: "co-004",
    companyName: "Umbrella Ltd",
    industry: "Retail",
    adminName: "Kabir Rao",
    email: "kabir@umbrella.com",
    phone: "+91 98765 43213",
    products: 1200,
    audits: 27,
    status: "Active",
    createdDate: "2023-09-18",
  },
];

export const adminAuditors = [
  { id: "audr-001", name: "Jane Smith", employeeId: "EMP-1042", email: "jane@auditone.com", phone: "+91 90000 11111", assignedCompany: "Acme Corp", currentAudits: 2, completedAudits: 38, performance: "96%", status: "Active" },
  { id: "audr-002", name: "John Doe", employeeId: "EMP-1043", email: "john@auditone.com", phone: "+91 90000 11112", assignedCompany: "Umbrella Ltd", currentAudits: 1, completedAudits: 31, performance: "91%", status: "Active" },
  { id: "audr-003", name: "Sarah Lee", employeeId: "EMP-1044", email: "sarah@auditone.com", phone: "+91 90000 11113", assignedCompany: "Globex Solutions", currentAudits: 3, completedAudits: 24, performance: "88%", status: "Inactive" },
  { id: "audr-004", name: "Mike Johnson", employeeId: "EMP-1045", email: "mike@auditone.com", phone: "+91 90000 11114", assignedCompany: "Initech", currentAudits: 0, completedAudits: 19, performance: "84%", status: "Active" },
];

export const adminAudits = [
  { id: "AUD-2024-0518", company: "Acme Corp", auditor: "Jane Smith", scheduledDate: "2024-05-18", completion: 78, priority: "High", status: "Running" },
  { id: "AUD-2024-0519", company: "Umbrella Ltd", auditor: "John Doe", scheduledDate: "2024-05-21", completion: 100, priority: "Medium", status: "Completed" },
  { id: "AUD-2024-0520", company: "Globex Solutions", auditor: "Sarah Lee", scheduledDate: "2024-05-24", completion: 34, priority: "High", status: "Running" },
  { id: "AUD-2024-0521", company: "Initech", auditor: "Mike Johnson", scheduledDate: "2024-05-26", completion: 0, priority: "Low", status: "Cancelled" },
];

export const adminReports = [
  { id: "rep-a1", name: "Company Approval Summary", section: "Company Reports", company: "All", auditor: "All", date: "2024-05-20", status: "Ready", category: "Company", format: "PDF" },
  { id: "rep-a2", name: "Audit Completion Export", section: "Audit Reports", company: "Acme Corp", auditor: "Jane Smith", date: "2024-05-18", status: "Ready", category: "Audit", format: "Excel" },
  { id: "rep-a3", name: "Inventory Valuation Snapshot", section: "Valuation Reports", company: "Umbrella Ltd", auditor: "All", date: "2024-05-16", status: "Queued", category: "Valuation", format: "CSV" },
  { id: "rep-a4", name: "Auditor Performance Review", section: "Performance Reports", company: "All", auditor: "John Doe", date: "2024-05-15", status: "Ready", category: "Performance", format: "PDF" },
];

export const adminNotifications = [
  { id: "nt-001", title: "Globex Solutions is waiting for approval", type: "Company Approval Notification", time: "May 20, 2024 09:15 AM", status: "Open" },
  { id: "nt-002", title: "Audit reminder sent to Jane Smith", type: "Audit Reminder", time: "May 19, 2024 03:10 PM", status: "Sent" },
  { id: "nt-003", title: "Maintenance window scheduled", type: "Maintenance Notification", time: "May 18, 2024 06:00 PM", status: "Scheduled" },
  { id: "nt-004", title: "Password reset issued for company admin", type: "Password Reset Notification", time: "May 17, 2024 12:32 PM", status: "Sent" },
];

export const systemLogs = [
  { id: "log-001", timestamp: "2024-05-20 09:15:24", user: "AuditOne Admin", role: "Admin", module: "Company Management", action: "Approved company", ipAddress: "103.21.244.11", status: "Success" },
  { id: "log-002", timestamp: "2024-05-20 08:45:02", user: "Jane Smith", role: "Auditor", module: "Audit Management", action: "Uploaded scan batch", ipAddress: "103.21.244.12", status: "Success" },
  { id: "log-003", timestamp: "2024-05-19 18:04:31", user: "Riya Mehta", role: "Company", module: "Reports", action: "Downloaded report", ipAddress: "103.21.244.13", status: "Success" },
  { id: "log-004", timestamp: "2024-05-19 16:20:10", user: "Unknown", role: "Guest", module: "Authentication", action: "Failed login", ipAddress: "103.21.244.14", status: "Failed" },
];

export const registrationTrend = [
  { month: "Jan", companies: 4 },
  { month: "Feb", companies: 6 },
  { month: "Mar", companies: 9 },
  { month: "Apr", companies: 13 },
  { month: "May", companies: 17 },
  { month: "Jun", companies: 21 },
];

export const auditStatusChart = [
  { name: "Running", value: 12, color: "#7c3aed" },
  { name: "Completed", value: 48, color: "#16a34a" },
  { name: "Cancelled", value: 3, color: "#dc2626" },
];

export const auditorPerformanceChart = [
  { name: "Jane", score: 96 },
  { name: "John", score: 91 },
  { name: "Sarah", score: 88 },
  { name: "Mike", score: 84 },
];

export const companyDistributionChart = [
  { industry: "Manufacturing", count: 8 },
  { industry: "Technology", count: 6 },
  { industry: "Retail", count: 5 },
  { industry: "Finance", count: 3 },
];

export const adminActivities = [
  { event: "Company approved", target: "Acme Corp", owner: "AuditOne Admin", time: "May 20, 2024 09:15 AM" },
  { event: "Auditor assigned", target: "Jane Smith to Globex", owner: "AuditOne Admin", time: "May 20, 2024 08:55 AM" },
  { event: "Audit completed", target: "AUD-2024-0519", owner: "John Doe", time: "May 19, 2024 04:05 PM" },
];

export const insightCards = [
  { title: "Companies with Highest Mismatches", value: "Umbrella Ltd", detail: "142 mismatches across retail inventory" },
  { title: "Top Performing Auditors", value: "Jane Smith", detail: "96% completion quality score" },
  { title: "Most Delayed Audits", value: "Globex Solutions", detail: "Average delay of 3.4 days" },
  { title: "Inventory Risk Analysis", value: "High", detail: "Electronics and mobile assets need review" },
  { title: "Audit Completion Prediction", value: "92%", detail: "Likely completion before month end" },
  { title: "AI Recommendations", value: "Reassign 2 audits", detail: "Balance workload across active auditors" },
];
