// React Router (ssr:false) requires every route with a build-time `loader` to have at least
// one pre-rendered path. When a section has no items yet (e.g. no events), we pre-render
// this placeholder slug instead; it renders a "not found" message and is never linked.
export const PLACEHOLDER_SLUG = "_";
