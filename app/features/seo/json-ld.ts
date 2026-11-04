import type { Post } from "~/features/posts/posts.ts";
import { SAME_AS, SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "~/site.ts";

/** A JSON value, as JSON-LD holds it. */
type JsonLdValue = string | number | boolean | null | JsonLd | JsonLdValue[];

/** One JSON-LD node. */
export type JsonLd = { [key: string]: JsonLdValue };

/** The `@id` of each node that other nodes point to. */
export const IDS = {
	person: absoluteUrl("/#person"),
	website: absoluteUrl("/#website"),
	blog: absoluteUrl("/posts#blog"),
} as const;

/** One step of a breadcrumb trail. */
export type Crumb = { name: string; path: string };

/**
 * Cody, the author and publisher of every page.
 *
 * @example
 * personJsonLd(); // => { "@type": "Person", "@id": "https://codycod.es/#person", name: "Cody Price", ... }
 */
export function personJsonLd(): JsonLd {
	return {
		"@type": "Person",
		"@id": IDS.person,
		name: SITE_NAME,
		alternateName: "codydotjs",
		url: absoluteUrl("/"),
		image: absoluteUrl("/cody.jpg"),
		jobTitle: "Staff Product Engineer",
		worksFor: { "@type": "Organization", name: "ngrok", url: "https://ngrok.com" },
		knowsAbout: ["Frontend performance", "Design systems", "React", "Agent tooling"],
		sameAs: SAME_AS,
	};
}

/**
 * The site.
 *
 * @example
 * websiteJsonLd(); // => { "@type": "WebSite", "@id": "https://codycod.es/#website", ... }
 */
export function websiteJsonLd(): JsonLd {
	return {
		"@type": "WebSite",
		"@id": IDS.website,
		name: "codycod.es",
		alternateName: SITE_NAME,
		description: SITE_DESCRIPTION,
		url: absoluteUrl("/"),
		inLanguage: "en-US",
		author: { "@id": IDS.person },
		publisher: { "@id": IDS.person },
	};
}

/**
 * The page itself: a `WebPage`, or a subtype such as `ProfilePage`. Its breadcrumb
 * trail starts at the home page.
 *
 * @example
 * webPageJsonLd({ type: "CollectionPage", name: "Posts", description: "…", path: "/posts", crumbs: [{ name: "Posts", path: "/posts" }] });
 */
export function webPageJsonLd({
	type,
	name,
	description,
	path,
	crumbs,
	image,
	extra = {},
}: {
	type: "WebPage" | "ProfilePage" | "CollectionPage";
	name: string;
	description: string;
	path: string;
	/** The trail after the home page. Empty on the home page. */
	crumbs: Crumb[];
	/** The absolute URL of the page's preview image. */
	image: string;
	/** More fields for this page, such as `mainEntity`. */
	extra?: JsonLd;
}): JsonLd {
	const url = absoluteUrl(path);
	return {
		"@type": type,
		"@id": `${url}#webpage`,
		url,
		name,
		description,
		inLanguage: "en-US",
		isPartOf: { "@id": IDS.website },
		primaryImageOfPage: { "@type": "ImageObject", url: image },
		author: { "@id": IDS.person },
		...(crumbs.length > 0 && {
			breadcrumb: {
				"@type": "BreadcrumbList",
				itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((crumb, index) => ({
					"@type": "ListItem",
					position: index + 1,
					name: crumb.name,
					item: absoluteUrl(crumb.path),
				})),
			},
		}),
		...extra,
	};
}

/** A short reference to a post, for a list. */
function postReference(post: Pick<Post, "title" | "href" | "date">): JsonLd {
	return {
		"@type": "BlogPosting",
		"@id": `${absoluteUrl(post.href)}#blogposting`,
		headline: post.title,
		url: absoluteUrl(post.href),
		datePublished: post.date,
	};
}

/**
 * The blog: every post, newest first.
 *
 * @example
 * blogJsonLd(posts); // => { "@type": "Blog", blogPost: [{ "@type": "BlogPosting", ... }] }
 */
export function blogJsonLd(posts: Pick<Post, "title" | "href" | "date">[]): JsonLd {
	return {
		"@type": "Blog",
		"@id": IDS.blog,
		name: `${SITE_NAME}'s posts`,
		url: absoluteUrl("/posts"),
		inLanguage: "en-US",
		author: { "@id": IDS.person },
		publisher: { "@id": IDS.person },
		isPartOf: { "@id": IDS.website },
		blogPost: posts.map((post) => postReference(post)),
	};
}

/**
 * A list of posts, for a tag page.
 *
 * @example
 * postListJsonLd(posts); // => { "@type": "ItemList", itemListElement: [{ position: 1, ... }] }
 */
export function postListJsonLd(posts: Pick<Post, "title" | "href" | "date">[]): JsonLd {
	return {
		"@type": "ItemList",
		numberOfItems: posts.length,
		itemListElement: posts.map((post, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(post.href),
			name: post.title,
		})),
	};
}

/**
 * One post, with its image, its loop, its dates, and its word count.
 *
 * @example
 * blogPostingJsonLd({ post, wordCount: 900, image: "https://codycod.es/og.jpg" });
 */
export function blogPostingJsonLd({
	post,
	wordCount,
	image,
}: {
	post: Pick<Post, "title" | "description" | "href" | "date" | "updated" | "tags" | "video">;
	wordCount: number;
	/** The absolute URL of the post's preview image. */
	image: string;
}): JsonLd {
	const url = absoluteUrl(post.href);
	return {
		"@type": "BlogPosting",
		"@id": `${url}#blogposting`,
		headline: post.title,
		description: post.description,
		url,
		image: { "@type": "ImageObject", url: image, width: 1600, height: 900 },
		datePublished: post.date,
		dateModified: post.updated ?? post.date,
		inLanguage: "en-US",
		keywords: post.tags,
		wordCount,
		author: { "@id": IDS.person },
		publisher: { "@id": IDS.person },
		isPartOf: { "@id": IDS.blog },
		mainEntityOfPage: { "@id": `${url}#webpage` },
		...(post.video != null && {
			video: {
				"@type": "VideoObject",
				name: post.title,
				description: post.description,
				thumbnailUrl: image,
				contentUrl: absoluteUrl(post.video),
				uploadDate: post.date,
			},
		}),
	};
}
