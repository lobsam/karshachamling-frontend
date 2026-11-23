import { Bo, CoverImage, RichText } from "../components/content";
import { publicApi } from "../lib/api";
import type { Route } from "./+types/visit";

export function meta() {
  return [
    { title: "Visitor Guide — Karsha Chamling Monastery" },
    { name: "description", content: "How to reach Karsha, when to visit, where to stay and etiquette." },
  ];
}

export async function loader() {
  return publicApi.guide();
}

export default function Visit({ loaderData: sections }: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
      <aside className="hidden lg:block">
        <nav className="sticky top-6 space-y-2 text-sm">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.slug}`} className="block text-stone-600 hover:text-maroon-700">
              {s.title}
            </a>
          ))}
        </nav>
      </aside>
      <div>
        <h1 className="font-serif text-5xl text-maroon-800">Visitor Guide</h1>
        {sections.length === 0 && <p className="mt-6 text-stone-500">Coming soon.</p>}
        {sections.map((s) => (
          <section key={s.id} id={s.slug} className="mt-14 scroll-mt-6">
            <h2 className="font-serif text-3xl text-maroon-900">{s.title}</h2>
            <Bo text={s.title_bo} className="text-xl text-maroon-700" />
            {s.cover_image && (
              <CoverImage
                media={s.cover_image}
                sizes="(min-width: 1024px) 800px, 100vw"
                className="mt-6 w-full rounded-lg"
              />
            )}
            <div className="mt-6 space-y-8">
              <RichText html={s.body} />
              <RichText html={s.body_bo} lang="bo" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
