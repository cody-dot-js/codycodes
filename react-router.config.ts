import type { Config } from "@react-router/dev/config";

import { TAGS } from "./app/features/posts/tags.ts";

export default {
	// Why a server: `@ngrok/app-server` serves each page through one pipeline, for the headers, the
	// redirects, and the markdown twins. Each known page is still prerendered at build time.
	ssr: true,
	prerender: ({ getStaticPaths }) => [
		...getStaticPaths(),
		...TAGS.map((tag) => `/posts/tags/${tag}`),
	],
} satisfies Config;
