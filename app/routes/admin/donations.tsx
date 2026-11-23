import { useSearchParams } from "react-router";

import { EmptyState, PageHeader, Select, StatusBadge } from "../../components/admin/ui";
import { adminApi } from "../../lib/api";
import { formatDateTime, formatInr } from "../../lib/format";
import type { Route } from "./+types/donations";
import { AdminError } from "../../components/admin/AdminError";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const status = new URL(request.url).searchParams.get("status") ?? "paid";
  return { status, ...(await adminApi.listDonations({ status: status === "all" ? "" : status })) };
}

export default function Donations({ loaderData }: Route.ComponentProps) {
  const { items, total, status } = loaderData;
  const [, setSp] = useSearchParams();
  const sum = items.filter((d) => d.status === "paid").reduce((s, d) => s + d.amount_paise, 0);
  return (
    <div>
      <PageHeader
        title="Donations"
        actions={
          <>
            <Select value={status} onChange={(e) => setSp({ status: e.target.value })} className="w-auto">
              <option value="paid">Received</option>
              <option value="created">Pending (not completed)</option>
              <option value="failed">Failed</option>
              <option value="all">All</option>
            </Select>
            <a
              href={adminApi.donationsCsvUrl(status === "all" ? "" : status)}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
            >
              Download CSV
            </a>
          </>
        }
      />
      <p className="mb-4 text-sm text-stone-600">
        {total} donation{total === 1 ? "" : "s"}
        {sum > 0 && <> · <strong>{formatInr(sum)}</strong> received</>}
        {total > items.length && ` (showing the latest ${items.length}; download the CSV for all)`}
      </p>
      {items.length === 0 ? (
        <EmptyState>No donations here yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Donor</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">PAN</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-b border-stone-100 align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-stone-600">{formatDateTime(d.paid_at ?? d.created_at)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{d.donor_name}</p>
                    <p className="text-xs text-stone-500">
                      {d.donor_email}
                      {d.donor_phone && ` · ${d.donor_phone}`}
                    </p>
                    {d.message && <p className="mt-1 max-w-xs text-xs italic text-stone-600">“{d.message}”</p>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">{formatInr(d.amount_paise)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.donor_pan || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{d.razorpay_payment_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return <AdminError />;
}
