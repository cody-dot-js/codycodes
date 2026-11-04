// Why mini: the browser checks the fresh days with this schema, and mini adds less to its bundle.
import { z } from "zod/mini";

/** A day's shade on the graph: 0 for no contributions, up to 4 for GitHub's top band. */
const levelSchema = z.enum(["0", "1", "2", "3", "4"]);

const daysSchema = z
	.array(
		z.strictObject({
			/** The day, as `YYYY-MM-DD`. */
			date: z.iso.date(),
			/** The shade that GitHub gives the day. */
			level: levelSchema,
			/** The number of contributions on the day. */
			count: z.int().check(z.minimum(0)),
		}),
	)
	.check(
		z.minLength(1, {
			error: "GitHub's contribution page has no days. Its markup may have changed.",
		}),
	);

/** One day on the contribution graph. */
export type ContributionDay = z.infer<typeof daysSchema>[number];

/** A shade on the contribution graph. */
export type ContributionLevel = z.infer<typeof levelSchema>;

/** The value of one HTML attribute in a tag's source. */
function attribute(tag: string, name: string) {
	return new RegExp(`\\s${name}="(?<value>[^"]*)"`, "u").exec(tag)?.groups?.value;
}

/** The count in a day's tooltip, such as "22 contributions on November 16th.". */
function tooltipCount(text: string) {
	const count = /^(?<count>No|[\d,]+) contributions? on /u.exec(text)?.groups?.count;
	if (count == null) {
		return null;
	}
	return count === "No" ? 0 : Number(count.replaceAll(",", ""));
}

/**
 * Reads the days from GitHub's public contribution page
 * (`github.com/users/<name>/contributions`), oldest first. Throws when the
 * page has no days or a day that does not parse, so a markup change stops the
 * build.
 *
 * @example
 * parseContributions(html); // => [{ date: "2025-11-02", level: "0", count: 0 }, …]
 */
export function parseContributions(html: string): ContributionDay[] {
	const counts = new Map<string, number | null>();
	for (const match of html.matchAll(
		/<tool-tip\b(?<attributes>[^>]*)>(?<text>[^<]*)<\/tool-tip>/gu,
	)) {
		const { attributes = "", text = "" } = match.groups ?? {};
		counts.set(attribute(attributes, "for") ?? "", tooltipCount(text));
	}
	const days = Array.from(
		html.matchAll(/<td\b[^>]*\bContributionCalendar-day\b[^>]*>/gu),
		([tag]) => ({
			date: attribute(tag, "data-date"),
			level: attribute(tag, "data-level"),
			count: counts.get(attribute(tag, "id") ?? ""),
		}),
	);
	return daysSchema.parse(days).toSorted((first, second) => first.date.localeCompare(second.date));
}

/**
 * Checks the days that the browser gets from the server route. Returns
 * `null` when the JSON is not a list of days, so the page keeps the days it has.
 *
 * @example
 * toContributionDays(await response.json()); // => [{ date: "2025-11-02", level: "0", count: 0 }, …]
 */
export function toContributionDays(json: unknown) {
	const result = daysSchema.safeParse(json);
	return result.success ? result.data : null;
}
