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

// Screens for News, Events, Visitor Guide, Pages, Media, Messages, Donations and Users
// are added here as they are built.
const NAV = [{ to: "/admin", label: "Dashboard", end: true }];

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="flex w-60 flex-none flex-col bg-maroon-900 text-maroon-100">
        <div className="px-5 py-6">
          <p className="font-serif text-xl text-white">Karsha Chamling</p>
          <p className="text-xs text-maroon-100/70">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 text-sm">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 ${isActive ? "bg-maroon-700 text-white" : "hover:bg-maroon-800"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-maroon-800 px-5 py-4 text-sm">
          <p className="truncate text-white">{user.name || user.email}</p>
          <p className="text-xs capitalize text-maroon-100/70">{user.role}</p>
          <Form method="post" action="/admin" className="mt-3">
            <button type="submit" className="text-xs text-saffron-400 hover:underline">
              Sign out
            </button>
          </Form>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
