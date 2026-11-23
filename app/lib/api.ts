// Small fetch wrapper for the backend Worker.
// Public pages call it at build time (prerendering); /admin calls it in the browser.

import type {
  Dashboard,
  Event,
  GuideSection,
  News,
  Page,
  Paginated,
  User,
} from "./types";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8787").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: unknown,
  ) {
    super(typeof detail === "string" ? detail : `API error ${status}`);
  }
}

type Options = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit };

export async function api<T>(path: string, { json, headers, ...init }: Options = {}): Promise<T> {
  const h = new Headers(headers);
  if (json !== undefined) h.set("Content-Type", "application/json");
  const method = (init.method ?? "GET").toUpperCase();
  // Required by the backend's CSRF protection for every logged-in write
  if (method !== "GET") h.set("X-Requested-With", "kc-admin");

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    method,
    headers: h,
    credentials: "include", // send the httpOnly session cookie
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });
  if (res.status === 204) return undefined as T;
  const data = res.headers.get("content-type")?.includes("json") ? await res.json() : await res.text();
  if (!res.ok) throw new ApiError(res.status, (data as { detail?: unknown })?.detail ?? data);
  return data as T;
}

// ---------- Public content (published only) ----------

export const publicApi = {
  news: (page = 1, limit = 12) => api<Paginated<News>>(`/news?page=${page}&limit=${limit}`),
  newsItem: (slug: string) => api<News>(`/news/${encodeURIComponent(slug)}`),
  events: (when: "upcoming" | "past" | "all" = "upcoming", limit = 20) =>
    api<Paginated<Event>>(`/events?when=${when}&limit=${limit}`),
  event: (slug: string) => api<Event>(`/events/${encodeURIComponent(slug)}`),
  guide: () => api<GuideSection[]>("/guide"),
  pages: () => api<Page[]>("/pages"),
  page: (slug: string) => api<Page>(`/pages/${encodeURIComponent(slug)}`),
};

// ---------- Admin ----------

export const adminApi = {
  login: (email: string, password: string) =>
    api<User>("/auth/login", { method: "POST", json: { email, password } }),
  logout: () => api<void>("/auth/logout", { method: "POST" }),
  me: () => api<User>("/auth/me"),
  dashboard: () => api<Dashboard>("/admin/dashboard"),
};
