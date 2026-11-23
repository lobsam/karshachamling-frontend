import { useState } from "react";
import { Form, Link, useRevalidator, useSearchParams } from "react-router";

import { Alert, Button, EmptyState, Input, PageHeader, Select, StatusBadge } from "../../components/admin/ui";
import { adminApi, errorMessage } from "../../lib/api";
import { contentTypeFromUrl } from "../../lib/content-types";
import { formatDate, formatDateTime } from "../../lib/format";
import type { Event, GuideSection, News, Page } from "../../lib/types";
import type { Route } from "./+types/content-list";
import { AdminError } from "../../components/admin/AdminError";

type Item = News | Event | GuideSection | Page;

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const config = contentTypeFromUrl(request.url);
  const sp = new URL(request.url).searchParams;
  const result = await adminApi.listContent<Item>(config.type, {
    q: sp.get("q") ?? "",
    status: sp.get("status") ?? "",
  });
  return { config, items: result.items, total: result.total };
}

export default function ContentList({ loaderData }: Route.ComponentProps) {
  const { config, items } = loaderData;
  const [sp] = useSearchParams();
  const isGuide = config.type === "guide";
  const filtered = Boolean(sp.get("q") || sp.get("status"));

  return (
    <div>
      <PageHeader
        title={config.label}
        actions={
          <Link
            to={`/admin/${config.type}/new`}
            className="rounded-md bg-maroon-700 px-4 py-2 text-sm font-medium text-white hover:bg-maroon-800"
          >
            + New {config.singular}
          </Link>
        }
      />

      {!isGuide && (
        <Form method="get" className="mb-4 flex flex-wrap gap-2">
          <Input name="q" type="search" placeholder="Search titles…" defaultValue={sp.get("q") ?? ""} className="max-w-xs" />
          <Select name="status" defaultValue={sp.get("status") ?? ""} className="max-w-[10rem]">
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </Select>
          <Button type="submit">Filter</Button>
        </Form>
      )}

      {items.length === 0 ? (
        <EmptyState>
          {filtered ? "Nothing matches your search." : `No ${config.label.toLowerCase()} yet.`}
        </EmptyState>
      ) : isGuide ? (
        <GuideOrder items={items as GuideSection[]} />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">{config.type === "events" ? "Starts" : config.type === "news" ? "Published" : "Updated"}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/${config.type}/${item.id}`} className="flex items-center gap-3 font-medium text-maroon-900 hover:underline">
                      {item.cover_image ? (
                        <img src={item.cover_image.urls.sm} alt="" className="h-10 w-14 flex-none rounded object-cover" />
                      ) : (
                        <span className="h-10 w-14 flex-none rounded bg-stone-100" />
                      )}
                      <span>
                        {item.title}
                        {item.title_bo && <span lang="bo" className="block text-xs font-normal text-stone-500">{item.title_bo}</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-stone-600">
                    {"start_at" in item
                      ? formatDateTime(item.start_at)
                      : "published_at" in item
                        ? formatDate(item.published_at) || "—"
                        : formatDate(item.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Visitor Guide sections are shown in this order on the site; move them up and down. */
function GuideOrder({ items }: { items: GuideSection[] }) {
  const [order, setOrder] = useState(items);
  const [error, setError] = useState("");
  const revalidator = useRevalidator();

  async function move(index: number, delta: number) {
    const next = [...order];
    const [moved] = next.splice(index, 1);
    next.splice(index + delta, 0, moved);
    setOrder(next);
    try {
      await adminApi.reorderGuide(next.map((s) => s.id));
      setError("");
      revalidator.revalidate();
    } catch (e) {
      setError(errorMessage(e));
      setOrder(order);
    }
  }

  return (
    <div className="space-y-3">
      <Alert>{error}</Alert>
      <p className="text-sm text-stone-500">Sections appear on the Visitor Guide page in this order.</p>
      <ol className="divide-y divide-stone-100 rounded-xl bg-white shadow-sm">
        {order.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3">
            <span className="w-6 text-right text-sm tabular-nums text-stone-400">{i + 1}</span>
            <Link to={`/admin/guide/${s.id}`} className="flex-1 font-medium text-maroon-900 hover:underline">
              {s.title}
            </Link>
            <StatusBadge status={s.status} />
            <Button size="sm" variant="ghost" aria-label={`Move ${s.title} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</Button>
            <Button size="sm" variant="ghost" aria-label={`Move ${s.title} down`} disabled={i === order.length - 1} onClick={() => move(i, 1)}>↓</Button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ErrorBoundary() {
  return <AdminError />;
}
