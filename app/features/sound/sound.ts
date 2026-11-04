/** The volume of every sound on the site, from 0 to 1. A click is not a reason to be loud. */
const VOLUME = 0.3;

let shared: { context: AudioContext; output: GainNode; noise: AudioBuffer } | null = null;

/**
 * The site's one audio context, its volume, and one second of white noise for
 * the hits that need it. It is made at the first sound, after a click, so the
 * browser lets it play. Returns `null` in a browser with no Web Audio.
 *
 * @example
 * const audio = getAudio(); // => { context, output, noise }
 */
export function getAudio() {
	if (typeof AudioContext === "undefined") {
		return null;
	}
	if (shared == null) {
		const context = new AudioContext();
		const output = context.createGain();
		output.gain.value = VOLUME;
		output.connect(context.destination);
		const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
		const samples = noise.getChannelData(0);
		for (let index = 0; index < samples.length; index++) {
			samples[index] = Math.random() * 2 - 1;
		}
		shared = { context, output, noise };
	}
	void shared.context.resume();
	return shared;
}

type Audio = NonNullable<ReturnType<typeof getAudio>>;

/** A sine (or other wave) that glides from one pitch to another and fades out. */
function tone(
	{ context, output }: Audio,
	{
		time,
		from,
		to,
		glide,
		length,
		level,
		wave = "sine",
	}: {
		time: number;
		from: number;
		to: number;
		glide: number;
		length: number;
		level: number;
		wave?: OscillatorType;
	},
) {
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	oscillator.type = wave;
	oscillator.frequency.setValueAtTime(from, time);
	oscillator.frequency.exponentialRampToValueAtTime(to, time + glide);
	// Why a 5 ms attack: a tone that starts at full level clicks.
	gain.gain.setValueAtTime(0.0001, time);
	gain.gain.exponentialRampToValueAtTime(level, time + 0.005);
	gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
	oscillator.connect(gain).connect(output);
	oscillator.start(time);
	oscillator.stop(time + length);
}

/** A short burst of band-passed noise: the snap of a pop or a clap. */
function snap(
	{ context, output, noise }: Audio,
	{
		time,
		frequency,
		length,
		level,
	}: { time: number; frequency: number; length: number; level: number },
) {
	const source = context.createBufferSource();
	const filter = context.createBiquadFilter();
	const gain = context.createGain();
	source.buffer = noise;
	filter.type = "bandpass";
	filter.frequency.value = frequency;
	gain.gain.setValueAtTime(level, time);
	gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
	source.connect(filter).connect(gain).connect(output);
	source.start(time);
	source.stop(time + length);
}

/**
 * The site's sounds, each made in Web Audio, so no file loads. Each recipe
 * plays at `time`, in the context's clock.
 */
const SOUNDS = {
	/** Two soft notes up, for a pet on Nug. */
	pet: (audio: Audio, time: number) => {
		tone(audio, { time, from: 784, to: 830, glide: 0.06, length: 0.14, level: 0.35 });
		tone(audio, { time: time + 0.07, from: 1175, to: 1245, glide: 0.06, length: 0.18, level: 0.3 });
	},
	/** One blip that rises fast, like a bubble. Each has its own pitch. */
	bubble: (audio: Audio, time: number) => {
		const from = 350 + Math.random() * 300;
		tone(audio, { time, from, to: from * 2.6, glide: 0.06, length: 0.09, level: 0.4 });
	},
	/** A glide down and a small plip, for a jump to a footnote. */
	drop: (audio: Audio, time: number) => {
		tone(audio, {
			time,
			from: 1100,
			to: 380,
			glide: 0.16,
			length: 0.18,
			level: 0.25,
			wave: "triangle",
		});
		tone(audio, { time: time + 0.17, from: 480, to: 1250, glide: 0.05, length: 0.08, level: 0.3 });
	},
	/** A short snap, for the bubble that pops at a footnote mark. */
	pop: (audio: Audio, time: number) => {
		snap(audio, { time, frequency: 1800, length: 0.03, level: 0.6 });
		tone(audio, { time, from: 1500, to: 500, glide: 0.04, length: 0.05, level: 0.25 });
	},
};

/** The name of one of the site's sounds. */
export type SoundName = keyof typeof SOUNDS;

/**
 * Plays one short sound. Call it from a click, or after one. In a browser
 * with no Web Audio, it does nothing.
 *
 * @example
 * playSound("pet");
 * playSound("bubble", { delayMs: 120 });
 */
export function playSound(name: SoundName, { delayMs = 0 }: { delayMs?: number } = {}) {
	const audio = getAudio();
	if (audio == null) {
		return;
	}
	SOUNDS[name](audio, audio.context.currentTime + 0.01 + delayMs / 1000);
}
