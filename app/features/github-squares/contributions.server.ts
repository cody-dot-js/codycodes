import { GITHUB_HANDLE } from "~/site.ts";

import { parseContributions } from "./contributions.ts";

const CONTRIBUTIONS_URL = `https://github.com/users/${GITHUB_HANDLE}/contributions`;

/**
 * Gets the last year of contributions from GitHub's public contribution page.
 * No token is needed. Throws when GitHub does not answer with the page.
 *
 * @example
 * await fetchContributions(); // => [{ date: "2025-11-02", level: "0", count: 0 }, …]
 */
export async function fetchContributions() {
	const response = await fetch(CONTRIBUTIONS_URL, {
		headers: { "User-Agent": "codydotjs.dev build" },
	});
	if (!response.ok) {
		throw new Error(`${CONTRIBUTIONS_URL} answered ${response.status}.`);
	}
	return parseContributions(await response.text());
}
