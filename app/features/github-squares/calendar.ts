/** The path of the server route that sends the fresh days, as JSON. `server.ts` serves it. */
export const CONTRIBUTIONS_PATH = "/github-contributions.json";

/**
 * The day of the week of a `YYYY-MM-DD` date, from 0 for Sunday to 6 for
 * Saturday. A graph column is one week, from Sunday down to Saturday.
 *
 * @example
 * weekday("2026-11-04"); // => 3
 */
export function weekday(date: string) {
	return new Date(`${date}T00:00:00Z`).getUTCDay();
}
