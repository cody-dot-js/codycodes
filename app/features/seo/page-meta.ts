import type { MetaDescriptor } from "react-router";

import { SITE_NAME, X_HANDLE, absoluteUrl } from "~/site.ts";

type PageMetaOptions = {
	/** The page title, without the site name. Omit it on the home page. */
	title?: string;
	description: string;
	/** The canonical URL path, such as `/posts`. */
	path: string;
	/** `article` for a post. Default `website`. */
	type?: "article" | "website";
	/** Extra head tags for this page, such as the markdown twin link. */
	extra?: MetaDescriptor[];
};

/**
 * Makes the head tags that every page needs: the title, the description, the
 * canonical link, and the Open Graph and X card tags.
 *
 * @example
 * pageMeta({ title: "Posts", description: "Every post.", path: "/posts" });
 * // => [{ title: "Posts · Cody Price" }, { name: "description", ... }, ...]
 */
export function pageMeta({
	title,
	description,
	path,
	type = "website",
	extra = [],
}: PageMetaOptions) {
	const fullTitle = title == null ? SITE_NAME : `${title} · ${SITE_NAME}`;
	const url = absoluteUrl(path);
	return [
		{ title: fullTitle },
		{ name: "description", content: description },
		{ tagName: "link", rel: "canonical", href: url },
		{ property: "og:site_name", content: SITE_NAME },
		{ property: "og:type", content: type },
		{ property: "og:title", content: title ?? SITE_NAME },
		{ property: "og:description", content: description },
		{ property: "og:url", content: url },
		{ name: "twitter:card", content: "summary" },
		{ name: "twitter:creator", content: `@${X_HANDLE}` },
		...extra,
	] satisfies MetaDescriptor[];
}
