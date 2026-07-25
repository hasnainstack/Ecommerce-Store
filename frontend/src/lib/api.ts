const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper: get auth token from local storage
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("auth-storage");
  if (!stored) return null;
  try {
    const { state } = JSON.parse(stored);
    return state.accessToken ?? null;
  } catch {
    return null;
  }
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const stored = localStorage.getItem("auth-storage");
  if (!stored) return null;
  const { state } = JSON.parse(stored);
  if (!state.refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: state.refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const newState = { ...state, accessToken: data.access_token, refreshToken: data.refresh_token };
  localStorage.setItem("auth-storage", JSON.stringify({ state: newState }));
  return data.access_token;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const stored = typeof window !== "undefined" ? localStorage.getItem("auth-storage") : null;
  let token: string | null = null;
  let refreshToken: string | null = null;
  if (stored) {
    const { state } = JSON.parse(stored);
    token = state.accessToken;
    refreshToken = state.refreshToken;
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } else {
      // Refresh failed — clear stale tokens and redirect to login
      localStorage.removeItem("auth-storage");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.detail || res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  /** Upload one or more files to a product's images. */
  uploadImages: async <T>(productId: number, files: FileList | File[]): Promise<T> => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    // Don't set Content-Type — fetch will set multipart boundary automatically

    const res = await fetch(`${API_BASE}/products/${productId}/images`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || "Failed to upload images");
    }
    return res.json();
  },

  /** Delete a product image. */
  deleteImage: async (productId: number, imageId: number): Promise<void> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/products/${productId}/images/${imageId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok && res.status !== 204) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || "Failed to delete image");
    }
  },
};
