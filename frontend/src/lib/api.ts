import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchProducts = async () => {
  try {
    const { data } = await api.get("/products");
    return data;
  } catch {
    return [];
  }
};

export const createProduct = async (product: {
  name: string;
  category: string;
  quantity: number;
  cost: number;
  purchase_date?: string | null;
  serial_no?: string | null;
  location?: string | null;
  vendor?: string | null;
  description?: string | null;
  status?: string;
}) => {
  const { data } = await api.post("/products", product);
  return data;
};

export const updateProduct = async (id: number, product: Partial<{
  name: string;
  category: string;
  quantity: number;
  cost: number;
  purchase_date: string | null;
  serial_no: string | null;
  location: string | null;
  vendor: string | null;
  description: string | null;
  status: string;
}>) => {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: number) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};


export const fetchAudits = async () => {
  try {
    const { data } = await api.get("/audits");
    return data;
  } catch {
    return [];
  }
};

export const createAuditApi = async (audit: {
  auditor_name: string;
  audit_date: string;
  type?: string;
  scope?: string;
  instructions?: string;
  company_id?: number;
  status?: string;
}) => {
  const { data } = await api.post("/audits", audit);
  return data;
};

export const fetchCompanies = async () => {
  const { data } = await api.get("/companies");
  return data;
};

export const fetchDashboardStats = async () => {
  const { data } = await api.get("/dashboard/stats");
  return data;
};

export const fetchDepartments = async () => {
  try {
    const { data } = await api.get("/departments");
    return data;
  } catch {
    return [];
  }
};

export const createDepartmentApi = async (dept: { department_name: string; company_id?: number }) => {
  const { data } = await api.post("/departments", dept);
  return data;
};

export const deleteDepartmentApi = async (id: number) => {
  const { data } = await api.delete(`/departments/${id}`);
  return data;
};

export const fetchVendors = async () => {
  try {
    const { data } = await api.get("/vendors");
    return data;
  } catch {
    return [];
  }
};

export const createVendorApi = async (vendor: {
  vendor_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  gst_number?: string;
  address?: string;
  company_id?: number;
}) => {
  const { data } = await api.post("/vendors", vendor);
  return data;
};

export const updateVendorApi = async (id: number, vendor: {
  vendor_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  gst_number?: string;
  address?: string;
  company_id?: number;
}) => {
  const { data } = await api.put(`/vendors/${id}`, vendor);
  return data;
};

export const deleteVendorApi = async (id: number) => {
  const { data } = await api.delete(`/vendors/${id}`);
  return data;
};

export const fetchQrCodes = async () => {
  const { data } = await api.get("/qr");
  return data;
};

export const generateQrCode = async (productId: number) => {
  const { data } = await api.post(`/qr/generate?product_id=${productId}`);
  return data;
};

export const generateAdvancedQrCodeApi = async (payload: {
  product_id?: number;
  generation_type?: string;
  generated_date?: string;
  batch_quantity?: number;
  location_tag?: string;
  auditor_notes?: string;
}) => {
  const { data } = await api.post("/qr/generate-advanced", payload);
  return data;
};

export const validateQrCode = async (qrCode: string) => {
  const { data } = await api.post(`/qr/validate?qr_code=${encodeURIComponent(qrCode)}`);
  return data;
};

export const generateCompanyLoginQr = async (email: string = "company@acme.com") => {
  const { data } = await api.post("/auth/qr-generate", { email });
  return data;
};

export const generateAuditorLoginQr = async (email: string = "auditor@acme.com") => {
  const { data } = await api.post("/auth/auditor-qr-generate", { email });
  return data;
};

export const generateAuditSessionQr = async (auditId: number) => {
  const { data } = await api.post(`/qr/audit-session-token?audit_id=${auditId}`);
  return data;
};

export const loginWithQrCode = async (qrCode: string) => {
  const { data } = await api.post("/auth/qr-login", { qr_code: qrCode });
  return data;
};

export const batchGenerateQrCodes = async () => {
  const { data } = await api.post("/qr/batch-generate");
  return data;
};

export const fetchReports = async () => {
  try {
    const { data } = await api.get("/finance/reports");
    return data;
  } catch {
    return null;
  }
};

export const generateReportApi = async (name: string, type: string = "Finance", format: string = "CSV") => {
  const { data } = await api.post("/finance/report/generate", { name, report_type: type, format });
  return data;
};

export const getReportDownloadUrl = (reportId: number, format: string = "CSV") =>
  `http://localhost:8000/api/v1/finance/report/download/${reportId}?fmt=${format}`;

export const getQrImageUrl = (qrId: number) =>
  `http://localhost:8000/api/v1/qr/image/${qrId}`;

export const fetchNotifications = async () => {
  try {
    const { data } = await api.get("/notifications");
    return data;
  } catch {
    return null;
  }
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.put("/notifications/read-all");
  return data;
};

export const markNotificationRead = async (id: number) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

export const deleteNotificationApi = async (id: number) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};

export const updateProfileApi = async (profile: { name?: string; email?: string; role?: string }) => {
  const { data } = await api.put("/auth/me", profile);
  return data;
};

export const updateWorkspaceApi = async (workspace: { company_name: string; industry: string; timezone: string }) => {
  const { data } = await api.put("/companies/workspace", workspace);
  return data;
};

export const fetchValuations = async () => {
  try {
    const { data } = await api.get("/finance/valuations");
    return data;
  } catch {
    return null;
  }
};

export const fetchDepreciation = async () => {
  try {
    const { data } = await api.get("/finance/depreciation");
    return data;
  } catch {
    return null;
  }
};
