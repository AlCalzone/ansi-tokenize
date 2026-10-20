import { performance } from "node:perf_hooks";
import { styledCharsFromTokens, styledCharsToString } from "../build/styledChars.js";
import { tokenize } from "../build/tokenize.js";

// Run `yarn build`, then `node benchmark/styled-chars.mjs` on the base and PR.
const text = `\x1b[1m\x1b[31m${"styled text ".repeat(500)}\x1b[0m`;
const tokens = tokenize(text);
const chars = styledCharsFromTokens(tokens);
const independent = chars.map((char) => ({
	...char,
	styles: char.styles.map((style) => ({ ...style })),
}));

for (const [name, run] of [
	["styledCharsFromTokens", () => styledCharsFromTokens(tokens).length],
	["styledCharsToString (runs)", () => styledCharsToString(chars).length],
	["styledCharsToString (independent arrays)", () => styledCharsToString(independent).length],
]) {
	const timings = [];
	let checksum = 0;
	for (let sample = 0; sample < 7; sample++) {
		const start = performance.now();
		for (let iteration = 0; iteration < 100; iteration++) checksum += run();
		timings.push((performance.now() - start) / 100);
	}
	timings.sort((a, b) => a - b);
	console.log(
		`${name}: ${timings[3].toFixed(3)} ms/call (median of 7 batches); checksum=${checksum}`,
	);
}
