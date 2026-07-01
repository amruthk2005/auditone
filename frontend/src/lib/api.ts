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
