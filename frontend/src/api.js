const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  // subjects
  getSubjects: () => request("/subjects"),
  getSubject: (key) => request(`/subjects/${key}`),

  // teacher auth
  teacherSignup: (payload) => request("/teachers/signup", { method: "POST", body: payload }),
  teacherLogin: (payload) => request("/teachers/login", { method: "POST", body: payload }),

  // classes
  createClass: (name, token) => request("/classes", { method: "POST", body: { name }, token }),
  myClasses: (token) => request("/classes/mine", { token }),
  getClass: (id, token) => request(`/classes/${id}`, { token }),
  joinClass: (payload) => request("/classes/join", { method: "POST", body: payload }),

  // questions
  nextQuestion: (params) => request(`/questions/next?${new URLSearchParams(params)}`),
  diagnosticSet: (params) => request(`/questions/diagnostic?${new URLSearchParams(params)}`),
  addQuestion: (payload, token) => request("/questions", { method: "POST", body: payload, token }),
  checkQuestion: (id, selectedIndex) => request(`/questions/${id}/check`, { method: "POST", body: { answerIndex: selectedIndex } }),

  // attempts
  submitAttempt: (payload) => request("/attempts", { method: "POST", body: payload }),

  // diagnostics
  submitDiagnostic: (payload) => request("/diagnostics", { method: "POST", body: payload }),

  // lessons
  getLessons: (params) => request(`/lessons?${new URLSearchParams(params)}`),

  // students
  getStudent: (id) => request(`/students/${id}`),
};
