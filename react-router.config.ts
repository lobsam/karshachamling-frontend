import type { Config } from "@react-router/dev/config";
import { loadEnv } from "vite";

import { PLACEHOLDER_SLUG } from "./app/lib/placeholder";

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

// `react-router build` must fail loudly if the API is down (never deploy an empty site).
// `react-router dev` also calls prerender() on every request — there, a missing API must not
// take the whole dev server (and /admin) down with it.
const IS_BUILD = process.argv.includes("build");

/** At least one path per dynamic route — see app/lib/placeholder.ts */
const orPlaceholder = (slugList: string[]) => (slugList.length ? slugList : [PLACEHOLDER_SLUG]);

export default {
  ssr: false,
  async prerender({ getStaticPaths }) {
    const staticPaths = getStaticPaths().filter((p) => !p.startsWith("/admin"));
    let news: string[] = [];
    let events: string[] = [];
    let pages: string[] = [];
    try {
      [news, events, pages] = await Promise.all([
        slugs("/news?limit=100"),
        slugs("/events?when=all&limit=100"),
        slugs("/pages"),
      ]);
    } catch (e) {
      if (IS_BUILD) throw e;
      console.warn(`[dev] ${(e as Error).message} — continuing without content pages.`);
    }
    return [
      ...staticPaths,
      ...orPlaceholder(news).map((s) => `/news/${s}`),
      ...orPlaceholder(events).map((s) => `/events/${s}`),
      ...orPlaceholder(pages.filter((s) => s !== "home")).map((s) => `/${s}`),
    ];
  },
} satisfies Config;
