import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("manofox_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatApiError(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || "").filter(Boolean).join(" ");
  return error?.message || "Something went wrong";
}

export default api;
