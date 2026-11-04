import type { ComponentProps } from "react";
import { useCallback, useRef, useState } from "react";

/** How long the copy button says "copied", in milliseconds. */
const COPIED_MS = 2000;

/**
 * A code fence: a header with the fence's language and a copy button, over the
 * code that Shiki highlights at build time. The post layout maps every MDX
 * `pre` to it, so a post writes a plain markdown fence.
 *
 * @example
 * <MDXProvider components={{ pre: CodeBlock }}>…</MDXProvider>
 */
export function CodeBlock({
	"data-language": language,
	className,
	style,
	tabIndex,
	children,
}: ComponentProps<"pre"> & { "data-language"?: string }) {
	const preRef = useRef<HTMLPreElement>(null);
	const [copied, setCopied] = useState(false);

	const copy = useCallback(() => {
		async function writeAndConfirm() {
			await navigator.clipboard.writeText(preRef.current?.textContent ?? "");
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, COPIED_MS);
		}
		void writeAndConfirm();
	}, []);

	return (
		<figure className="code-block">
			<figcaption className="flex items-center justify-between gap-3 border-b border-rule px-4 py-1.5 font-mono text-xs text-label">
				<span>{language}</span>
				<button type="button" onClick={copy} className="rounded px-2 py-1 hover:text-ink">
					{copied ? "copied" : "copy"}
				</button>
			</figcaption>
			{/* Why these props: Shiki sets the class, the colors, and the tab stop that lets a keyboard scroll the code. */}
			<pre ref={preRef} className={className} style={style} tabIndex={tabIndex}>
				{children}
			</pre>
		</figure>
	);
}
