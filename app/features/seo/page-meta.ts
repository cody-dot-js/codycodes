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
	/** The link-preview image: a path on this site and its alt text. Without it, the preview has no image. */
	image?: { src: string; alt: string } | undefined;
	/** A 1280x720 MP4 loop of the image, for the platforms that play `og:video`. X shows the image. */
	video?: string | undefined;
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
	image,
	video,
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
		...(image == null
			? [{ name: "twitter:card", content: "summary" }]
			: [
					{ property: "og:image", content: absoluteUrl(image.src) },
					{ property: "og:image:alt", content: image.alt },
					{ name: "twitter:card", content: "summary_large_image" },
					{ name: "twitter:image:alt", content: image.alt },
				]),
		...(video == null
			? []
			: [
					{ property: "og:video", content: absoluteUrl(video) },
					{ property: "og:video:type", content: "video/mp4" },
					{ property: "og:video:width", content: "1280" },
					{ property: "og:video:height", content: "720" },
				]),
		{ name: "twitter:creator", content: `@${X_HANDLE}` },
		...extra,
	] satisfies MetaDescriptor[];
}
