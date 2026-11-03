// Serves `build/client` the way the static host does: a path maps to its file, then to
// `<path>/index.html`, else `404.html` with status 404. `vite preview` falls back to the home page
// for `/about`, so it hides a broken page.

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(import.meta.dirname, "..", "build", "client");
const port = Number(process.env.PORT ?? "4173");

const CONTENT_TYPES: Record<string, string> = {
	".css": "text/css; charset=utf-8",
	".data": "text/x-script",
	".html": "text/html; charset=utf-8",
	".ico": "image/x-icon",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json",
	".md": "text/markdown; charset=utf-8",
	".png": "image/png",
	".txt": "text/plain; charset=utf-8",
	".woff2": "font/woff2",
	".xml": "application/xml; charset=utf-8",
};

/** Finds the file for a URL path, or `null` when the build has none. */
async function resolveFile(pathname: string) {
	const safePath = normalize(decodeURIComponent(pathname)).replace(/^(?:\.\.[/\\])+/u, "");
	const candidates = [join(root, safePath), join(root, safePath, "index.html")];
	const infos = await Promise.all(
		candidates.map(async (candidate) => stat(candidate).catch(() => null)),
	);
	return candidates.find((_, index) => infos[index]?.isFile() === true) ?? null;
}

async function respond(request: IncomingMessage, response: ServerResponse) {
	const url = URL.parse(request.url ?? "/", "http://localhost");
	const file = await resolveFile(url?.pathname ?? "/");
	const target = file ?? join(root, "404.html");
	response.writeHead(file == null ? 404 : 200, {
		"Content-Type": CONTENT_TYPES[extname(target)] ?? "application/octet-stream",
	});
	createReadStream(target).pipe(response);
}

const server = createServer((request, response) => {
	void respond(request, response);
});

server.listen(port, "127.0.0.1", () => {
	process.stdout.write(`Serving build/client at http://127.0.0.1:${port}\n`);
});
