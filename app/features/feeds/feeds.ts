import type { Post } from "~/features/posts/posts.ts";
import { TAGS } from "~/features/posts/tags.ts";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "~/site.ts";

/** The pages that are not posts, in sitemap order. */
const PAGES = ["/", "/posts", "/about", "/now", ...TAGS.map((tag) => `/posts/tags/${tag}`)];

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
<pubDate>${rssDate(post.date)}</pubDate>
${post.tags.map((tag) => `<category>${tag}</category>`).join("\n")}
</item>`,
	);
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(SITE_NAME)}</title>
<link>${absoluteUrl("/")}</link>
<description>${escapeXml(SITE_DESCRIPTION)}</description>
<language>en-US</language>
<atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml"/>
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
 * llmsTxt(posts); // => "# Cody Price\n\n> Staff frontend engineer at ngrok. ..."
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
- [RSS](${absoluteUrl("/rss.xml")}): the feed of every post.
`;
}

/**
 * Makes `sitemap.xml` for the pages and the posts.
 *
 * @example
 * sitemap(posts); // => '<?xml version="1.0" encoding="UTF-8"?><urlset ...>'
 */
export function sitemap(posts: Post[]) {
	const urls = [
		...PAGES.map((path) => `<url><loc>${absoluteUrl(path)}</loc></url>`),
		...posts.map(
			(post) =>
				`<url><loc>${absoluteUrl(post.href)}</loc><lastmod>${post.updated ?? post.date}</lastmod></url>`,
		),
	];
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
