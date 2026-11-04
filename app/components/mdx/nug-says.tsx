import type { ReactNode } from "react";
import { Link } from "react-router";

import { Nug } from "~/features/nug/nug.tsx";

/**
 * An aside that a reader can skip: extra context from Nug, who sits beside it.
 * A pet makes him happy. The label links to the page about him. The text is in
 * the prerendered HTML; Nug is decoration.
 *
 * @example
 * <NugSays>mantle is open source, MIT licensed.</NugSays>
 */
export function NugSays({ children }: { children: ReactNode }) {
	return (
		<aside
			aria-label="Nug says"
			className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border-2 border-dotted border-label/40 py-3 pr-5 pl-3"
		>
			<Nug size={88} className="rounded-xl" />
			<div className="grid gap-1.5 text-[0.95rem] text-label">
				<Link
					to="/nug"
					className="justify-self-start font-mono text-xs tracking-wider text-blush uppercase hover:text-ink"
				>
					nug says…
				</Link>
				{children}
			</div>
		</aside>
	);
}
