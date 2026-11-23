import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Public website — pre-rendered at build time
  layout("routes/site-layout.tsx", [
    index("routes/home.tsx"),
    route("news", "routes/news.tsx"),
    route("news/:slug", "routes/news-item.tsx"),
    route("events", "routes/events.tsx"),
    route("events/:slug", "routes/event.tsx"),
    route("visit", "routes/visit.tsx"),
    route(":slug", "routes/page.tsx"), // Pages created in /admin (history, privacy-policy…)
  ]),

  // Admin dashboard — runs in the browser only
  route("admin/login", "routes/admin/login.tsx"),
  route("admin", "routes/admin/layout.tsx", [index("routes/admin/dashboard.tsx")]),
] satisfies RouteConfig;
