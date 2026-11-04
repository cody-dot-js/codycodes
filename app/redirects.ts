/**
 * One permanent redirect, in the shape of `defaultPlugins({ redirects })` in
 * `@ngrok/app-server`. A `*` last segment matches the rest of the path, or nothing.
 */
export type Redirect = { from: `/${string}`; to: `/${string}` };

/** The one redirect table. `server.ts` gives it to the server. */
export const REDIRECTS: Redirect[] = [
	// Why: the 2020 site kept posts under `/blog`. Those posts are gone, so each old URL lands on the post list.
	{ from: "/blog/*", to: "/posts" },
];
