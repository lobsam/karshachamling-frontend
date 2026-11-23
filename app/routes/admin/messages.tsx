import { useState } from "react";
import { useRevalidator, useSearchParams } from "react-router";

import { Alert, Button, EmptyState, PageHeader } from "../../components/admin/ui";
import { adminApi, errorMessage } from "../../lib/api";
import { formatDateTime } from "../../lib/format";
import type { ContactMessage } from "../../lib/types";
import type { Route } from "./+types/messages";
import { AdminError } from "../../components/admin/AdminError";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const unread = new URL(request.url).searchParams.get("show") === "unread";
  return { unread, ...(await adminApi.listMessages({ unread })) };
}

export default function Messages({ loaderData }: Route.ComponentProps) {
  const { items, unread } = loaderData;
  const [, setSp] = useSearchParams();
  return (
    <div>
      <PageHeader
        title="Messages"
        actions={
          <div className="flex rounded-md border border-stone-300 bg-white p-0.5 text-sm">
            {[
              ["", "All"],
              ["unread", "Unread"],
            ].map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setSp(v ? { show: v } : {})}
                className={`rounded px-3 py-1 ${(v === "unread") === unread ? "bg-maroon-700 text-white" : "text-stone-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />
      <p className="mb-4 text-sm text-stone-500">Messages sent from the website's contact form.</p>
      {items.length === 0 ? (
        <EmptyState>{unread ? "No unread messages." : "No messages yet."}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {items.map((m) => (
            <MessageRow key={m.id} msg={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MessageRow({ msg }: { msg: ContactMessage }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const revalidator = useRevalidator();

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
      setError("");
      revalidator.revalidate();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function toggle() {
    setOpen(!open);
    if (!open && !msg.is_read) await run(() => adminApi.markMessage(msg.id, true));
  }

  const reply = `mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject || "Your message"}`)}`;
  return (
    <li className={`rounded-xl bg-white shadow-sm ${msg.is_read ? "" : "ring-2 ring-saffron-400"}`}>
      <button type="button" onClick={toggle} aria-expanded={open} className="flex w-full items-start gap-4 p-4 text-left">
        <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${msg.is_read ? "bg-transparent" : "bg-saffron-500"}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-2">
            <span className={`text-maroon-900 ${msg.is_read ? "" : "font-semibold"}`}>
              {msg.name} <span className="text-sm font-normal text-stone-500">&lt;{msg.email}&gt;</span>
            </span>
            <span className="text-xs text-stone-500">{formatDateTime(msg.created_at)}</span>
          </span>
          <span className="block text-sm text-stone-700">{msg.subject || "(no subject)"}</span>
          {!open && <span className="block truncate text-sm text-stone-500">{msg.message}</span>}
        </span>
      </button>
      {open && (
        <div className="border-t border-stone-100 px-4 pb-4 pl-10">
          <p className="whitespace-pre-wrap pt-3 text-sm text-stone-800">{msg.message}</p>
          <Alert>{error}</Alert>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={reply} className="rounded-md bg-maroon-700 px-4 py-2 text-sm font-medium text-white hover:bg-maroon-800">
              Reply by email
            </a>
            <Button onClick={() => run(() => adminApi.markMessage(msg.id, false))}>Mark as unread</Button>
            <Button
              variant="danger"
              onClick={() => window.confirm("Delete this message?") && run(() => adminApi.deleteMessage(msg.id))}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

export function ErrorBoundary() {
  return <AdminError />;
}
