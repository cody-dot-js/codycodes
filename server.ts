import { createServer, defaultPlugins, withHeaderHook } from "@ngrok/app-server";
import type { Plugin } from "@ngrok/app-server";

import { REDIRECTS } from "./app/redirects.ts";

/** Turns off the browser features that no page here uses. `securityHeaders` has no option for this header. */
const permissionsPolicy: Plugin = {
	name: "permissions-policy",
	middleware: async (context, next) =>
		withHeaderHook(context, next, (headers) => {
			headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
		}),
};

/**
 * The CSP of each HTML document. `scriptSrc` trusts the document's own scripts:
 * a nonce on a rendered page, the inline script hashes on a prerendered one.
 * - `style-src 'unsafe-inline'`: Shiki colors and React `style` props are inline styles.
 * - `img-src data:`: the swimming tab icon is a data URL for each frame.
 * - `font-src data:`: the build inlines a small font file as a data URL.
 * - `font-src assets.ngrok.com`: the fonts of mantle's CSS in a post's demo.
 */
function documentPolicy(scriptSrc: string) {
	return [
		"default-src 'self'",
		`script-src ${scriptSrc}`,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data:",
		"font-src 'self' data: https://assets.ngrok.com",
		"media-src 'self'",
		"connect-src 'self'",
		"frame-src 'self'",
		"object-src 'none'",
		"base-uri 'none'",
		"form-action 'self'",
	].join("; ");
}

export default createServer({
	plugins: defaultPlugins({
		redirects: REDIRECTS,
		// Why preview only: a preview deploy must stay out of search. Production and a local serve do not.
		noindex: process.env.VERCEL_ENV === "preview",
		// Why: an agent that sends `Accept: text/markdown` to a post gets its `.md` twin.
		prerendered: { markdownTwins: true },
		securityHeaders: {
			// Why 'self': a post frames its own demo page, and no other site may frame a page here.
			headers: { "Content-Security-Policy": "frame-ancestors 'self'" },
		},
		contentSecurityPolicy: { policy: documentPolicy },
		beforeStatic: [permissionsPolicy],
	}),
});
