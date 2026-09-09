const API_URL = import.meta.env.VITE_API_URL || "https://lld-practice-platform-beta.vercel.app/api"; // Default to production URL if not set

function getToken() {
  return localStorage.getItem("lld_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("lld_token", token);
  else localStorage.removeItem("lld_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }

  return body.data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  listProblems: () => request("/problems"),
  getProblem: (id) => request(`/problems/${id}`),

  startAttempt: (problemId) =>
    request("/attempts", { method: "POST", body: JSON.stringify({ problemId }) }),
  listAttempts: () => request("/attempts"),
  getAttempt: (id) => request(`/attempts/${id}`),
  saveDraft: (id, submission) =>
    request(`/attempts/${id}`, { method: "PUT", body: JSON.stringify(submission) }),
  submitAttempt: (id) => request(`/attempts/${id}/submit`, { method: "POST" }),
  retryAttempt: (id) => request(`/attempts/${id}/retry`, { method: "POST" }),

  getEvaluation: (attemptId) => request(`/evaluations/${attemptId}`),
  submitEvaluation: (attemptId, payload) =>
    request(`/evaluations/${attemptId}`, { method: "POST", body: JSON.stringify(payload) }),

  listAdminAttempts: () => request("/admin/attempts"),
  getAdminAttempt: (id) => request(`/admin/attempts/${id}`),
  listPendingReviews: () => request("/admin/reviews/pending"),
  listCompletedReviews: () => request("/admin/reviews/completed"),
};
