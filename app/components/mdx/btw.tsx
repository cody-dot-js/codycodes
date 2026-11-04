import type { ReactNode } from "react";

import { Nug } from "~/features/nug/nug.tsx";

/**
 * An aside that a reader can skip: extra context, with Nug beside it. A pet
 * makes him happy. The text is in the prerendered HTML; Nug is decoration.
 *
 * @example
 * <Btw>mantle is open source, MIT licensed.</Btw>
 */
export function Btw({ children }: { children: ReactNode }) {
	return (
		<aside
			aria-label="By the way"
			className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border-2 border-dotted border-label/40 py-3 pr-5 pl-3"
		>
			<Nug size={88} className="rounded-xl" />
			<div className="grid gap-1.5 text-[0.95rem] text-label">
				<p className="font-mono text-xs tracking-wider text-blush uppercase">btw</p>
				{children}
			</div>
		</aside>
	);
}
