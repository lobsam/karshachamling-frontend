import type { Media } from "../lib/types";

/** Responsive image using the backend's WebP sizes (400 / 1200 / 2000 px). */
export function CoverImage({
  media,
  sizes = "100vw",
  className = "",
  priority = false,
}: {
  media: Media;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const { urls } = media;
  const widths = { sm: Math.min(400, media.width), md: Math.min(1200, media.width), lg: Math.min(2000, media.width) };
  const srcSet = Array.from(
    new Map([
      [urls.sm, widths.sm],
      [urls.md, widths.md],
      [urls.lg, widths.lg],
    ]),
  )
    .map(([url, w]) => `${url} ${w}w`)
    .join(", ");
  return (
    <img
      src={urls.md}
      srcSet={srcSet}
      sizes={sizes}
      width={media.width}
      height={media.height}
      alt={media.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}

/** Article HTML from the backend (already sanitised on save). */
export function RichText({ html, lang }: { html: string; lang?: "bo" }) {
  if (!html) return null;
  return (
    <div
      lang={lang}
      className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-maroon-900 prose-a:text-maroon-700 prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Tibetan text shown under its English counterpart, when there is one. */
export function Bo({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <span lang="bo" className={`block ${className}`}>
      {text}
    </span>
  );
}

/** Shown for the build-time placeholder page (a section with no items yet). */
export function NotFoundMessage({ backTo, backLabel }: { backTo: string; backLabel: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl text-maroon-800">Page not found</h1>
      <p className="mt-4 text-stone-600">The page you are looking for doesn't exist or has moved.</p>
      <a href={backTo} className="mt-8 inline-block text-maroon-700 underline">{backLabel}</a>
    </div>
  );
}
