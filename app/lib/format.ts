// Dates are stored in UTC; show them in Indian Standard Time for visitors and staff.
// Strings are assembled from parts so the build (Node) and the browser produce exactly the
// same text — different ICU versions word "toLocaleString" output differently, which would
// break React hydration of the pre-rendered pages.
const TZ = "Asia/Kolkata";

const dateParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function parts(iso: string) {
  const p = Object.fromEntries(
    dateParts.formatToParts(new Date(iso)).map((x) => [x.type, x.value]),
  ) as Record<string, string>;
  return { day: p.day, month: p.month, year: p.year, time: `${p.hour}:${p.minute}` };
}

/** "23 November 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const p = parts(iso);
  return `${p.day} ${p.month} ${p.year}`;
}

/** "10 January 2099, 09:00" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const p = parts(iso);
  return `${p.day} ${p.month} ${p.year}, ${p.time}`;
}

/** "₹1,234.00" (Indian digit grouping) */
export function formatInr(paise: number | null | undefined): string {
  const rupees = (paise ?? 0) / 100;
  const [whole, frac] = rupees.toFixed(2).split(".");
  // Indian grouping: last 3 digits, then groups of 2
  const grouped = whole.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
  return `₹${grouped}.${frac}`;
}
