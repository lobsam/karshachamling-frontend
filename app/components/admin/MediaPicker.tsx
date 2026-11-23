import { useCallback, useEffect, useRef, useState } from "react";

import { adminApi, errorMessage } from "../../lib/api";
import type { Media } from "../../lib/types";
import { Alert, Button, Input, Modal } from "./ui";

/** Upload one or more image files in sequence. Returns the uploaded media. */
export async function uploadFiles(
  files: FileList | File[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ uploaded: Media[]; errors: string[] }> {
  const list = Array.from(files);
  const uploaded: Media[] = [];
  const errors: string[] = [];
  for (const [i, f] of list.entries()) {
    onProgress?.(i, list.length);
    try {
      uploaded.push(await adminApi.uploadMedia(f));
    } catch (e) {
      errors.push(`${f.name}: ${errorMessage(e)}`);
    }
  }
  onProgress?.(list.length, list.length);
  return { uploaded, errors };
}

export function UploadButton({
  onUploaded,
  multiple = true,
  label = "Upload images",
}: {
  onUploaded: (media: Media[], errors: string[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        hidden
        onChange={async (e) => {
          const files = e.target.files;
          if (!files?.length) return;
          const { uploaded, errors } = await uploadFiles(files, (d, t) =>
            setProgress(d < t ? `Uploading ${d + 1} of ${t}…` : null),
          );
          e.target.value = "";
          onUploaded(uploaded, errors);
        }}
      />
      <Button variant="primary" disabled={!!progress} onClick={() => input.current?.click()}>
        {progress ?? label}
      </Button>
    </>
  );
}

/** Grid of images with search + upload; used by the Media page and the picker. */
export function MediaGrid({
  onSelect,
  selectedId,
  refreshKey = 0,
}: {
  onSelect: (m: Media) => void;
  selectedId?: number | null;
  refreshKey?: number;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Media[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setItems((await adminApi.listMedia({ q, limit: 200 })).items);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load, refreshKey]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          type="search"
          placeholder="Search by file name or description…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <UploadButton
          onUploaded={(uploaded, errors) => {
            setError(errors.join(" · "));
            load();
            if (uploaded.length === 1) onSelect(uploaded[0]);
          }}
        />
      </div>
      <Alert>{error}</Alert>
      {items === null ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-stone-500">No images yet. Upload one to get started.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m)}
                className={`group block w-full overflow-hidden rounded-lg border-2 bg-stone-100 text-left ${
                  selectedId === m.id ? "border-maroon-700" : "border-transparent hover:border-maroon-300"
                }`}
              >
                <img src={m.urls.sm} alt={m.alt} loading="lazy" className="aspect-square w-full object-cover" />
                <span className="block truncate px-2 py-1 text-xs text-stone-600">{m.alt || m.filename}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MediaPickerModal({
  open,
  onClose,
  onPick,
  title = "Choose an image",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (m: Media) => void;
  title?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      <MediaGrid
        onSelect={(m) => {
          onPick(m);
          onClose();
        }}
      />
    </Modal>
  );
}

/** Cover image field: preview + choose / remove. */
export function CoverImageField({
  value,
  onChange,
}: {
  value: Media | null;
  onChange: (m: Media | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {value ? (
        <img src={value.urls.md} alt={value.alt} className="aspect-[3/2] w-full rounded-lg object-cover" />
      ) : (
        <div className="flex aspect-[3/2] w-full items-center justify-center rounded-lg border border-dashed border-stone-300 text-sm text-stone-400">
          No cover image
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={() => setOpen(true)}>
          {value ? "Change" : "Choose image"}
        </Button>
        {value && (
          <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
      <MediaPickerModal open={open} onClose={() => setOpen(false)} onPick={onChange} />
    </div>
  );
}
