/**
 * The bubble's tail: a curve of dots from the shrimp's head up to the bubble,
 * drawn from an anchor at its bottom-left corner. The dots flow toward him.
 * Mirror it for a bubble on his left.
 *
 * @example
 * <SpeechTail className="absolute bottom-0 left-0" />
 */
export function SpeechTail({ className }: { className: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 28 40"
			className={`h-10 w-7 overflow-visible ${className}`}
		>
			<path
				d="M1 39 C 1 26, 6 13, 22 3"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeDasharray="0 6.5"
				className="speech-tail text-label/70"
			/>
		</svg>
	);
}
