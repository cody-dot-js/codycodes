/** What the shrimp says. The first line greets; a pet picks one of the happy lines. */
export const GREETING = "hi. pet me.";

export const HAPPY_LINES = [
	"♥",
	"that's the spot.",
	"shrimp approved.",
	"just shrimp it!",
	"shell yeah.",
	"prawn to be wild.",
	"shrimply the best.",
	"don't be shellfish. again!",
	"receipts or it didn't happen.",
	"10/10 pet. would swim again.",
] as const;

/** The line after `pets` pets. Why cycle, not random: prerendered HTML and tests stay stable. */
export function lineAfter(pets: number): string {
	return pets === 0 ? GREETING : (HAPPY_LINES[(pets - 1) % HAPPY_LINES.length] ?? GREETING);
}
