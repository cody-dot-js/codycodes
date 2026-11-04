/**
 * A before and after number pair, for a post that claims a change. The
 * "after" value is teal, the one color the brand keeps for "after".
 *
 * @example
 * <BeforeAfter label="LCP on a 4G phone" before="4.1 s" after="1.3 s" />
 */
export function BeforeAfter({
	label,
	before,
	after,
}: {
	label: string;
	before: string;
	after: string;
}) {
	return (
		<figure className="grid gap-2 rounded-xl border border-rule p-5">
			<figcaption className="font-mono text-xs tracking-wider text-label uppercase">
				{label}
			</figcaption>
			<p className="flex flex-wrap items-baseline gap-x-4 text-2xl font-semibold tabular-nums">
				<span className="text-label line-through decoration-1">{before}</span>
				<span aria-hidden="true" className="text-label">
					→
				</span>
				<span className="text-teal">{after}</span>
			</p>
		</figure>
	);
}
