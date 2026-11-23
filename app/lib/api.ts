// Small fetch wrapper for the backend Worker.
// Public pages call it at build time (prerendering); /admin calls it in the browser.

import type {
  ContactMessage,
  Dashboard,
  Donation,
  Event,
  GuideSection,
  Media,
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

export type ContentType = "news" | "events" | "guide" | "pages";
type AnyContent = News | Event | GuideSection | Page;

function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") s.set(k, String(v));
  const out = s.toString();
  return out ? `?${out}` : "";
}

export const adminApi = {
  login: (email: string, password: string) =>
    api<User>("/auth/login", { method: "POST", json: { email, password } }),
  logout: () => api<void>("/auth/logout", { method: "POST" }),
  me: () => api<User>("/auth/me"),
  changePassword: (current_password: string, new_password: string) =>
    api<void>("/auth/password", { method: "POST", json: { current_password, new_password } }),
  dashboard: () => api<Dashboard>("/admin/dashboard"),

  // News / Events / Visitor Guide / Pages
  listContent: <T extends AnyContent>(type: ContentType, params: { q?: string; status?: string; page?: number } = {}) =>
    api<Paginated<T>>(`/admin/${type}${qs({ ...params, limit: 200 })}`),
  getContent: <T extends AnyContent>(type: ContentType, id: number) => api<T>(`/admin/${type}/${id}`),
  createContent: <T extends AnyContent>(type: ContentType, body: Record<string, unknown>) =>
    api<T>(`/admin/${type}`, { method: "POST", json: body }),
  updateContent: <T extends AnyContent>(type: ContentType, id: number, body: Record<string, unknown>) =>
    api<T>(`/admin/${type}/${id}`, { method: "PUT", json: body }),
  deleteContent: (type: ContentType, id: number) =>
    api<void>(`/admin/${type}/${id}`, { method: "DELETE" }),
  reorderGuide: (ids: number[]) =>
    api<void>("/admin/guide/reorder", { method: "POST", json: { ids } }),

  // Media
  listMedia: (params: { q?: string; page?: number; limit?: number } = {}) =>
    api<Paginated<Media>>(`/admin/media${qs(params)}`),
  uploadMedia: (file: File, alt = "") => {
    const form = new FormData();
    form.append("file", file);
    form.append("alt", alt);
    return api<Media>("/admin/media", { method: "POST", body: form });
  },
  updateMedia: (id: number, body: { alt?: string; alt_bo?: string }) =>
    api<Media>(`/admin/media/${id}`, { method: "PATCH", json: body }),
  deleteMedia: (id: number, force = false) =>
    api<void>(`/admin/media/${id}${force ? "?force=true" : ""}`, { method: "DELETE" }),

  // Contact messages
  listMessages: (params: { unread?: boolean; page?: number } = {}) =>
    api<Paginated<ContactMessage>>(`/admin/messages${qs({ ...params, limit: 100 })}`),
  markMessage: (id: number, is_read: boolean) =>
    api<ContactMessage>(`/admin/messages/${id}`, { method: "PATCH", json: { is_read } }),
  deleteMessage: (id: number) => api<void>(`/admin/messages/${id}`, { method: "DELETE" }),

  // Donations (admins only)
  listDonations: (params: { status?: string; page?: number } = {}) =>
    api<Paginated<Donation>>(`/admin/donations${qs({ ...params, limit: 200 })}`),
  donationsCsvUrl: (status = "paid") => `${API_URL}/admin/donations/export.csv${qs({ status })}`,

  // Users (admins only)
  listUsers: () => api<User[]>("/admin/users"),
  createUser: (body: { email: string; name: string; role: string; password: string }) =>
    api<User>("/admin/users", { method: "POST", json: body }),
  updateUser: (id: number, body: Partial<{ name: string; role: string; is_active: boolean; password: string }>) =>
    api<User>(`/admin/users/${id}`, { method: "PATCH", json: body }),
  deleteUser: (id: number) => api<void>(`/admin/users/${id}`, { method: "DELETE" }),
};

/** Human-readable message for an API error (FastAPI validation errors included). */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const d = e.detail as unknown;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) {
      return d
        .map((x: { loc?: (string | number)[]; msg?: string }) =>
          `${x.loc?.slice(1).join(".") || "field"}: ${x.msg ?? "invalid"}`,
        )
        .join("; ");
    }
    if (d && typeof d === "object" && "message" in d) return String((d as { message: string }).message);
    return `Request failed (${e.status})`;
  }
  return "Could not reach the server. Check your connection and try again.";
}
