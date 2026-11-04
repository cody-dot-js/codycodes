import type { ReactNode } from "react";

/**
 * A dithered speech bubble: a dotted outline on the deep-sea ground. The tank
 * draws its tail, so the tail can follow the shrimp.
 *
 * @example
 * <SpeechBubble>hi. pet me.</SpeechBubble>
 */
export function SpeechBubble({ children }: { children: ReactNode }) {
	return (
		<span className="relative inline-block max-w-[26ch] rounded-2xl border-2 border-dotted border-label/70 bg-abyss-2/85 px-3.5 py-2 font-mono text-sm text-ink">
			{children}
		</span>
	);
}
