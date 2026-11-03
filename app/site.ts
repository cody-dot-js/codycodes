/** The canonical origin. Every absolute URL on the site, feed, and twin starts with it. */
export const SITE_ORIGIN = "https://codycod.es";

/** The site name, for titles and feeds. */
export const SITE_NAME = "Cody Price";

/** The one-line description, for the home page, the feed, and `llms.txt`. */
export const SITE_DESCRIPTION =
	"Staff frontend engineer at ngrok. Frontend performance, design systems, and agent tooling.";

/** The X handle, without the `@`. */
export const X_HANDLE = "codydotjs";

/**
 * Makes an absolute URL on the canonical origin.
 *
 * @example
 * absoluteUrl("/posts/hello"); // => "https://codycod.es/posts/hello"
 */
export function absoluteUrl(path: string) {
	return new URL(path, SITE_ORIGIN).href;
}
