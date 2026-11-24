# Karsha Chamling — frontend

React website for **karshachamling.org**, hosted on **Cloudflare** (Workers static assets).

- **Public site** (`/`, `/news`, `/events`, `/visit`, plus any Page such as `/history`):
  pre-rendered to static HTML at build time from the backend API. It's fast, cheap and good
  for search engines.
- **Admin** (`/admin`): runs in the browser and talks to the API with the signed-in
  session cookie.

Built with React Router 7 (framework mode, `ssr: false` + prerender), Vite, Tailwind CSS 4
and TypeScript. Content and images come from the
[backend Worker](../karshachamling) (D1 + R2).

## Run locally

Start the backend first (in `../karshachamling`: `uv run pywrangler dev`). Then:

```bash
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8787
npm run dev               # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run typecheck` | Generate route types and run TypeScript |
| `npm run build` | Pre-render the public site into `build/client` (**the API must be reachable**) |

## How publishing works

1. An editor publishes or edits content in `/admin`.
2. The backend calls the Cloudflare **deploy hook**.
3. Cloudflare runs `npm run build`, which fetches every published item from the API and writes
   static HTML.
4. The new version goes live, usually in 1–2 minutes.

New content appears on the site only after that rebuild.

## Deploy to Cloudflare (Workers static assets)

The site deploys as a Worker with static assets only, with no server code (see `wrangler.jsonc`).

1. Push this repo to GitHub. In Cloudflare, go to Workers & Pages → Create → Import a
   repository, and pick this repo.
2. Use these build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Build variable (Settings → Builds → Variables and secrets):
     `VITE_API_URL=https://api.karshachamling.org`
3. Add the custom domain `karshachamling.org` (Settings → Domains & Routes).
4. Go to Settings → Builds → **Deploy Hooks**, create a hook for `main`, and save its URL in
   the backend as the secret `CF_PAGES_DEPLOY_HOOK`.

`public/_redirects` serves the client-side app shell for every `/admin/*` URL (keeping the URL).
`public/_headers` sets caching and security headers.

## Project layout

```
app/root.tsx              HTML shell, fonts, error page
app/routes.ts             route table
app/routes/*.tsx          public pages (each has a build-time `loader`)
app/routes/admin/*.tsx    admin screens (browser-only `clientLoader` / `clientAction`)
app/lib/api.ts            API client (cookie + CSRF header handled for you)
app/lib/types.ts          API response types
app/components/           CoverImage (responsive WebP), RichText, Bo (Tibetan text)
react-router.config.ts    lists the pages to pre-render (fetches slugs from the API)
```

Tibetan text (`*_bo` fields) is rendered with `lang="bo"` in Noto Serif Tibetan.
