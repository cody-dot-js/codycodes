import type { MetaDescriptor } from "react-router";

import { SITE_IMAGE, SITE_NAME, absoluteUrl } from "~/site.ts";

import type { Crumb, JsonLd } from "./json-ld.ts";
import { personJsonLd, webPageJsonLd, websiteJsonLd } from "./json-ld.ts";

/** What search engines may show from an indexed page: a large image, and snippets and previews of any length. */
const INDEX_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

type PageMetaOptions = {
	/** The page title, without the site name. Omit it on the home page. */
	title?: string;
	description: string;
	/** The canonical URL path, such as `/posts`. */
	path: string;
	/** `article` for a post. Default `website`. */
	type?: "article" | "website";
	/** The schema.org type of the page. Default `WebPage`. */
	pageType?: "WebPage" | "ProfilePage" | "CollectionPage";
	/** The breadcrumb trail after the home page. Default none. */
	crumbs?: Crumb[];
	/** The 1600x900 preview card: a path on this site and its alt text. Default the site card. */
	image?: { src: string; alt: string } | undefined;
	/** A 1280x720 MP4 loop of the image, for the platforms that play `og:video`. X shows the image. */
	video?: string | undefined;
	/** More fields for the page's JSON-LD node, such as `mainEntity`. */
	pageSchema?: JsonLd;
	/** More JSON-LD nodes for the page's graph, such as the `BlogPosting`. */
	schema?: JsonLd[];
	/** Keeps the page out of search, with no JSON-LD. */
	noindex?: boolean;
	/** Extra head tags for this page, such as the markdown twin link. */
	extra?: MetaDescriptor[];
};

/**
 * Makes the head tags of one page: the title, the description, and the canonical
 * URL for search, Open Graph, and X; the preview card; the robots rules; and a
 * JSON-LD graph of the site, Cody, the page, and its own nodes. The tags that
 * are the same on every page are in `root.tsx`.
 *
 * @example
 * pageMeta({ title: "Posts", description: "Every post.", path: "/posts", pageType: "CollectionPage" });
 * // => [{ title: "Posts · Cody Price" }, { name: "description", ... }, ..., { "script:ld+json": { "@graph": [...] } }]
 */
export function pageMeta({
	title,
	description,
	path,
	type = "website",
	pageType = "WebPage",
	crumbs = [],
	image = SITE_IMAGE,
	video,
	pageSchema,
	schema = [],
	noindex = false,
	extra = [],
}: PageMetaOptions) {
	const fullTitle = title == null ? SITE_NAME : `${title} · ${SITE_NAME}`;
	const url = absoluteUrl(path);
	const imageUrl = absoluteUrl(image.src);
	const tags: MetaDescriptor[] = [
		{ title: fullTitle },
		{ property: "og:title", content: title ?? SITE_NAME },
		{ name: "twitter:title", content: title ?? SITE_NAME },
		{ name: "description", content: description },
		{ property: "og:description", content: description },
		{ name: "twitter:description", content: description },
		// Why not on a noindex page: a canonical asks search to index the URL.
		...(noindex
			? []
			: [
					{ tagName: "link", rel: "canonical", href: url },
					{ property: "og:url", content: url },
				]),
		{ property: "og:type", content: type },
		{ property: "og:image", content: imageUrl },
		{ property: "og:image:type", content: image.src.endsWith(".png") ? "image/png" : "image/jpeg" },
		{ property: "og:image:width", content: "1600" },
		{ property: "og:image:height", content: "900" },
		{ property: "og:image:alt", content: image.alt },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:image", content: imageUrl },
		{ name: "twitter:image:alt", content: image.alt },
		...(video == null
			? []
			: [
					{ property: "og:video", content: absoluteUrl(video) },
					{ property: "og:video:secure_url", content: absoluteUrl(video) },
					{ property: "og:video:type", content: "video/mp4" },
					{ property: "og:video:width", content: "1280" },
					{ property: "og:video:height", content: "720" },
				]),
		{ name: "robots", content: noindex ? "noindex, follow" : INDEX_ROBOTS },
		...extra,
	];
	if (noindex) {
		return tags;
	}
	const page = webPageJsonLd({
		type: pageType,
		name: title ?? SITE_NAME,
		description,
		path,
		crumbs,
		image: imageUrl,
		...(pageSchema != null && { extra: pageSchema }),
	});
	return [
		...tags,
		{
			"script:ld+json": {
				"@context": "https://schema.org",
				"@graph": [websiteJsonLd(), personJsonLd(), page, ...schema],
			},
		},
	];
}
