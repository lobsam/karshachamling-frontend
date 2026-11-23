import { data } from "react-router";

import { ApiError } from "./api";

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
