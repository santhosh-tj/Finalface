import axios from "axios";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000") + "/api";

export const api = axios.create({
  baseURL: baseURL.startsWith("http")
    ? baseURL
    : `${window.location.origin}${baseURL}`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  registerFace: (formData) => api.post("/auth/register-face", formData),
  registerFaceBase64: (base64) =>
    api.post("/auth/register-face", { image: base64 }),
  registerFaceBatch: (images, studentId) =>
    api.post("/face/register-batch", {
      images,
      student_id: studentId,
    }),
};

export const adminApi = {
  listFaculty: () => api.get("/admin/faculty"),
  createFaculty: (data) => api.post("/admin/faculty", data),
  updateFaculty: (id, data) => api.put(`/admin/faculty/${id}`, data),
  deleteFaculty: (id) => api.delete(`/admin/faculty/${id}`),
  listStudents: () => api.get("/admin/students"),
  createStudent: (data) => api.post("/admin/students", data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.patch("/admin/settings", data),
  reports: () => api.get("/admin/reports"),
};

export const facultyApi = {
  listSessions: () => api.get("/faculty/sessions"),
  createSession: (data) => api.post("/faculty/sessions", data),
  getSession: (id) => api.get(`/faculty/sessions/${id}`),
  endSession: (id) => api.post(`/faculty/sessions/${id}/end`),
  sessionAttendance: (id) => api.get(`/faculty/sessions/${id}/attendance`),
};

export const studentApi = {
  me: () => api.get("/student/me"),
  registerStudentFace: (studentId, formData) => {
    const fd = new FormData();
    fd.append("image", formData.get("image"));
    fd.append("studentId", studentId);
    return api.post("/student/register-face", fd);
  },
  registerStudentFacePayload: (studentId, base64) =>
    api.post("/student/register-face", { studentId, image: base64 }),
};

export const sessionsApi = {
  active: () => api.get("/sessions/active"),
};

export const attendanceApi = {
  list: (params) => api.get("/attendance", { params }),
  mark: (data) => api.post("/attendance/mark", data),
};

export const faceApi = {
  verify: (formData) => api.post("/face/verify", formData),
  verifyPayload: (payload) => api.post("/face/verify", payload),
};
