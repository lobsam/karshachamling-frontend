import type { ContentType } from "./api";

export interface ContentTypeConfig {
  type: ContentType;
  label: string; // plural, for headings and nav
  singular: string;
  /** Where the item appears on the public site */
  publicPath: (slug: string) => string;
}

export const CONTENT_TYPES: Record<ContentType, ContentTypeConfig> = {
  news: { type: "news", label: "News", singular: "news article", publicPath: (s) => `/news/${s}` },
  events: { type: "events", label: "Events", singular: "event", publicPath: (s) => `/events/${s}` },
  guide: {
    type: "guide",
    label: "Visitor Guide",
    singular: "guide section",
    publicPath: (s) => `/visit#${s}`,
  },
  pages: {
    type: "pages",
    label: "Pages",
    singular: "page",
    publicPath: (s) => (s === "home" ? "/" : `/${s}`),
  },
};

/** /admin/news/12 → "news" */
export function contentTypeFromUrl(url: string): ContentTypeConfig {
  const type = new URL(url).pathname.split("/")[2] as ContentType;
  const config = CONTENT_TYPES[type];
  if (!config) throw new Response("Not found", { status: 404 });
  return config;
}

/** ISO (UTC) → value for <input type="datetime-local"> in the browser's time zone */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value → ISO (UTC) */
export function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
