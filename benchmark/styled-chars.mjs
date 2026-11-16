import { performance } from "node:perf_hooks";
import { styledCharsFromTokens, styledCharsToString } from "../build/styledChars.js";
import { tokenize } from "../build/tokenize.js";

// Run `yarn build`, then `node benchmark/styled-chars.mjs` on the base and PR.
const deepStyles = [
	"\x1b[1m",
	"\x1b[2m",
	"\x1b[3m",
	"\x1b[4m",
	"\x1b[7m",
	"\x1b[9m",
	"\x1b[53m",
	"\x1b[38;2;10;20;30m",
	"\x1b[48;2;40;50;60m",
	"\x1b]8;;https://example.com\x1b\\",
].join("");
const colors = ["\x1b[31m", "\x1b[32m", "\x1b[33m", "\x1b[34m"];

const cases = {
	"long run, 2 styles": `\x1b[1m\x1b[31m${"styled text ".repeat(500)}\x1b[0m`,
	unstyled: "plain text ".repeat(545),
	"new color every char": Array.from({ length: 6000 }, (_, i) => colors[i % 4] + "x").join(""),
	"new color every 5 chars": Array.from({ length: 1200 }, (_, i) => colors[i % 4] + "abcde").join(
		"",
	),
	"long run, 10 styles": `${deepStyles}${"styled text ".repeat(500)}\x1b[0m`,
};

const copy = (chars) =>
	chars.map((char) => ({ ...char, styles: char.styles.map((style) => ({ ...style })) }));

function measure(run) {
	const timings = [];
	for (let sample = 0; sample < 7; sample++) {
		const start = performance.now();
		for (let iteration = 0; iteration < 100; iteration++) run();
		timings.push((performance.now() - start) / 100);
	}
	timings.sort((a, b) => a - b);
	return timings[3].toFixed(3);
}

const rows = [];
for (const [name, text] of Object.entries(cases)) {
	const tokens = tokenize(text);
	const chars = styledCharsFromTokens(tokens);
	const independent = copy(chars);
	if (styledCharsToString(chars) !== styledCharsToString(independent)) {
		throw new Error(`Output mismatch for ${name}`);
	}
	rows.push({
		case: name,
		chars: chars.length,
		fromTokens: measure(() => styledCharsFromTokens(tokens)),
		toString: measure(() => styledCharsToString(chars)),
		"toString (copied)": measure(() => styledCharsToString(independent)),
	});
}
console.table(rows);
