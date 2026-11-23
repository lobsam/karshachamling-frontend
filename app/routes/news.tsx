import { Link } from "react-router";

import { Bo, CoverImage } from "../components/content";
import { publicApi } from "../lib/api";
import { formatDate } from "../lib/format";
import type { Route } from "./+types/news";

export function meta() {
  return [{ title: "News — Karsha Chamling Monastery" }];
}

export async function loader() {
  return (await publicApi.news(1, 100)).items;
}

export default function NewsList({ loaderData: news }: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-5xl text-maroon-800">News</h1>
      {news.length === 0 && <p className="mt-6 text-stone-500">No news yet.</p>}
      <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((n) => (
          <li key={n.id}>
            <Link to={`/news/${n.slug}`} className="group block">
              {n.cover_image ? (
                <CoverImage
                  media={n.cover_image}
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[3/2] w-full rounded-lg object-cover"
                />
              ) : (
                <div className="aspect-[3/2] w-full rounded-lg bg-maroon-100" />
              )}
              <p className="mt-3 text-xs text-stone-500">{formatDate(n.published_at)}</p>
              <h2 className="font-serif text-2xl text-maroon-900 group-hover:underline">{n.title}</h2>
              <Bo text={n.title_bo} className="text-maroon-700" />
              {n.summary && <p className="mt-2 line-clamp-3 text-stone-600">{n.summary}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
