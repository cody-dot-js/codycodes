import { requestContext } from "@ngrok/app-server";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";

export const streamTimeout = 5000;

/**
 * Renders a page that the build did not prerender, such as a 404. It passes
 * the CSP nonce, which the server makes for each request, to each inline
 * script of the render.
 */
export default async function handleRequest(
	request: Request,
	status: number,
	headers: Headers,
	routerContext: EntryContext,
) {
	if (request.method.toUpperCase() === "HEAD") {
		return new Response(null, { status, headers });
	}
	const context = requestContext();
	const nonce = context?.cspNonce;
	let responseStatus = status;
	// Why two forms: the prerender pass has no nonce, and the prop takes no `undefined`.
	const router =
		nonce == null ? (
			<ServerRouter context={routerContext} url={request.url} />
		) : (
			<ServerRouter context={routerContext} url={request.url} nonce={nonce} />
		);
	const body = await renderToReadableStream(router, {
		...(nonce != null && { nonce }),
		// Why the extra second: the render gets time to flush the rejected boundaries before the abort.
		signal: AbortSignal.timeout(streamTimeout + 1000),
		onError(error: unknown) {
			responseStatus = 500;
			context?.logger.error("render failed", { error: String(error) });
		},
	});
	const userAgent = request.headers.get("user-agent");
	// Why: a crawler and the prerender pass get the whole page, with every Suspense boundary in the HTML.
	if ((userAgent != null && isbot(userAgent)) || routerContext.isSpaMode) {
		await body.allReady;
	}
	headers.set("Content-Type", "text/html; charset=utf-8");
	return new Response(body, { headers, status: responseStatus });
}
