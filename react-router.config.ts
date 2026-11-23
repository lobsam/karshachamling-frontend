import type { Config } from "@react-router/dev/config";
import { loadEnv } from "vite";

// The public site is pre-rendered to static HTML at build time (good for SEO and speed).
// /admin is a client-side app served from the SPA fallback page.
// Publishing in /admin triggers a Cloudflare Pages rebuild, which picks up new content.

const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");
const API_URL = (env.VITE_API_URL || "http://localhost:8787").replace(/\/$/, "");

async function slugs(path: string): Promise<string[]> {
  const res = await fetch(`${API_URL}${path}`).catch((e) => {
    throw new Error(`Prerender: cannot reach the API at ${API_URL} (${e}). Is it running?`);
  });
  if (!res.ok) throw new Error(`Prerender: ${API_URL}${path} returned ${res.status}`);
  const data = await res.json();
  const items: { slug: string }[] = Array.isArray(data) ? data : data.items;
  return items.map((i) => i.slug);
}

export default {
  ssr: false,
  async prerender({ getStaticPaths }) {
    const [news, events, pages] = await Promise.all([
      slugs("/news?limit=100"),
      slugs("/events?when=all&limit=100"),
      slugs("/pages"),
    ]);
    return [
      ...getStaticPaths().filter((p) => !p.startsWith("/admin")),
      ...news.map((s) => `/news/${s}`),
      ...events.map((s) => `/events/${s}`),
      ...pages.filter((s) => s !== "home").map((s) => `/${s}`),
    ];
  },
} satisfies Config;
