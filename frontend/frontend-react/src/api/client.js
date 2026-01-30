import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 🔒 Only logout on INVALID / EXPIRED token
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    // ❗ 403 = forbidden action (DO NOT LOGOUT)
    return Promise.reject(err);
  }
);

export default api;
