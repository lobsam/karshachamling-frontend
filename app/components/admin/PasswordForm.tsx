import { useState } from "react";

import { errorMessage } from "../../lib/api";
import { Alert, Button, Field, Input } from "./ui";

export function PasswordForm({
  label,
  submitLabel,
  withCurrent = false,
  onSubmit,
}: {
  label: string;
  submitLabel: string;
  withCurrent?: boolean;
  onSubmit: (password: string, current: string) => Promise<void>;
}) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (password !== repeat) return setError("The two passwords don't match.");
        setBusy(true);
        try {
          await onSubmit(password, current);
          setError("");
          setNotice("Password changed.");
          setCurrent("");
          setPassword("");
          setRepeat("");
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      {withCurrent && (
        <Field label="Current password">
          <Input type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
      )}
      <Field label={label} hint="At least 10 characters.">
        <Input type="password" required minLength={10} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field label="Repeat password">
        <Input type="password" required minLength={10} autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} />
      </Field>
      <Alert>{error}</Alert>
      <Alert kind="success">{notice}</Alert>
      <Button type="submit" variant="primary" disabled={busy}>{submitLabel}</Button>
    </form>
  );
}
