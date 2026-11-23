import { useState } from "react";
import { useOutletContext, useRevalidator } from "react-router";

import { PasswordForm } from "../../components/admin/PasswordForm";
import { Alert, Button, Field, Input, Modal, PageHeader, Select } from "../../components/admin/ui";
import { adminApi, errorMessage } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { User } from "../../lib/types";
import type { Route } from "./+types/users";
import { AdminError } from "../../components/admin/AdminError";

export async function clientLoader() {
  return adminApi.listUsers();
}

export default function Users({ loaderData: users }: Route.ComponentProps) {
  const { user: me } = useOutletContext<{ user: User }>();
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState<User | null>(null);
  const [error, setError] = useState("");
  const revalidator = useRevalidator();

  async function update(u: User, body: Parameters<typeof adminApi.updateUser>[1]) {
    try {
      await adminApi.updateUser(u.id, body);
      setError("");
      revalidator.revalidate();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function remove(u: User) {
    if (!window.confirm(`Delete ${u.email}? They will no longer be able to sign in.`)) return;
    try {
      await adminApi.deleteUser(u.id);
      revalidator.revalidate();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader title="Users" actions={<Button variant="primary" onClick={() => setAdding(true)}>+ Add user</Button>} />
      <p className="mb-4 text-sm text-stone-500">
        <strong>Editors</strong> manage content, images and messages. <strong>Admins</strong> can
        also see donations and manage users.
      </p>
      <Alert>{error}</Alert>
      <div className="mt-2 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u.id === me.id;
              return (
                <tr key={u.id} className={`border-b border-stone-100 last:border-0 ${u.is_active ? "" : "opacity-60"}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">
                      {u.name || "—"} {self && <span className="text-xs font-normal text-stone-500">(you)</span>}
                    </p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                    {!u.is_active && <p className="text-xs font-medium text-red-700">Disabled</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      aria-label={`Role for ${u.email}`}
                      value={u.role}
                      disabled={self}
                      onChange={(e) => update(u, { role: e.target.value })}
                      className="w-auto"
                    >
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-stone-600">{formatDate(u.last_login_at) || "Never"}</td>
                  <td className="px-4 py-3">
                    {!self && (
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button size="sm" onClick={() => setResetting(u)}>Reset password</Button>
                        <Button size="sm" onClick={() => update(u, { is_active: !u.is_active })}>
                          {u.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => remove(u)}>Delete</Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add user">
        <AddUserForm
          onDone={() => {
            setAdding(false);
            revalidator.revalidate();
          }}
        />
      </Modal>
      <Modal open={!!resetting} onClose={() => setResetting(null)} title="Reset password">
        {resetting && (
          <PasswordForm
            label={`New password for ${resetting.email}`}
            submitLabel="Set password"
            onSubmit={async (password) => {
              await adminApi.updateUser(resetting.id, { password });
              setResetting(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function AddUserForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ email: "", name: "", role: "editor", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await adminApi.createUser(form);
          onDone();
        } catch (err) {
          setError(errorMessage(err));
          setBusy(false);
        }
      }}
    >
      <Field label="Email">
        <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field label="Name">
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="Role">
        <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </Select>
      </Field>
      <Field label="Password" hint="At least 10 characters. Share it with them privately; they can change it after signing in.">
        <Input type="password" required minLength={10} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </Field>
      <Alert>{error}</Alert>
      <Button type="submit" variant="primary" disabled={busy}>Add user</Button>
    </form>
  );
}

export function ErrorBoundary() {
  return <AdminError />;
}
