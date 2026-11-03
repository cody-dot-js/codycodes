import { copyFile } from "node:fs/promises";
import { join } from "node:path";

import type { Config } from "@react-router/dev/config";

import { TAGS } from "./app/features/posts/tags.ts";

export default {
	// Why static: every page is known at build time. The output is plain files, so any static host
	// serves it. `docs/app-server.md` has the plan for a server.
	ssr: false,
	prerender: ({ getStaticPaths }) => [
		...getStaticPaths(),
		...TAGS.map((tag) => `/posts/tags/${tag}`),
		"/404",
	],
	async buildEnd({ reactRouterConfig }) {
		// Why: a static host sends `404.html` with status 404 for a path that has no file.
		const client = join(reactRouterConfig.buildDirectory, "client");
		await copyFile(join(client, "404/index.html"), join(client, "404.html"));
	},
} satisfies Config;
