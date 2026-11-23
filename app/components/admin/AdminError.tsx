import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { ApiError, errorMessage } from "../../lib/api";

/** Error shown inside the admin layout (sidebar stays), used by every admin screen. */
export function AdminError() {
  const error = useRouteError();
  const status = error instanceof ApiError ? error.status : isRouteErrorResponse(error) ? error.status : 0;
  const message =
    status === 403
      ? "This page is only for admins."
      : status === 404
        ? "This item doesn't exist. It may have been deleted."
        : error instanceof ApiError
          ? errorMessage(error)
          : "Something went wrong. Check your connection and try again.";
  return (
    <div className="max-w-lg rounded-xl bg-white p-8 shadow-sm">
      <h1 className="font-serif text-3xl text-maroon-900">{status === 404 ? "Not found" : "Can't open this page"}</h1>
      <p className="mt-2 text-stone-600">{message}</p>
      <Link to="/admin" className="mt-6 inline-block text-sm text-maroon-700 hover:underline">
        ← Back to the dashboard
      </Link>
    </div>
  );
}
