import type { ReactNode } from "react";

import { Nug } from "~/features/nug/nug.tsx";

/** Where the buttons send a reader. The query tells ngrok's analytics that the visit came from this site. */
const DASHBOARD_URL = "https://dashboard.ngrok.com/?utm_source=codycod.es&utm_medium=referral";
const SIGNUP_URL = "https://dashboard.ngrok.com/signup?utm_source=codycod.es&utm_medium=referral";

/**
 * The call to action at the end of a post: Nug, a title, a line on where the
 * work lives in ngrok, and two buttons, to the dashboard and to sign up.
 *
 * @example
 * <NgrokCta title="See it in the ngrok dashboard">Every endpoint ID keeps its tail.</NgrokCta>
 */
export function NgrokCta({ title, children }: { title: string; children: ReactNode }) {
	return (
		<aside
			aria-label={title}
			className="mt-6 grid justify-items-center gap-4 rounded-2xl border border-teal/30 bg-panel p-5 text-center sm:grid-cols-[8rem_minmax(0,1fr)] sm:justify-items-start sm:text-left"
		>
			<Nug className="size-32" />
			<div className="grid content-center gap-3">
				<p className="font-mono text-xs tracking-wider text-teal uppercase">built at ngrok</p>
				<p className="text-xl font-semibold tracking-tight text-ink">{title}</p>
				<div className="text-label">{children}</div>
				<p className="flex flex-wrap justify-center gap-3 font-mono text-sm sm:justify-start">
					<a
						href={DASHBOARD_URL}
						className="cta-primary rounded-full bg-blush px-4 py-2 font-medium text-abyss-3 no-underline hover:bg-ink"
					>
						open the dashboard
					</a>
					<a
						href={SIGNUP_URL}
						className="cta-secondary rounded-full border border-label/40 px-4 py-2 text-ink no-underline hover:border-ink"
					>
						sign up for free
					</a>
				</p>
			</div>
		</aside>
	);
}
