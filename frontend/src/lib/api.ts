// API Client for StackSync Console

const API_BASE = typeof window !== "undefined" 
  ? (process.env.NEXT_PUBLIC_API_URL || "")
  : "http://127.0.0.1:8000";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("miniaws_token");
};

export const setStoredToken = (token: string | null) => {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("miniaws_token", token);
    } else {
      localStorage.removeItem("miniaws_token");
    }
  }
};

export const getStoredUser = (): any | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("miniaws_user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any | null) => {
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem("miniaws_user", JSON.stringify(user));
      if (user.id) localStorage.setItem("miniaws_user_id", user.id);
    } else {
      localStorage.removeItem("miniaws_user");
      localStorage.removeItem("miniaws_user_id");
    }
  }
};

export const getStoredUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("miniaws_user_id");
};

export const setStoredUserId = (userId: string | null) => {
  if (typeof window !== "undefined") {
    if (userId) {
      localStorage.setItem("miniaws_user_id", userId);
    } else {
      localStorage.removeItem("miniaws_user_id");
    }
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("miniaws_token") || localStorage.getItem("miniaws_user_id"));
};

const getHeaders = (extraHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = {
    ...extraHeaders,
  };
  const userId = getStoredUserId();
  if (userId) {
    headers["X-User-Id"] = userId;
  }
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders((options.headers as Record<string, string>) || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      const isAuthPath = window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/register");
      if (!isAuthPath) {
        // Clear expired token and redirect to login
        setStoredToken(null);
        setStoredUser(null);
        window.location.href = "/login";
      }
    }
    let errorDetail = "API Request failed";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

// 1. Dashboard
export const getDashboardSummary = () => fetchApi<any>("/api/dashboard/summary");

// 2. Storage
export const listFiles = () => fetchApi<any[]>("/api/storage/files");
export const deleteFile = (fileId: string) => 
  fetchApi<any>(`/api/storage/delete/${fileId}`, { method: "DELETE" });
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/storage/upload`, {
    method: "POST",
    headers: {
      "X-User-Id": getStoredUserId(),
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
};

// 3. Websites
export const listWebsites = () => fetchApi<any[]>("/api/websites");
export const createWebsite = (data: {
  subdomain: string;
  site_name: string;
  description?: string;
  html_content: string;
  css_content?: string;
  js_content?: string;
}) => fetchApi<any>("/api/websites/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
export const getWebsiteSource = (siteId: string) => 
  fetchApi<{ site_id: string; html: string; css: string; js: string }>(`/api/websites/${siteId}/source`);
export const updateWebsite = (siteId: string, data: any) => 
  fetchApi<any>(`/api/websites/${siteId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const updateWebsiteDomain = (siteId: string, data: { subdomain: string; custom_domain?: string; site_name?: string; description?: string }) =>
  fetchApi<any>(`/api/websites/${siteId}/domain`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const deleteWebsite = (siteId: string) => 
  fetchApi<any>(`/api/websites/${siteId}`, { method: "DELETE" });

// 4. Functions
export const listFunctions = () => fetchApi<any[]>("/api/functions");
export const getFunction = (funcId: string) => fetchApi<any>(`/api/functions/${funcId}`);
export const createFunction = (data: any) => fetchApi<any>("/api/functions/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
export const updateFunction = (funcId: string, data: any) => 
  fetchApi<any>(`/api/functions/${funcId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const testRunFunction = (funcId: string, payload: any) => 
  fetchApi<any>(`/api/functions/${funcId}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
export const deleteFunction = (funcId: string) => 
  fetchApi<any>(`/api/functions/${funcId}`, { method: "DELETE" });

// 5. API Gateway
export const listApiRoutes = () => fetchApi<any[]>("/api/gateway/routes");
export const createApiRoute = (data: any) => fetchApi<any>("/api/gateway/routes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
export const deleteApiRoute = (routeId: string) => 
  fetchApi<any>(`/api/gateway/routes/${routeId}`, { method: "DELETE" });

// 6. Monitoring
export const getExecutionLogs = (params?: { function_id?: string; status_filter?: string; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.function_id) query.append("function_id", params.function_id);
  if (params?.status_filter) query.append("status_filter", params.status_filter);
  if (params?.limit) query.append("limit", params.limit.toString());
  return fetchApi<any[]>(`/api/monitoring/logs?${query.toString()}`);
};
export const getMonitoringStats = () => fetchApi<any>("/api/monitoring/stats");
export const getChartData = () => fetchApi<any>("/api/monitoring/chart_data");
export const getSystemTiers = () => fetchApi<any>("/api/monitoring/system_tiers");

// 7. Users / Switcher
export const listUsers = () => fetchApi<any[]>("/api/auth/users");

// 8. Authentication
export const loginUser = async (credentials: { email: string; password: string }) => {
  const data = await fetchApi<{ access_token: string; token_type: string; user: any }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
    setStoredUser(data.user);
    if (data.user?.id) setStoredUserId(data.user.id);
  }
  return data;
};

export const registerUser = async (formData: {
  email: string;
  password: string;
  full_name: string;
}) => {
  const data = await fetchApi<{ access_token: string; token_type: string; user: any }>("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
    setStoredUser(data.user);
    if (data.user?.id) setStoredUserId(data.user.id);
  }
  return data;
};

export const getCurrentUser = () => fetchApi<any>("/api/auth/me");

export const logoutUser = () => {
  setStoredToken(null);
  setStoredUser(null);
  setStoredUserId(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("miniaws_token");
    localStorage.removeItem("miniaws_user");
    localStorage.removeItem("miniaws_user_id");
    window.location.href = "/login";
  }
};

// 7. EC2 Cloud Instances & RDP
export const getEC2Instances = () => fetchApi<any>("/api/instances");
export const getRdpDownloadUrl = (instanceId: string) => `${API_BASE}/api/instances/${instanceId}/rdp`;
export const getAdminStats = () => fetchApi<any>("/api/admin/stats");
