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
  const { data } = await api.get("/products");
  return data;
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
  const { data } = await api.get("/audits");
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
  const { data } = await api.get("/departments");
  return data;
};

export const fetchVendors = async () => {
  const { data } = await api.get("/vendors");
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

export const validateQrCode = async (qrCode: string) => {
  const { data } = await api.post(`/qr/validate?qr_code=${encodeURIComponent(qrCode)}`);
  return data;
};

export const getQrImageUrl = (qrId: number) =>
  `http://localhost:8000/api/v1/qr/image/${qrId}`;

// ── Chat Module APIs ──────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number;
  audit_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message_type: string;
  content: string;
  file_name?: string | null;
  file_size?: number | null;
  status: string;
  created_at: string;
}

export interface Conversation {
  audit_id: number;
  audit_name: string;
  audit_status: string;
  company_id: number;
  company_name: string;
  auditor_name: string;
  completion_percentage: number;
  last_message?: string | null;
  last_updated?: string | null;
  unread_count: number;
  active: boolean;
}

export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const { data } = await api.get("/chat/conversations");
    return data;
  } catch (err) {
    console.warn("Backend chat conversations API failed, using localStorage fallback:", err);
    const user = JSON.parse(sessionStorage.getItem("auditone_user") ?? "null");
    const role = user?.role?.toLowerCase() ?? "company_user";
    
    let mockList: Conversation[] = [
      {
        audit_id: 1,
        audit_name: "Warehouse Q1 Audit",
        audit_status: "In Progress",
        company_id: 1,
        company_name: "Acme Corp",
        auditor_name: "Bob Smith",
        completion_percentage: 60,
        unread_count: 0,
        active: true,
      },
      {
        audit_id: 2,
        audit_name: "Office Inventory Check",
        audit_status: "Scheduled",
        company_id: 1,
        company_name: "Acme Corp",
        auditor_name: "Bob Smith",
        completion_percentage: 10,
        unread_count: 0,
        active: true,
      },
      {
        audit_id: 3,
        audit_name: "IT Assets Review",
        audit_status: "Scheduled",
        company_id: 1,
        company_name: "Acme Corp",
        auditor_name: "Bob Smith",
        completion_percentage: 10,
        unread_count: 0,
        active: true,
      }
    ];

    if (role === "auditor") {
      mockList = mockList.filter(c => c.auditor_name === user?.name || c.auditor_name === "Bob Smith");
    } else if (role === "company_user") {
      mockList = mockList.filter(c => c.company_id === 1);
    }

    return mockList.map(c => {
      const msgs = JSON.parse(localStorage.getItem(`auditone_chat_msgs_${c.audit_id}`) ?? "[]") as ChatMessage[];
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        c.last_message = last.message_type === "text" ? last.content : `Shared an attachment: {last.file_name}`;
        c.last_updated = last.created_at;
        
        const otherRole = role === "company_user" ? "auditor" : "company_user";
        c.unread_count = msgs.filter(m => m.sender_role === otherRole && m.status !== "seen").length;
      } else {
        if (c.audit_id === 1) {
          const defaultMsgs: ChatMessage[] = [
            {
              id: 1,
              audit_id: 1,
              sender_id: 2,
              sender_name: "Alice Johnson",
              sender_role: "company_user",
              message_type: "text",
              content: "Hi Bob, I have uploaded the Q1 inventory sheet. Please review.",
              status: "seen",
              created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
              id: 2,
              audit_id: 1,
              sender_id: 3,
              sender_name: "Bob Smith",
              sender_role: "auditor",
              message_type: "text",
              content: "Thanks Alice. I noticed some discrepancies in the warehouse items. Let me share the remarks.",
              status: "seen",
              created_at: new Date(Date.now() - 3600000).toISOString(),
            }
          ];
          localStorage.setItem(`auditone_chat_msgs_1`, JSON.stringify(defaultMsgs));
          c.last_message = defaultMsgs[1].content;
          c.last_updated = defaultMsgs[1].created_at;
        }
      }
      return c;
    });
  }
};

export const fetchMessages = async (auditId: number): Promise<ChatMessage[]> => {
  try {
    const { data } = await api.get(`/chat/conversations/${auditId}/messages`);
    return data;
  } catch (err) {
    console.warn(`Backend fetchMessages for audit ${auditId} failed, using localStorage:`, err);
    const msgs = JSON.parse(localStorage.getItem(`auditone_chat_msgs_${auditId}`) ?? "[]") as ChatMessage[];
    
    const user = JSON.parse(sessionStorage.getItem("auditone_user") ?? "null");
    const role = user?.role?.toLowerCase() ?? "company_user";
    if (role !== "admin") {
      const otherRole = role === "company_user" ? "auditor" : "company_user";
      let updated = false;
      const newMsgs = msgs.map(m => {
        if (m.sender_role === otherRole && m.status !== "seen") {
          m.status = "seen";
          updated = true;
        }
        return m;
      });
      if (updated) {
        localStorage.setItem(`auditone_chat_msgs_${auditId}`, JSON.stringify(newMsgs));
      }
      return newMsgs;
    }
    return msgs;
  }
};

export const sendMessage = async (auditId: number, message: { content: string; message_type?: string; file_name?: string | null; file_size?: number | null }): Promise<ChatMessage> => {
  const payload = {
    audit_id: auditId,
    content: message.content,
    message_type: message.message_type ?? "text",
    file_name: message.file_name,
    file_size: message.file_size,
  };
  try {
    const { data } = await api.post(`/chat/conversations/${auditId}/messages`, payload);
    return data;
  } catch (err) {
    console.warn(`Backend sendMessage for audit ${auditId} failed, falling back to localStorage:`, err);
    const user = JSON.parse(sessionStorage.getItem("auditone_user") ?? "null");
    const role = user?.role?.toLowerCase() ?? "company_user";
    
    const msgs = JSON.parse(localStorage.getItem(`auditone_chat_msgs_${auditId}`) ?? "[]") as ChatMessage[];
    const newMsg: ChatMessage = {
      id: Date.now(),
      audit_id: auditId,
      sender_id: user?.user_id ?? 999,
      sender_name: user?.name ?? "Demo User",
      sender_role: role,
      message_type: payload.message_type,
      content: payload.content,
      file_name: payload.file_name,
      file_size: payload.file_size,
      status: "sent",
      created_at: new Date().toISOString(),
    };
    
    msgs.push(newMsg);
    localStorage.setItem(`auditone_chat_msgs_${auditId}`, JSON.stringify(msgs));

    // Update notifications list
    const notifications = JSON.parse(sessionStorage.getItem("auditone_local_notifications") ?? "[]");
    notifications.unshift({
      id: `n-chat-${Date.now()}`,
      title: `New message on Audit #${auditId}`,
      time: "Just now",
      read: false,
    });
    sessionStorage.setItem("auditone_local_notifications", JSON.stringify(notifications));

    return newMsg;
  }
};

export const uploadChatFile = async (auditId: number, file: File): Promise<{ file_url: string; file_name: string; file_size: number }> => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const { data } = await api.post(`/chat/conversations/${auditId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (err) {
    console.warn(`Backend file upload failed, simulating file upload locally:`, err);
    return {
      file_url: URL.createObjectURL(file),
      file_name: file.name,
      file_size: file.size,
    };
  }
};

export const fetchNotifications = async (): Promise<any[]> => {
  try {
    const { data } = await api.get("/notifications");
    return data;
  } catch (err) {
    console.warn("Backend notifications API failed, using local notifications state:", err);
    let localNotifs = sessionStorage.getItem("auditone_local_notifications");
    if (!localNotifs) {
      const defaultNotifs = [
        { id: "n-001", title: "Audit #AUD-001 completed successfully", time: "May 18, 2024 · 10:24 AM", read: false },
        { id: "n-002", title: "Projector Epson marked as missing", time: "May 17, 2024 · 02:32 PM", read: false },
        { id: "n-003", title: "Location mismatch detected on Monitor LG", time: "May 17, 2024 · 11:08 AM", read: true },
        { id: "n-004", title: "New audit session started by Jane Smith", time: "May 16, 2024 · 09:00 AM", read: true },
        { id: "n-005", title: "Q1 Depreciation report generated", time: "Apr 05, 2024 · 04:10 PM", read: true },
      ];
      sessionStorage.setItem("auditone_local_notifications", JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
    return JSON.parse(localNotifs);
  }
};
