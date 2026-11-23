import { Link } from "react-router";

import { Bo, CoverImage, RichText } from "../components/content";
import { ApiError, publicApi } from "../lib/api";
import { formatDate, formatDateTime } from "../lib/format";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "Karsha Chamling Monastery — Zanskar, Ladakh" },
    {
      name: "description",
      content: "Karsha Chamling Monastery, the largest Gelug monastery in the Zanskar valley, Ladakh.",
    },
  ];
}

export async function loader() {
  const [home, news, events] = await Promise.all([
    publicApi.page("home").catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
    publicApi.news(1, 3),
    publicApi.events("upcoming", 3),
  ]);
  return { home, news: news.items, events: events.items };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { home, news, events } = loaderData;
  return (
    <>
      <section className="relative isolate overflow-hidden bg-maroon-900 text-white">
        {home?.cover_image && (
          <CoverImage
            media={home.cover_image}
            priority
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
          />
        )}
        <div className="mx-auto max-w-6xl px-4 py-28">
          <h1 className="font-serif text-5xl font-semibold sm:text-6xl">
            {home?.title || "Karsha Chamling Monastery"}
          </h1>
          <Bo text={home?.title_bo ?? ""} className="mt-2 text-2xl text-saffron-400" />
          {home?.summary && <p className="mt-6 max-w-2xl text-lg text-white/90">{home.summary}</p>}
        </div>
      </section>

      {home?.body && (
        <section className="mx-auto max-w-3xl px-4 py-16">
          <RichText html={home.body} />
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-12 md:grid-cols-2">
        <div>
          <SectionTitle title="Latest news" href="/news" />
          {news.length === 0 && <p className="text-stone-500">No news yet.</p>}
          <ul className="space-y-6">
            {news.map((n) => (
              <li key={n.id}>
                <Link to={`/news/${n.slug}`} className="group flex gap-4">
                  {n.cover_image && (
                    <CoverImage
                      media={n.cover_image}
                      sizes="128px"
                      className="h-20 w-32 flex-none rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="text-xs text-stone-500">{formatDate(n.published_at)}</p>
                    <p className="font-serif text-xl text-maroon-900 group-hover:underline">{n.title}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionTitle title="Upcoming events" href="/events" />
          {events.length === 0 && <p className="text-stone-500">No upcoming events.</p>}
          <ul className="space-y-6">
            {events.map((e) => (
              <li key={e.id}>
                <Link to={`/events/${e.slug}`} className="group block">
                  <p className="text-xs font-medium text-saffron-500">{formatDateTime(e.start_at)}</p>
                  <p className="font-serif text-xl text-maroon-900 group-hover:underline">{e.title}</p>
                  {e.location && <p className="text-sm text-stone-500">{e.location}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between border-b border-maroon-100 pb-2">
      <h2 className="font-serif text-3xl text-maroon-800">{title}</h2>
      <Link to={href} className="text-sm text-maroon-700 hover:underline">
        View all →
      </Link>
    </div>
  );
}
