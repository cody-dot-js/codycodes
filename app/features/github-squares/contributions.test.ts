import { describe, expect, it } from "vitest";

import { parseContributions } from "./contributions.ts";

/** One day of GitHub's markup: the cell, then its tooltip. */
function day({
	ix,
	date,
	level,
	tooltip,
}: {
	ix: number;
	date: string;
	level: number;
	tooltip: string;
}) {
	return `<td tabindex="0" data-ix="${ix}" aria-selected="false" style="width: 10px" data-date="${date}" id="contribution-day-component-0-${ix}" data-level="${level}" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>
<tool-tip style="pointer-events: none;" id="tooltip-${ix}" for="contribution-day-component-0-${ix}" popover="manual" data-direction="n" data-type="label" data-view-component="true" class="sr-only position-absolute">${tooltip}</tool-tip>`;
}

describe("parseContributions", () => {
	it("reads each day's date, shade, and count, oldest first", () => {
		const html = [
			day({ ix: 1, date: "2025-11-09", level: 4, tooltip: "1,204 contributions on November 9th." }),
			day({ ix: 0, date: "2025-11-02", level: 0, tooltip: "No contributions on November 2nd." }),
			day({ ix: 2, date: "2025-11-16", level: 1, tooltip: "1 contribution on November 16th." }),
		].join("\n");

		expect(parseContributions(html)).toStrictEqual([
			{ date: "2025-11-02", level: "0", count: 0 },
			{ date: "2025-11-09", level: "4", count: 1204 },
			{ date: "2025-11-16", level: "1", count: 1 },
		]);
	});

	it("stops on a page with no days", () => {
		expect(() => parseContributions("<html></html>")).toThrow(
			"GitHub's contribution page has no days",
		);
	});

	it("stops on a tooltip that it cannot read", () => {
		const html = day({ ix: 0, date: "2025-11-02", level: 0, tooltip: "Nothing on November 2nd." });

		expect(() => parseContributions(html)).toThrow(/"count"/u);
	});
});
