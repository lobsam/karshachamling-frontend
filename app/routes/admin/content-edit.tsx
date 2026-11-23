import { useEffect, useRef, useState } from "react";
import { Link, useBlocker, useNavigate } from "react-router";

import { CoverImageField } from "../../components/admin/MediaPicker";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { Alert, Button, Card, Field, Input, PageHeader, Select, Textarea } from "../../components/admin/ui";
import { adminApi, errorMessage } from "../../lib/api";
import { contentTypeFromUrl, fromLocalInput, toLocalInput } from "../../lib/content-types";
import type { Event, GuideSection, Media, News, Page, Status } from "../../lib/types";
import type { Route } from "./+types/content-edit";
import { AdminError } from "../../components/admin/AdminError";

type Item = News | Event | GuideSection | Page;

interface FormState {
  slug: string;
  title: string;
  title_bo: string;
  summary: string;
  summary_bo: string;
  body: string;
  body_bo: string;
  status: Status;
  cover: Media | null;
  // news
  published_at: string;
  // events
  start_at: string;
  end_at: string;
  location: string;
  location_bo: string;
}

function toForm(item: Item | null): FormState {
  return {
    slug: item?.slug ?? "",
    title: item?.title ?? "",
    title_bo: item?.title_bo ?? "",
    summary: item?.summary ?? "",
    summary_bo: item?.summary_bo ?? "",
    body: item?.body ?? "",
    body_bo: item?.body_bo ?? "",
    status: item?.status ?? "draft",
    cover: item?.cover_image ?? null,
    published_at: toLocalInput(item && "published_at" in item ? item.published_at : null),
    start_at: toLocalInput(item && "start_at" in item ? item.start_at : null),
    end_at: toLocalInput(item && "end_at" in item ? item.end_at : null),
    location: item && "location" in item ? item.location : "",
    location_bo: item && "location_bo" in item ? item.location_bo : "",
  };
}

export async function clientLoader({ request, params }: Route.ClientLoaderArgs) {
  const config = contentTypeFromUrl(request.url);
  const item = params.id ? await adminApi.getContent<Item>(config.type, Number(params.id)) : null;
  return { config, item };
}

export default function ContentEdit({ loaderData }: Route.ComponentProps) {
  const { config, item } = loaderData;
  const navigate = useNavigate();
  const [form, setForm] = useState(() => toForm(item));
  const [saved, setSaved] = useState(() => JSON.stringify(toForm(item)));
  const [lang, setLang] = useState<"en" | "bo">("en");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const allowNav = useRef(false); // set right before our own navigations (after save/delete)

  // Switching between items (e.g. after "save" of a new one) resets the form
  useEffect(() => {
    setForm(toForm(item));
    setSaved(JSON.stringify(toForm(item)));
    allowNav.current = false;
  }, [item]);

  const dirty = JSON.stringify(form) !== saved;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !allowNav.current && dirty && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (blocker.state === "blocked") {
      if (window.confirm("You have unsaved changes. Leave without saving?")) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function save(nextStatus?: Status) {
    const status = nextStatus ?? form.status;
    const body: Record<string, unknown> = {
      slug: form.slug || null,
      title: form.title,
      title_bo: form.title_bo,
      summary: form.summary,
      summary_bo: form.summary_bo,
      body: form.body,
      body_bo: form.body_bo,
      status,
      cover_image_id: form.cover?.id ?? null,
    };
    if (config.type === "news") body.published_at = fromLocalInput(form.published_at);
    if (config.type === "events") {
      body.start_at = fromLocalInput(form.start_at);
      body.end_at = fromLocalInput(form.end_at);
      body.location = form.location;
      body.location_bo = form.location_bo;
    }
    if (!form.title.trim()) return setError("Please enter an English title.");
    if (config.type === "events" && !form.start_at) return setError("Please set when the event starts.");

    setBusy(true);
    setError("");
    try {
      const result = item
        ? await adminApi.updateContent<Item>(config.type, item.id, body)
        : await adminApi.createContent<Item>(config.type, body);
      const fresh = toForm(result);
      setForm(fresh);
      setSaved(JSON.stringify(fresh));
      setNotice(
        status === "published"
          ? "Saved and published. The website updates in 1–2 minutes."
          : "Saved as draft (not visible on the website).",
      );
      if (!item) {
        allowNav.current = true;
        navigate(`/admin/${config.type}/${result.id}`, { replace: true });
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!item || !window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await adminApi.deleteContent(config.type, item.id);
      allowNav.current = true;
      navigate(`/admin/${config.type}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  const bo = lang === "bo";
  return (
    <div>
      <Link to={`/admin/${config.type}`} className="text-sm text-maroon-700 hover:underline">
        ← {config.label}
      </Link>
      <PageHeader
        title={item ? `Edit ${config.singular}` : `New ${config.singular}`}
        actions={
          <>
            {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
            <Button onClick={() => save("draft")} disabled={busy}>
              {form.status === "published" ? "Unpublish" : "Save draft"}
            </Button>
            <Button variant="primary" onClick={() => save("published")} disabled={busy}>
              {form.status === "published" ? "Save & update site" : "Publish"}
            </Button>
          </>
        }
      />
      <div className="space-y-3">
        <Alert>{error}</Alert>
        <Alert kind="success">{!dirty && notice}</Alert>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="space-y-5">
          <div role="tablist" aria-label="Language" className="flex gap-1 border-b border-stone-200">
            {(["en", "bo"] as const).map((l) => (
              <button
                key={l}
                role="tab"
                type="button"
                aria-selected={lang === l}
                onClick={() => setLang(l)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                  lang === l ? "border-maroon-700 text-maroon-800" : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {l === "en" ? "English" : <span lang="bo">བོད་ཡིག</span>}
                {l === "bo" && <span className="ml-1 text-xs font-normal text-stone-400">(Tibetan)</span>}
              </button>
            ))}
          </div>

          <Field label={bo ? "Title (Tibetan)" : "Title"}>
            <Input
              lang={bo ? "bo" : undefined}
              value={bo ? form.title_bo : form.title}
              onChange={(e) => set(bo ? "title_bo" : "title", e.target.value)}
              required={!bo}
              className="text-base"
            />
          </Field>
          <Field label={bo ? "Summary (Tibetan)" : "Summary"} hint="Short description shown in lists and search results.">
            <Textarea
              lang={bo ? "bo" : undefined}
              value={bo ? form.summary_bo : form.summary}
              onChange={(e) => set(bo ? "summary_bo" : "summary", e.target.value)}
            />
          </Field>
          <div>
            <span className="text-sm font-medium text-stone-700">{bo ? "Text (Tibetan)" : "Text"}</span>
            <div className="mt-1">
              {/* key forces a fresh editor per language */}
              <RichTextEditor
                key={lang}
                lang={bo ? "bo" : undefined}
                value={bo ? form.body_bo : form.body}
                onChange={(html) => set(bo ? "body_bo" : "body", html)}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700">Status</span>
              <span className={`text-sm font-medium ${form.status === "published" ? "text-green-700" : "text-stone-500"}`}>
                {form.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
            {item?.status === "published" && (
              <a
                href={config.publicPath(item.slug)}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-maroon-700 hover:underline"
              >
                View on website ↗
              </a>
            )}

            {config.type === "news" && (
              <Field label="Publish date" hint="Leave empty to use the moment you publish.">
                <Input type="datetime-local" value={form.published_at} onChange={(e) => set("published_at", e.target.value)} />
              </Field>
            )}
            {config.type === "events" && (
              <>
                <Field label="Starts">
                  <Input type="datetime-local" required value={form.start_at} onChange={(e) => set("start_at", e.target.value)} />
                </Field>
                <Field label="Ends" hint="Optional.">
                  <Input type="datetime-local" value={form.end_at} onChange={(e) => set("end_at", e.target.value)} />
                </Field>
                <Field label={bo ? "Location (Tibetan)" : "Location"}>
                  <Input
                    lang={bo ? "bo" : undefined}
                    value={bo ? form.location_bo : form.location}
                    onChange={(e) => set(bo ? "location_bo" : "location", e.target.value)}
                    placeholder={bo ? "" : "e.g. Main assembly hall"}
                  />
                </Field>
              </>
            )}
            <Field
              label="Web address"
              hint={config.type === "pages" ? 'Use "home" for the home page text.' : "Made from the title if left empty."}
            >
              <div className="flex items-center gap-1 text-sm text-stone-500">
                <span className="whitespace-nowrap">{config.publicPath("").replace(/#$/, "")}</span>
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" />
              </div>
            </Field>
          </Card>

          <Card>
            <span className="mb-2 block text-sm font-medium text-stone-700">Cover image</span>
            <CoverImageField value={form.cover} onChange={(m) => set("cover", m)} />
          </Card>

          {item && (
            <Button variant="danger" onClick={remove} disabled={busy} className="w-full">
              Delete {config.singular}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <AdminError />;
}
