import type { ReactNode } from "react";

/**
 * A dithered speech bubble: a dotted outline, and a tail of three shrinking
 * dot bubbles, like the ones the shrimp blows. The tail drops from the bottom
 * left, toward the shrimp under it.
 *
 * @example
 * <SpeechBubble>hi. pet me.</SpeechBubble>
 */
export function SpeechBubble({ children }: { children: ReactNode }) {
	return (
		<span className="relative inline-block max-w-[26ch] rounded-2xl border-2 border-dotted border-label/70 bg-abyss-2/85 px-3.5 py-2 font-mono text-sm text-ink">
			{children}
			<span
				aria-hidden="true"
				className="absolute -bottom-7 left-1 flex flex-col items-start gap-1"
			>
				<span className="size-2.5 rounded-full border-2 border-dotted border-label/70" />
				<span className="size-1.5 rounded-full border border-dotted border-label/70" />
				<span className="size-1 rounded-full bg-label/60" />
			</span>
		</span>
	);
}
