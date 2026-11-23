import { Form, NavLink, Outlet, redirect } from "react-router";

import { ApiError, adminApi } from "../../lib/api";
import type { Route } from "./+types/layout";

export function meta() {
  return [{ title: "Admin — Karsha Chamling" }, { name: "robots", content: "noindex" }];
}

// Every /admin page goes through this: no valid session → login page.
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    return { user: await adminApi.me() };
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      const next = new URL(request.url).pathname;
      throw redirect(`/admin/login?next=${encodeURIComponent(next)}`);
    }
    throw e;
  }
}

export async function clientAction() {
  await adminApi.logout();
  return redirect("/admin/login");
}

export function HydrateFallback() {
  return <div className="p-8 text-stone-500">Loading…</div>;
}

const NAV: { to: string; label: string; end?: boolean; adminOnly?: boolean; gap?: boolean }[] = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/news", label: "News", gap: true },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/guide", label: "Visitor Guide" },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/media", label: "Media library" },
  { to: "/admin/messages", label: "Messages", gap: true },
  { to: "/admin/donations", label: "Donations", adminOnly: true },
  { to: "/admin/users", label: "Users", adminOnly: true },
];

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const nav = NAV.filter((item) => !item.adminOnly || user.role === "admin");
  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="flex w-60 flex-none flex-col bg-maroon-900 text-maroon-100">
        <div className="px-5 py-6">
          <p className="font-serif text-xl text-white">Karsha Chamling</p>
          <p className="text-xs text-maroon-100/70">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 text-sm">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 ${item.gap ? "mt-4" : ""} ${isActive ? "bg-maroon-700 text-white" : "hover:bg-maroon-800"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-maroon-800 px-5 py-4 text-sm">
          <NavLink to="/admin/account" className="block truncate text-white hover:underline">
            {user.name || user.email}
          </NavLink>
          <p className="text-xs capitalize text-maroon-100/70">{user.role}</p>
          <div className="mt-3 flex gap-4 text-xs">
            <a href="/" target="_blank" rel="noreferrer" className="text-maroon-100/80 hover:underline">
              View website ↗
            </a>
            <Form method="post" action="/admin">
              <button type="submit" className="text-saffron-400 hover:underline">
                Sign out
              </button>
            </Form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
