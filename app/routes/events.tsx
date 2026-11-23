import { Link } from "react-router";

import { Bo, CoverImage } from "../components/content";
import { publicApi } from "../lib/api";
import { formatDateTime } from "../lib/format";
import type { Event } from "../lib/types";
import type { Route } from "./+types/events";

export function meta() {
  return [{ title: "Events & Festivals — Karsha Chamling Monastery" }];
}

export async function loader() {
  const [upcoming, past] = await Promise.all([
    publicApi.events("upcoming", 100),
    publicApi.events("past", 30),
  ]);
  return { upcoming: upcoming.items, past: past.items };
}

export default function Events({ loaderData }: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-5xl text-maroon-800">Events &amp; Festivals</h1>
      <EventList title="Upcoming" events={loaderData.upcoming} empty="No upcoming events yet." />
      {loaderData.past.length > 0 && <EventList title="Past events" events={loaderData.past} />}
    </div>
  );
}

function EventList({ title, events, empty }: { title: string; events: Event[]; empty?: string }) {
  return (
    <section className="mt-12">
      <h2 className="border-b border-maroon-100 pb-2 font-serif text-3xl text-maroon-800">{title}</h2>
      {events.length === 0 && empty && <p className="mt-6 text-stone-500">{empty}</p>}
      <ul className="mt-6 space-y-8">
        {events.map((e) => (
          <li key={e.id}>
            <Link to={`/events/${e.slug}`} className="group flex gap-5">
              {e.cover_image && (
                <CoverImage
                  media={e.cover_image}
                  sizes="160px"
                  className="h-28 w-40 flex-none rounded-md object-cover"
                />
              )}
              <div>
                <p className="text-sm font-medium text-saffron-500">
                  {formatDateTime(e.start_at)}
                  {e.end_at && ` – ${formatDateTime(e.end_at)}`}
                </p>
                <h3 className="font-serif text-2xl text-maroon-900 group-hover:underline">{e.title}</h3>
                <Bo text={e.title_bo} className="text-maroon-700" />
                {e.location && <p className="text-sm text-stone-500">{e.location}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
