import { Link } from "react-router";

import { Bo, CoverImage, RichText } from "../components/content";
import { publicApi } from "../lib/api";
import { formatDate } from "../lib/format";
import { notFoundOn404 } from "../lib/loaders";
import type { Route } from "./+types/news-item";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: `${loaderData?.title ?? "News"} — Karsha Chamling Monastery` },
    { name: "description", content: loaderData?.summary ?? "" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  return notFoundOn404(publicApi.newsItem(params.slug));
}

export default function NewsItem({ loaderData: n }: Route.ComponentProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/news" className="text-sm text-maroon-700 hover:underline">
        ← All news
      </Link>
      <p className="mt-6 text-sm text-stone-500">{formatDate(n.published_at)}</p>
      <h1 className="mt-1 font-serif text-5xl text-maroon-900">{n.title}</h1>
      <Bo text={n.title_bo} className="mt-2 text-2xl text-maroon-700" />
      {n.cover_image && (
        <CoverImage
          media={n.cover_image}
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="mt-8 w-full rounded-lg"
        />
      )}
      <div className="mt-10 space-y-10">
        <RichText html={n.body} />
        <RichText html={n.body_bo} lang="bo" />
      </div>
    </article>
  );
}
