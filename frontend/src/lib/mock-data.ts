// ── Audits ──────────────────────────────────────────────────────────────────
export const audits = [
  { id: "aud-001", name: "Warehouse Q1 Audit", scope: "Warehouse A", scheduledFor: "2024-03-15", status: "Completed" },
  { id: "aud-002", name: "Office Inventory Check", scope: "HQ Floor 3", scheduledFor: "2024-04-10", status: "In Progress" },
  { id: "aud-003", name: "IT Assets Review", scope: "IT Department", scheduledFor: "2024-05-01", status: "Scheduled" },
  { id: "aud-004", name: "Store Room Audit", scope: "Store Room B", scheduledFor: "2024-05-20", status: "Scheduled" },
  { id: "aud-005", name: "Factory Floor Sweep", scope: "Plant 1", scheduledFor: "2024-06-05", status: "Scheduled" },
];

// ── Products ─────────────────────────────────────────────────────────────────
export const products = [
  { id: "p-001", sku: "WM-102", name: "Wireless Mouse", category: "Peripherals", location: "Warehouse A", value: 45, status: "In Use" },
  { id: "p-002", sku: "DL-5300", name: "Laptop Dell", category: "Computing", location: "HQ Floor 3", value: 1200, status: "In Use" },
  { id: "p-003", sku: "EB-X41", name: "Projector Epson", category: "AV Equipment", location: "Meeting Rm 2", value: 780, status: "In Storage" },
  { id: "p-004", sku: "LG-24MK", name: "Monitor LG 24\"", category: "Displays", location: "HQ Floor 3", value: 320, status: "In Use" },
  { id: "p-005", sku: "HP-L401", name: "HP LaserJet Printer", category: "Printing", location: "HQ Floor 1", value: 450, status: "Maintenance" },
  { id: "p-006", sku: "CH-X2", name: "Ergonomic Chair", category: "Furniture", location: "Office Suite", value: 220, status: "In Use" },
  { id: "p-007", sku: "SK-G913", name: "Keyboard Logitech", category: "Peripherals", location: "Warehouse A", value: 120, status: "In Storage" },
];

// ── QR Codes ─────────────────────────────────────────────────────────────────
export const qrCodes = [
  { id: "qr-001", code: "QR-WM102-A1", productName: "Wireless Mouse", generatedAt: "2024-01-10", scans: 14 },
  { id: "qr-002", code: "QR-DL5300-B2", productName: "Laptop Dell", generatedAt: "2024-01-11", scans: 8 },
  { id: "qr-003", code: "QR-EBX41-C3", productName: "Projector Epson", generatedAt: "2024-01-15", scans: 3 },
  { id: "qr-004", code: "QR-LG24MK-D4", productName: "Monitor LG 24\"", generatedAt: "2024-02-01", scans: 11 },
  { id: "qr-005", code: "QR-HPL401-E5", productName: "HP LaserJet Printer", generatedAt: "2024-02-10", scans: 5 },
];

// ── Audit Sessions ───────────────────────────────────────────────────────────
export const auditSessions = [
  { id: "sess-001", auditor: "John Doe", startedAt: "2024-03-15 09:00", scanned: 120, expected: 120, status: "Completed" },
  { id: "sess-002", auditor: "Jane Smith", startedAt: "2024-04-10 10:30", scanned: 65, expected: 100, status: "In Progress" },
  { id: "sess-003", auditor: "Mike Johnson", startedAt: "2024-04-11 08:15", scanned: 0, expected: 80, status: "Scheduled" },
  { id: "sess-004", auditor: "Sarah Lee", startedAt: "2024-05-01 14:00", scanned: 34, expected: 60, status: "In Progress" },
];

// ── Scans ────────────────────────────────────────────────────────────────────
export const scans = [
  { id: "scn-001", product: "Wireless Mouse", scannedAt: "2024-03-15 09:12", result: "Match" },
  { id: "scn-002", product: "Laptop Dell", scannedAt: "2024-03-15 09:35", result: "Location Mismatch" },
  { id: "scn-003", product: "Projector Epson", scannedAt: "2024-03-15 10:00", result: "Missing" },
  { id: "scn-004", product: "Monitor LG 24\"", scannedAt: "2024-04-10 10:45", result: "Match" },
  { id: "scn-005", product: "HP LaserJet Printer", scannedAt: "2024-04-10 11:20", result: "Damaged" },
];

// ── Valuations ───────────────────────────────────────────────────────────────
export const valuations = [
  { id: "val-001", product: "Wireless Mouse", method: "FIFO", value: 42, asOf: "2024-03-31" },
  { id: "val-002", product: "Laptop Dell", method: "Straight-line", value: 1050, asOf: "2024-03-31" },
  { id: "val-003", product: "Projector Epson", method: "Replacement Cost", value: 800, asOf: "2024-03-31" },
  { id: "val-004", product: "Monitor LG 24\"", method: "Market Value", value: 295, asOf: "2024-03-31" },
];

// ── Depreciation ─────────────────────────────────────────────────────────────
export const depreciation = [
  { id: "dep-001", product: "Laptop Dell", year: 2024, opening: 1200, depreciated: 240, closing: 960 },
  { id: "dep-002", product: "Projector Epson", year: 2024, opening: 780, depreciated: 156, closing: 624 },
  { id: "dep-003", product: "HP LaserJet Printer", year: 2024, opening: 450, depreciated: 90, closing: 360 },
  { id: "dep-004", product: "Monitor LG 24\"", year: 2024, opening: 320, depreciated: 64, closing: 256 },
];

// ── Reports ──────────────────────────────────────────────────────────────────
export const reports = [
  { id: "rep-001", name: "Q1 Audit Summary", type: "Audit", generatedAt: "2024-03-31", format: "PDF" },
  { id: "rep-002", name: "Product Inventory Export", type: "Inventory", generatedAt: "2024-04-01", format: "XLSX" },
  { id: "rep-003", name: "Depreciation Schedule", type: "Finance", generatedAt: "2024-04-05", format: "XLSX" },
  { id: "rep-004", name: "Scan Activity Log", type: "Audit", generatedAt: "2024-04-10", format: "CSV" },
];

// ── Companies ────────────────────────────────────────────────────────────────
export const companies = [
  { id: "co-001", name: "Acme Corp", industry: "Manufacturing", users: 12, products: 480 },
  { id: "co-002", name: "Globex Solutions", industry: "Technology", users: 8, products: 220 },
  { id: "co-003", name: "Initech", industry: "Finance", users: 5, products: 95 },
  { id: "co-004", name: "Umbrella Ltd", industry: "Retail", users: 20, products: 1200 },
];

// ── Users ────────────────────────────────────────────────────────────────────
export const users = [
  { id: "usr-001", name: "John Doe", email: "john@acme.com", role: "Admin", status: "Active" },
  { id: "usr-002", name: "Jane Smith", email: "jane@acme.com", role: "Auditor", status: "Active" },
  { id: "usr-003", name: "Mike Johnson", email: "mike@acme.com", role: "Manager", status: "Active" },
  { id: "usr-004", name: "Sarah Lee", email: "sarah@acme.com", role: "Auditor", status: "Invited" },
  { id: "usr-005", name: "David Brown", email: "david@acme.com", role: "Auditor", status: "Disabled" },
];

// ── Notifications ────────────────────────────────────────────────────────────
export const notifications = [
  { id: "n-001", title: "Audit #AUD-0518 completed successfully", time: "May 18, 2024 · 10:24 AM", read: false },
  { id: "n-002", title: "Projector Epson marked as missing", time: "May 17, 2024 · 02:32 PM", read: false },
  { id: "n-003", title: "Location mismatch detected on Monitor LG", time: "May 17, 2024 · 11:08 AM", read: true },
  { id: "n-004", title: "New audit session started by Jane Smith", time: "May 16, 2024 · 09:00 AM", read: true },
  { id: "n-005", title: "Q1 Depreciation report generated", time: "Apr 05, 2024 · 04:10 PM", read: true },
];

// ── Dashboard Stats ──────────────────────────────────────────────────────────
export const dashboardStats = [
  { label: "Total Products", value: "8,420", delta: "+12.5%", up: true },
  { label: "Active Audits", value: "12", delta: "+9.1%", up: true },
  { label: "Pending Validation", value: "145", delta: "-4.3%", up: false },
  { label: "Stock Value", value: "$2.4M", delta: "+7.8%", up: true },
];

// ── Stock Inventory (Company User) ───────────────────────────────────────────
export type StockItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  location: string;
  expectedQty: number;
  actualQty: number;
  unitCost: number;
  status: "In Use" | "In Storage" | "Maintenance" | "Missing";
};

export const stockInventory: StockItem[] = [
  { id: "s-001", sku: "WM-102",  name: "Wireless Mouse",      category: "Peripherals",  location: "Warehouse A",  expectedQty: 50,  actualQty: 48,  unitCost: 45,   status: "In Use" },
  { id: "s-002", sku: "DL-5300", name: "Laptop Dell",          category: "Computing",    location: "HQ Floor 3",   expectedQty: 30,  actualQty: 30,  unitCost: 1200, status: "In Use" },
  { id: "s-003", sku: "EB-X41",  name: "Projector Epson",      category: "AV Equipment", location: "Meeting Rm 2", expectedQty: 5,   actualQty: 4,   unitCost: 780,  status: "In Storage" },
  { id: "s-004", sku: "LG-24MK", name: "Monitor LG 24\"",      category: "Displays",     location: "HQ Floor 3",   expectedQty: 40,  actualQty: 40,  unitCost: 320,  status: "In Use" },
  { id: "s-005", sku: "HP-L401", name: "HP LaserJet Printer",  category: "Printing",     location: "HQ Floor 1",   expectedQty: 8,   actualQty: 7,   unitCost: 450,  status: "Maintenance" },
  { id: "s-006", sku: "CH-X2",   name: "Ergonomic Chair",      category: "Furniture",    location: "Office Suite", expectedQty: 80,  actualQty: 80,  unitCost: 220,  status: "In Use" },
  { id: "s-007", sku: "SK-G913", name: "Keyboard Logitech",    category: "Peripherals",  location: "Warehouse A",  expectedQty: 60,  actualQty: 55,  unitCost: 120,  status: "In Storage" },
];

// ── Mismatch Records (Auditor) ───────────────────────────────────────────────
export type MismatchRecord = {
  id: string;
  sku: string;
  productName: string;
  location: string;
  expectedQty: number;
  actualQty: number;
  variance: number;
  type: "Quantity" | "Location" | "Missing" | "Damaged";
  auditSession: string;
  scannedAt: string;
  notes: string;
  resolved: boolean;
};

export const mismatches: MismatchRecord[] = [
  { id: "mm-001", sku: "WM-102",  productName: "Wireless Mouse",     location: "Warehouse A",  expectedQty: 50,  actualQty: 48, variance: -2,  type: "Quantity",  auditSession: "sess-001", scannedAt: "2024-03-15 09:12", notes: "", resolved: false },
  { id: "mm-002", sku: "EB-X41",  productName: "Projector Epson",    location: "Meeting Rm 2", expectedQty: 5,   actualQty: 4,  variance: -1,  type: "Missing",   auditSession: "sess-001", scannedAt: "2024-03-15 10:00", notes: "", resolved: false },
  { id: "mm-003", sku: "DL-5300", productName: "Laptop Dell",        location: "Storeroom B",  expectedQty: 30,  actualQty: 30, variance: 0,   type: "Location",  auditSession: "sess-002", scannedAt: "2024-04-10 10:45", notes: "Found in wrong room", resolved: false },
  { id: "mm-004", sku: "HP-L401", productName: "HP LaserJet Printer",location: "HQ Floor 1",   expectedQty: 8,   actualQty: 7,  variance: -1,  type: "Damaged",   auditSession: "sess-002", scannedAt: "2024-04-10 11:20", notes: "Unit has cracked casing", resolved: true },
  { id: "mm-005", sku: "SK-G913", productName: "Keyboard Logitech",  location: "Warehouse A",  expectedQty: 60,  actualQty: 55, variance: -5,  type: "Quantity",  auditSession: "sess-004", scannedAt: "2024-05-01 14:30", notes: "", resolved: false },
];
