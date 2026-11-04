import { useEffect, useState } from "react";

import { GITHUB_HANDLE } from "~/site.ts";

import { CONTRIBUTIONS_PATH, weekday } from "./calendar.ts";
import type { ContributionDay, ContributionLevel } from "./contributions.ts";

/** Each shade in blush, the shrimp's pink. Teal is for "after" only, so the squares are not green. */
const LEVEL_CLASSES: Record<ContributionLevel, string> = {
	"0": "bg-label/8",
	"1": "bg-blush/25",
	"2": "bg-blush/50",
	"3": "bg-blush/75",
	"4": "bg-blush",
};

/** Gets the fresh days from the server route. Returns `null` for a bad answer. */
async function fetchFreshDays(signal: AbortSignal) {
	const response = await fetch(CONTRIBUTIONS_PATH, { signal });
	if (!response.ok) {
		return null;
	}
	// Why a dynamic import: zod loads after the first paint, not with the page.
	const { toContributionDays } = await import("./contributions.ts");
	return toContributionDays(await response.json());
}

/**
 * Cody's GitHub contribution graph in the abyss colors: one column for each
 * week, Sunday at the top. The prerendered HTML has the days from the build.
 * After the first paint, the page gets the fresh days from the server and
 * draws them in the same box. When that request fails, it keeps the days from
 * the build. Hover a square to read its day and count.
 *
 * @example
 * <GithubSquares initialDays={[{ date: "2026-11-04", level: "2", count: 9 }]} />
 */
export function GithubSquares({ initialDays }: { initialDays: ContributionDay[] }) {
	const [days, setDays] = useState(initialDays);

	useEffect(() => {
		const controller = new AbortController();
		async function refresh() {
			try {
				const fresh = await fetchFreshDays(controller.signal);
				if (fresh != null) {
					setDays(fresh);
				}
			} catch {
				// Why nothing: an offline reader, a GitHub outage, or an unmount keeps the days from the build.
			}
		}
		void refresh();
		return () => {
			controller.abort();
		};
	}, []);

	let total = 0;
	for (const day of days) {
		total += day.count;
	}
	const blanks = days[0] == null ? 0 : weekday(days[0].date);
	return (
		<figure className="grid gap-3">
			<div
				// Why hidden: 371 squares are noise to a screen reader, and the caption says the total.
				aria-hidden="true"
				className="grid auto-cols-fr grid-flow-col grid-rows-7 gap-0.5 sm:gap-[3px]"
			>
				{/* Why blanks: the first week can start after Sunday, and each column must start on a Sunday. */}
				{Array.from({ length: blanks }, (_, index) => (
					<span key={`blank-${index}`} />
				))}
				{days.map((day) => (
					<span
						key={day.date}
						title={`${day.count} on ${day.date}`}
						className={`aspect-square rounded-[2px] ${LEVEL_CLASSES[day.level]}`}
					/>
				))}
			</div>
			<figcaption className="font-mono text-xs text-label">
				{total.toLocaleString("en-US")} contributions in the last year, from{" "}
				<a
					href={`https://github.com/${GITHUB_HANDLE}`}
					className="whitespace-nowrap text-blush hover:text-ink"
				>
					@{GITHUB_HANDLE}
				</a>
				.
			</figcaption>
		</figure>
	);
}
