import { adminApi } from "../../lib/api";
import { formatInr } from "../../lib/format";
import type { Route } from "./+types/dashboard";

export async function clientLoader() {
  return adminApi.dashboard();
}

export default function Dashboard({ loaderData: d }: Route.ComponentProps) {
  const cards = [
    { label: "Published news", value: d.news_published },
    { label: "News drafts", value: d.news_drafts },
    { label: "Upcoming events", value: d.upcoming_events },
    { label: "Visitor guide sections", value: d.guide_sections },
    { label: "Images", value: d.media_count },
    { label: "Unread messages", value: d.unread_messages },
  ];
  if (d.donations_paid_count !== null) {
    cards.push({ label: "Donations received", value: d.donations_paid_count });
  }
  return (
    <div>
      <h1 className="font-serif text-4xl text-maroon-900">Dashboard</h1>
      {d.donations_paid_total_paise !== null && (
        <p className="mt-2 text-stone-600">
          Total donations: <strong>{formatInr(d.donations_paid_total_paise)}</strong>
        </p>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-maroon-800">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
