import { Bo, CoverImage, RichText } from "../components/content";
import { publicApi } from "../lib/api";
import { notFoundOn404 } from "../lib/loaders";
import type { Route } from "./+types/page";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: `${loaderData?.title ?? "Page"} — Karsha Chamling Monastery` },
    { name: "description", content: loaderData?.summary ?? "" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  return notFoundOn404(publicApi.page(params.slug));
}

export default function ContentPage({ loaderData: p }: Route.ComponentProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-5xl text-maroon-900">{p.title}</h1>
      <Bo text={p.title_bo} className="mt-2 text-2xl text-maroon-700" />
      {p.cover_image && (
        <CoverImage
          media={p.cover_image}
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="mt-8 w-full rounded-lg"
        />
      )}
      <div className="mt-10 space-y-10">
        <RichText html={p.body} />
        <RichText html={p.body_bo} lang="bo" />
      </div>
    </article>
  );
}
