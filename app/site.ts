/** The canonical origin. Every absolute URL on the site, feed, and twin starts with it. */
export const SITE_ORIGIN = "https://codycod.es";

/** The site name, for titles and feeds. */
export const SITE_NAME = "Cody Price";

/** The one-line description, for the home page, the feed, and `llms.txt`. */
export const SITE_DESCRIPTION =
	"Staff product engineer at ngrok. Frontend performance, design systems, and agent tooling.";

/** The X handle, without the `@`. */
export const X_HANDLE = "codydotjs";

/** Cody's profiles on other sites. Search engines use them to tie the author to one identity. */
export const SAME_AS = [`https://x.com/${X_HANDLE}`, "https://github.com/cody-dot-js"];

/** The site's link-preview card: 1600x900, like every post card. */
export const SITE_IMAGE = {
	src: "/og.jpg",
	alt: 'A dark deep-sea card that reads "cody price, shrimpfluencer." over a line about frontend perf, design systems, and agent tooling, with a dithered pink shrimp in the top right.',
};

/**
 * Makes an absolute URL on the canonical origin.
 *
 * @example
 * absoluteUrl("/posts/hello"); // => "https://codycod.es/posts/hello"
 */
export function absoluteUrl(path: string) {
	return new URL(path, SITE_ORIGIN).href;
}
