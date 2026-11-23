import { Link } from "react-router";

import { Bo, CoverImage, NotFoundMessage, RichText } from "../components/content";
import { publicApi } from "../lib/api";
import { formatDateTime } from "../lib/format";
import { loadBySlug } from "../lib/loaders";
import type { Route } from "./+types/event";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Page not found" }, { name: "robots", content: "noindex" }];
  return [
    { title: `${loaderData?.title ?? "Event"} — Karsha Chamling Monastery` },
    { name: "description", content: loaderData?.summary ?? "" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  return loadBySlug(params.slug, publicApi.event);
}

export default function EventPage({ loaderData: e }: Route.ComponentProps) {
  if (!e) return <NotFoundMessage backTo="/events" backLabel="← All events" />;
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/events" className="text-sm text-maroon-700 hover:underline">
        ← All events
      </Link>
      <h1 className="mt-6 font-serif text-5xl text-maroon-900">{e.title}</h1>
      <Bo text={e.title_bo} className="mt-2 text-2xl text-maroon-700" />
      <dl className="mt-6 grid gap-2 rounded-lg bg-maroon-50 p-5 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="font-medium text-maroon-800">When</dt>
        <dd>
          {formatDateTime(e.start_at)}
          {e.end_at && ` – ${formatDateTime(e.end_at)}`}
        </dd>
        {e.location && (
          <>
            <dt className="font-medium text-maroon-800">Where</dt>
            <dd>
              {e.location}
              <Bo text={e.location_bo} />
            </dd>
          </>
        )}
      </dl>
      {e.cover_image && (
        <CoverImage
          media={e.cover_image}
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="mt-8 w-full rounded-lg"
        />
      )}
      <div className="mt-10 space-y-10">
        <RichText html={e.body} />
        <RichText html={e.body_bo} lang="bo" />
      </div>
    </article>
  );
}
