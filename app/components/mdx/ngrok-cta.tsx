import type { ReactNode } from "react";

import { DitherOcean } from "~/features/dither-ocean/dither-ocean.tsx";
import { Nug } from "~/features/nug/nug.tsx";

/** Where the buttons send a reader. The query tells ngrok's analytics that the visit came from this site. */
const DASHBOARD_URL = "https://dashboard.ngrok.com/?utm_source=codycod.es&utm_medium=referral";
const SIGNUP_URL = "https://dashboard.ngrok.com/signup?utm_source=codycod.es&utm_medium=referral";

/**
 * The call to action at the end of a post: a title, a line on where the work
 * lives in ngrok, and buttons to the dashboard and to sign up. Nug stands in
 * the dither waves at the side, over a faint grid.
 *
 * @example
 * <NgrokCta title="See it in the ngrok dashboard">Every endpoint ID keeps its tail.</NgrokCta>
 */
export function NgrokCta({ title, children }: { title: string; children: ReactNode }) {
	return (
		<aside
			aria-label={title}
			className="relative mt-8 grid overflow-hidden rounded-2xl border border-teal/25 bg-abyss-2 sm:grid-cols-[minmax(0,1fr)_11rem]"
		>
			{/* Why a masked grid: the texture fades toward the text, so it never fights the words. */}
			<div
				aria-hidden="true"
				className="cta-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_75%)]"
			/>
			<div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-72">
				<DitherOcean />
			</div>
			<div className="relative grid content-center gap-3 p-6 sm:py-8 sm:pr-0">
				<p className="font-mono text-xs tracking-wider text-teal uppercase">built at ngrok</p>
				<p className="text-2xl font-semibold tracking-tight text-balance text-ink">{title}</p>
				<div className="text-label">{children}</div>
				<p className="mt-1 flex flex-wrap gap-3 font-mono text-sm">
					<a
						href={DASHBOARD_URL}
						className="rounded-full bg-blush px-4 py-2 font-medium text-abyss-3 hover:bg-ink"
					>
						open the dashboard
					</a>
					<a
						href={SIGNUP_URL}
						className="rounded-full border border-label/40 bg-abyss-2/70 px-4 py-2 text-ink hover:border-ink"
					>
						sign up for free
					</a>
				</p>
			</div>
			<Nug size={176} className="order-first justify-self-center sm:order-none sm:self-end" />
		</aside>
	);
}
