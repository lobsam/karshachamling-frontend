import { useState } from "react";

import { MediaGrid } from "../../components/admin/MediaPicker";
import { Alert, Button, Field, Input, Modal, PageHeader } from "../../components/admin/ui";
import { ApiError, adminApi, errorMessage } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { Media } from "../../lib/types";
import { AdminError } from "../../components/admin/AdminError";

export default function MediaLibrary() {
  const [selected, setSelected] = useState<Media | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div>
      <PageHeader title="Media library" />
      <p className="mb-4 text-sm text-stone-500">
        Images are resized automatically for phones and computers. Click an image to edit its
        description or delete it.
      </p>
      <MediaGrid onSelect={setSelected} selectedId={selected?.id} refreshKey={refreshKey} />
      <MediaDetails
        media={selected}
        onClose={() => setSelected(null)}
        onChanged={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

function MediaDetails({
  media,
  onClose,
  onChanged,
}: {
  media: Media | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  return (
    <Modal open={!!media} onClose={onClose} title="Image details" wide>
      {media && <MediaDetailsBody key={media.id} media={media} onClose={onClose} onChanged={onChanged} />}
    </Modal>
  );
}

function MediaDetailsBody({ media, onClose, onChanged }: { media: Media; onClose: () => void; onChanged: () => void }) {
  const [alt, setAlt] = useState(media.alt);
  const [altBo, setAltBo] = useState(media.alt_bo);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await adminApi.updateMedia(media.id, { alt, alt_bo: altBo });
      setNotice("Saved.");
      setError("");
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    setBusy(true);
    try {
      await adminApi.deleteMedia(media.id);
    } catch (e) {
      // 409 = still used somewhere: list where, and ask again
      const usedIn = e instanceof ApiError && e.status === 409 ? (e.detail as { used_in?: string[] }).used_in : null;
      if (!usedIn) {
        setError(errorMessage(e));
        setBusy(false);
        return;
      }
      const ok = window.confirm(
        `This image is still used in:\n\n• ${usedIn.join("\n• ")}\n\nDelete it anyway? It will disappear from those pages.`,
      );
      if (!ok) return setBusy(false);
      try {
        await adminApi.deleteMedia(media.id, true);
      } catch (e2) {
        setError(errorMessage(e2));
        setBusy(false);
        return;
      }
    }
    onChanged();
    onClose();
  }

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setNotice("Link copied.");
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <img src={media.urls.md} alt={media.alt} className="w-full rounded-lg bg-stone-100 object-contain" />
      <div className="space-y-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-stone-500">File</dt>
          <dd className="truncate">{media.filename}</dd>
          <dt className="text-stone-500">Size</dt>
          <dd>
            {media.width} × {media.height} px · {(media.size_bytes / 1024 / 1024).toFixed(1)} MB
          </dd>
          <dt className="text-stone-500">Added</dt>
          <dd>{formatDate(media.created_at)}</dd>
        </dl>
        <Field label="Description (English)" hint="Describes the image for blind visitors and search engines.">
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
        </Field>
        <Field label="Description (Tibetan)">
          <Input lang="bo" value={altBo} onChange={(e) => setAltBo(e.target.value)} />
        </Field>
        <Alert>{error}</Alert>
        <Alert kind="success">{notice}</Alert>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={save} disabled={busy}>
            Save
          </Button>
          <Button onClick={() => copy(media.urls.lg)}>Copy link</Button>
          <Button variant="danger" onClick={remove} disabled={busy}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <AdminError />;
}
