import { data } from "react-router";

import { ApiError } from "./api";
import { PLACEHOLDER_SLUG } from "./placeholder";

/** Turn an API 404 into a proper "Page not found" for the route's error boundary. */
export async function notFoundOn404<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      throw data("Not found", { status: 404 });
    }
    throw e;
  }
}

/** Load one item by slug; the build-time placeholder slug yields null (rendered as "not found"). */
export function loadBySlug<T>(slug: string, fetchItem: (slug: string) => Promise<T>): Promise<T | null> {
  if (slug === PLACEHOLDER_SLUG) return Promise.resolve(null);
  return notFoundOn404(fetchItem(slug));
}
