import { useOutletContext } from "react-router";

import { PasswordForm } from "../../components/admin/PasswordForm";
import { Card, PageHeader } from "../../components/admin/ui";
import { adminApi } from "../../lib/api";
import type { User } from "../../lib/types";
import { AdminError } from "../../components/admin/AdminError";

export default function Account() {
  const { user } = useOutletContext<{ user: User }>();
  return (
    <div className="max-w-md">
      <PageHeader title="My account" />
      <Card className="space-y-1 text-sm">
        <p className="font-medium text-stone-900">{user.name || user.email}</p>
        <p className="text-stone-500">
          {user.email} · <span className="capitalize">{user.role}</span>
        </p>
      </Card>
      <Card className="mt-6">
        <h2 className="mb-4 font-serif text-2xl text-maroon-900">Change password</h2>
        <PasswordForm
          withCurrent
          label="New password"
          submitLabel="Change password"
          onSubmit={(password, current) => adminApi.changePassword(current, password)}
        />
        <p className="mt-3 text-xs text-stone-500">Changing your password signs you out on other devices.</p>
      </Card>
    </div>
  );
}

export function ErrorBoundary() {
  return <AdminError />;
}
