/**
 * One permanent redirect. The shape matches `defaultPlugins({ redirects })` in
 * `@ngrok/app-server`, so the move to the server passes this table as it is.
 * A `*` last segment matches the rest of the path, or nothing.
 */
export type Redirect = { from: `/${string}`; to: `/${string}` };

/**
 * The one redirect table. `vercel.json` must match it, and
 * `redirects.test.ts` fails when the two drift.
 */
export const REDIRECTS: Redirect[] = [
	// Why: the 2020 site kept posts under `/blog`. Those posts are gone, so each old URL lands on the post list.
	{ from: "/blog/*", to: "/posts" },
];

/** One entry of `redirects` in `vercel.json`. */
export type VercelRedirect = { source: string; destination: string; permanent: true };

/**
 * Converts a rule to the `vercel.json` form: a `*` last segment becomes `:path*`.
 *
 * @example
 * toVercelRedirect({ from: "/blog/*", to: "/posts" });
 * // => { source: "/blog/:path*", destination: "/posts", permanent: true }
 */
export function toVercelRedirect({ from, to }: Redirect): VercelRedirect {
	return {
		source: from.replace(/\/\*$/u, "/:path*"),
		destination: to.replace(/\/\*$/u, "/:path*"),
		permanent: true,
	};
}
