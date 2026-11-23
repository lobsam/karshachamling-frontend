import { Form, redirect, useNavigation } from "react-router";

import { ApiError, adminApi } from "../../lib/api";
import type { Route } from "./+types/login";

export function meta() {
  return [{ title: "Sign in — Karsha Chamling admin" }, { name: "robots", content: "noindex" }];
}

export async function clientLoader() {
  // Already signed in? Go straight to the dashboard.
  try {
    await adminApi.me();
    return redirect("/admin");
  } catch {
    return null;
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  try {
    await adminApi.login(String(form.get("email")), String(form.get("password")));
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 429)) {
      return { error: String(e.detail) };
    }
    return { error: "Could not reach the server. Please try again." };
  }
  const next = new URL(request.url).searchParams.get("next");
  return redirect(next?.startsWith("/admin") ? next : "/admin");
}

export function HydrateFallback() {
  return null;
}

export default function Login({ actionData }: Route.ComponentProps) {
  const busy = useNavigation().state !== "idle";
  return (
    <main className="flex min-h-screen items-center justify-center bg-maroon-50 px-4">
      <Form method="post" className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
        <h1 className="font-serif text-3xl text-maroon-800">Admin sign in</h1>
        <p className="mt-1 text-sm text-stone-500">Karsha Chamling Monastery</p>
        {actionData?.error && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionData.error}
          </p>
        )}
        <label className="mt-6 block text-sm font-medium text-stone-700">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-maroon-700 focus:outline-none"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-stone-700">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-maroon-700 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-md bg-maroon-700 py-2.5 font-medium text-white hover:bg-maroon-800 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </Form>
    </main>
  );
}
