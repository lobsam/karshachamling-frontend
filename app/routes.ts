import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

// News, Events, Visitor Guide and Pages share one list screen and one editor screen
const contentRoutes = (type: string) =>
  prefix(type, [
    index("routes/admin/content-list.tsx", { id: `admin-${type}-list` }),
    route("new", "routes/admin/content-edit.tsx", { id: `admin-${type}-new` }),
    route(":id", "routes/admin/content-edit.tsx", { id: `admin-${type}-edit` }),
  ]);

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
  route("admin", "routes/admin/layout.tsx", [
    index("routes/admin/dashboard.tsx"),
    ...contentRoutes("news"),
    ...contentRoutes("events"),
    ...contentRoutes("guide"),
    ...contentRoutes("pages"),
    route("media", "routes/admin/media.tsx"),
    route("messages", "routes/admin/messages.tsx"),
    route("donations", "routes/admin/donations.tsx"),
    route("users", "routes/admin/users.tsx"),
    route("account", "routes/admin/account.tsx"),
  ]),
] satisfies RouteConfig;
