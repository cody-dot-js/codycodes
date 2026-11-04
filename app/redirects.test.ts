import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { REDIRECTS, toVercelRedirect } from "./redirects.ts";

describe("the redirect table", () => {
	it("matches the redirects in vercel.json", () => {
		const config: unknown = JSON.parse(readFileSync("vercel.json", "utf8"));

		expect(config).toMatchObject({ redirects: REDIRECTS.map((rule) => toVercelRedirect(rule)) });
	});
});

describe("toVercelRedirect", () => {
	it("turns a trailing `*` into `:path*`", () => {
		expect(toVercelRedirect({ from: "/blog/*", to: "/posts" })).toStrictEqual({
			source: "/blog/:path*",
			destination: "/posts",
			permanent: true,
		});
	});
});
