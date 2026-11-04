import type { Post } from "~/features/posts/posts.ts";
import { TAGS } from "~/features/posts/tags.ts";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "~/site.ts";

/** The date a post last changed. */
function modified(post: Post) {
	return post.updated ?? post.date;
}

/** The newest change among the posts, or `undefined` with none. */
function newest(posts: Post[]) {
	return posts
		.map((post) => modified(post))
		.toSorted()
		.at(-1);
}

const XML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&apos;",
};

function escapeXml(text: string) {
	return text.replaceAll(/[&<>"']/gu, (character) => XML_ESCAPES[character] ?? character);
}

/** The RFC 822 date that RSS needs, at noon UTC, so no time zone moves it to another day. */
function rssDate(isoDate: string) {
	return new Date(`${isoDate}T12:00:00Z`).toUTCString();
}

/**
 * Makes the RSS 2.0 feed of every post, newest first.
 *
 * @example
 * rssFeed(posts); // => '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0">...'
 */
export function rssFeed(posts: Post[]) {
	const items = posts.map(
		(post) => `<item>
<title>${escapeXml(post.title)}</title>
<link>${absoluteUrl(post.href)}</link>
<guid isPermaLink="true">${absoluteUrl(post.href)}</guid>
<description>${escapeXml(post.description)}</description>
<dc:creator>${escapeXml(SITE_NAME)}</dc:creator>
<pubDate>${rssDate(post.date)}</pubDate>
${post.tags.map((tag) => `<category>${tag}</category>`).join("\n")}
</item>`,
	);
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${escapeXml(SITE_NAME)}</title>
<link>${absoluteUrl("/")}</link>
<description>${escapeXml(SITE_DESCRIPTION)}</description>
<language>en-US</language>
${posts.length > 0 ? `<lastBuildDate>${rssDate(newest(posts) ?? "")}</lastBuildDate>\n` : ""}<atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml"/>
${items.join("\n")}
</channel>
</rss>
`;
}

/**
 * Makes `llms.txt`: what the site is, and a link to the markdown twin of each post.
 * See https://llmstxt.org.
 *
 * @example
 * llmsTxt(posts); // => "# Cody Price\n\n> Staff product engineer at ngrok. ..."
 */
export function llmsTxt(posts: Post[]) {
	const list =
		posts.length === 0
			? "No posts yet."
			: posts
					.map(
						(post) => `- [${post.title}](${absoluteUrl(post.markdownHref)}): ${post.description}`,
					)
					.join("\n");
	return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Each post has a markdown twin at its URL plus \`.md\`. The site copy is the dated original. Copies on X link back to it.

## Posts

${list}

## Pages

- [About](${absoluteUrl("/about")}): who Cody is.
- [Now](${absoluteUrl("/now")}): what Cody is shipping this month.
- [Who is Nug?](${absoluteUrl("/nug")}): the shrimp who leaves the side notes in posts.
- [RSS](${absoluteUrl("/rss.xml")}): the feed of every post.

## Optional

- [Every post in full](${absoluteUrl("/llms-full.txt")}): the markdown of every post in one file.
`;
}

/** One sitemap URL, with the date it last changed and its preview image when it has them. */
function sitemapUrl({
	path,
	lastmod,
	image,
}: {
	path: string;
	lastmod?: string | undefined;
	image?: string | undefined;
}) {
	const parts = [
		`<loc>${absoluteUrl(path)}</loc>`,
		lastmod == null ? "" : `<lastmod>${lastmod}</lastmod>`,
		image == null ? "" : `<image:image><image:loc>${absoluteUrl(image)}</image:loc></image:image>`,
	];
	return `<url>${parts.join("")}</url>`;
}

/**
 * Makes `sitemap.xml` for the pages and the posts. A list page changes when a
 * post in it does, so it takes the newest post's date.
 *
 * @example
 * sitemap(posts); // => '<?xml version="1.0" encoding="UTF-8"?><urlset ...>'
 */
export function sitemap(posts: Post[]) {
	const urls = [
		sitemapUrl({ path: "/", lastmod: newest(posts) }),
		sitemapUrl({ path: "/posts", lastmod: newest(posts) }),
		sitemapUrl({ path: "/about" }),
		sitemapUrl({ path: "/now" }),
		sitemapUrl({ path: "/nug" }),
		// Why only tags with posts: an empty tag page is noindex.
		...TAGS.filter((tag) => posts.some((post) => post.tags.includes(tag))).map((tag) =>
			sitemapUrl({
				path: `/posts/tags/${tag}`,
				lastmod: newest(posts.filter((post) => post.tags.includes(tag))),
			}),
		),
		...posts.map((post) =>
			sitemapUrl({ path: post.href, lastmod: modified(post), image: post.image?.src }),
		),
	];
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>
`;
}
