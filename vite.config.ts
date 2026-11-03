import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		// Why 600: three.js in the shrimp tank is one 546 kB chunk (139 kB gzip). It loads after the
		// first paint, so its size does not block a page. Each other chunk stays far below the default.
		chunkSizeWarningLimit: 600,
	},
	plugins: [
		//,
		tailwindcss(),
		mdx({
			// Why: compile only `.mdx`, so a `?raw` import of another file stays a string.
			include: /\.mdx$/u,
			// Why `frontmatter` export: `posts.server.ts` reads it with `import.meta.glob`.
			remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
			rehypePlugins: [rehypeSlug],
		}),
		reactRouter(),
	],
	resolve: {
		// Why an alias as well as `tsconfigPaths`: MDX posts sit outside the tsconfig `include`.
		alias: { "~": "/app" },
		tsconfigPaths: true,
	},
	preview: {
		// Why: the prerender pass requests 127.0.0.1. Without this pin, Linux binds `localhost` to
		// IPv6 only, and the build fails with ECONNREFUSED.
		host: "127.0.0.1",
	},
});
