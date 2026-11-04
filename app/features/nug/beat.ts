import { getAudio } from "~/features/sound/sound.ts";

/** How long one nug walk lasts, in milliseconds. `nug-walk` in `global.css` uses the same time. */
export const NUG_WALK_MS = 2400;

/** One 16th note of the beat, in seconds: the walk is one bar of 16. */
const STEP = NUG_WALK_MS / 16 / 1000;

/**
 * Where each drum hits, in 16th notes from the start of the bar. It is an
 * original trap pattern, not a sample or a copy of a song. The hats roll in
 * triplets at the end of the bar.
 */
const PATTERN = {
	kick: [0, 3, 8, 11, 14],
	clap: [4, 12],
	hat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13 + 1 / 3, 13 + 2 / 3, 14, 15],
} as const;

/** An 808 kick: a sine that drops from 140 Hz to 42 Hz and fades out. */
function kick(context: AudioContext, output: AudioNode, time: number) {
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	oscillator.frequency.setValueAtTime(140, time);
	oscillator.frequency.exponentialRampToValueAtTime(42, time + 0.12);
	gain.gain.setValueAtTime(1, time);
	gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
	oscillator.connect(gain).connect(output);
	oscillator.start(time);
	oscillator.stop(time + 0.45);
}

/** A burst of filtered noise: a clap with a band-pass filter, a hat with a high-pass filter. */
function noiseHit({
	audio: { context, noise },
	output,
	time,
	filter,
	frequency,
	level,
	length,
}: {
	audio: { context: AudioContext; noise: AudioBuffer };
	output: AudioNode;
	time: number;
	filter: BiquadFilterType;
	frequency: number;
	level: number;
	length: number;
}) {
	const source = context.createBufferSource();
	const shape = context.createBiquadFilter();
	const gain = context.createGain();
	source.buffer = noise;
	shape.type = filter;
	shape.frequency.value = frequency;
	gain.gain.setValueAtTime(level, time);
	gain.gain.exponentialRampToValueAtTime(0.001, time + length);
	source.connect(shape).connect(gain).connect(output);
	source.start(time);
	source.stop(time + length);
}

/**
 * Plays one bar of the nug walk beat, the length of one walk. Call it from a
 * click, so the browser lets the page play sound. In a browser with no Web
 * Audio, it does nothing.
 *
 * @example
 * playNugBeat(); // an 808, two claps, and a hat roll, for 2.4 s
 */
export function playNugBeat() {
	const audio = getAudio();
	if (audio == null) {
		return;
	}
	const { context } = audio;
	// Why under the site volume: the beat is a little quieter than one at full level, so it sits under the pops.
	const output = context.createGain();
	output.gain.value = 0.8;
	output.connect(audio.output);
	const start = context.currentTime + 0.02;
	for (const step of PATTERN.kick) {
		kick(context, output, start + step * STEP);
	}
	for (const step of PATTERN.clap) {
		noiseHit({
			audio,
			output,
			time: start + step * STEP,
			filter: "bandpass",
			frequency: 1500,
			level: 0.8,
			length: 0.18,
		});
	}
	for (const step of PATTERN.hat) {
		noiseHit({
			audio,
			output,
			time: start + step * STEP,
			filter: "highpass",
			frequency: 7000,
			level: 0.35,
			length: 0.04,
		});
	}
}
