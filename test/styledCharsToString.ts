import ansiStyles from "ansi-styles";
import { expect, test } from "vitest";
import { StyledChar, styledCharsFromTokens, styledCharsToString } from "../src/styledChars.js";
import { tokenize } from "../src/tokenize.js";

test("renders the least amount of styles necessary (#1)", () => {
	const expected = `${ansiStyles.red.open}foo${ansiStyles.red.close}bar`;
	const styled: StyledChar[] = [
		{
			type: "char",
			value: "f",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.red.open,
					endCode: ansiStyles.red.close,
				},
			],
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.red.open,
					endCode: ansiStyles.red.close,
				},
			],
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.red.open,
					endCode: ansiStyles.red.close,
				},
			],
		},
		{
			type: "char",
			value: "b",
			fullWidth: false,
			styles: [],
		},
		{
			type: "char",
			value: "a",
			fullWidth: false,
			styles: [],
		},
		{
			type: "char",
			value: "r",
			fullWidth: false,
			styles: [],
		},
	];

	const actual = styledCharsToString(styled);

	expect(actual).toBe(expected);
});

test("renders the least amount of styles necessary (#2)", () => {
	const styled: StyledChar[] = [
		{
			type: "char",
			value: "h",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.red.open,
					endCode: ansiStyles.red.close,
				},
			],
		},
		{
			type: "char",
			value: "e",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.blue.open,
					endCode: ansiStyles.blue.close,
				},
			],
		},
		{
			type: "char",
			value: "l",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.blue.open,
					endCode: ansiStyles.blue.close,
				},
				{
					type: "ansi",
					code: ansiStyles.underline.open,
					endCode: ansiStyles.underline.close,
				},
			],
		},
		{
			type: "char",
			value: "l",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.underline.open,
					endCode: ansiStyles.underline.close,
				},
				{
					type: "ansi",
					code: ansiStyles.bgYellow.open,
					endCode: ansiStyles.bgYellow.close,
				},
			],
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
			styles: [],
		},
	];

	const actual = styledCharsToString(styled);
	const expected = `${ansiStyles.red.open}h${ansiStyles.blue.open}e${ansiStyles.underline.open}l${ansiStyles.blue.close}${ansiStyles.bgYellow.open}l${ansiStyles.bgYellow.close}${ansiStyles.underline.close}o`;

	expect(actual).toBe(expected);
});

test("resets active styles at the end of the string", () => {
	const styled: StyledChar[] = [
		{
			type: "char",
			value: "h",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.red.open,
					endCode: ansiStyles.red.close,
				},
			],
		},
	];

	const actual = styledCharsToString(styled);
	const expected = `${ansiStyles.red.open}h${ansiStyles.red.close}`;

	expect(actual).toBe(expected);
});

test("resets between adjacent dim and bold styles", () => {
	const dimThenBold: StyledChar[] = [
		{
			type: "char",
			value: "d",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.dim.open,
					endCode: ansiStyles.dim.close,
				},
			],
		},
		{
			type: "char",
			value: "B",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.bold.open,
					endCode: ansiStyles.bold.close,
				},
			],
		},
	];

	let actual = styledCharsToString(dimThenBold);
	let expected = `${ansiStyles.dim.open}d${ansiStyles.dim.close}${ansiStyles.bold.open}B${ansiStyles.bold.close}`;

	expect(actual).toBe(expected);

	// Smoke test for https://github.com/AlCalzone/ansi-tokenize/issues/42
	const dimChar = styledCharsFromTokens(
		tokenize(`${ansiStyles.dim.open}|${ansiStyles.dim.close}`),
	);
	const boldChar = styledCharsFromTokens(
		tokenize(`${ansiStyles.bold.open}B${ansiStyles.bold.close}`),
	);

	actual = styledCharsToString([...dimChar, ...boldChar]);
	expected = `${ansiStyles.dim.open}|${ansiStyles.dim.close}${ansiStyles.bold.open}B${ansiStyles.bold.close}`;

	expect(actual).toBe(expected);
});

test("preserves overlapping dim and bold styles", () => {
	const dimThenBold: StyledChar[] = [
		{
			type: "char",
			value: "d",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.dim.open,
					endCode: ansiStyles.dim.close,
				},
			],
		},
		{
			type: "char",
			value: "B",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: ansiStyles.bold.open,
					endCode: ansiStyles.bold.close,
				},
				{
					type: "ansi",
					code: ansiStyles.dim.open,
					endCode: ansiStyles.dim.close,
				},
			],
		},
	];

	const actual = styledCharsToString(dimThenBold);
	const expected = `${ansiStyles.dim.open}d${ansiStyles.bold.open}B${ansiStyles.bold.close}`;

	expect(actual).toBe(expected);
});

test("round-trips generated style transitions", () => {
	const activeCodes = (chars: StyledChar[]): string[][] =>
		chars.map((char) => char.styles.map((style) => style.code).sort());
	let seed = 12345;
	const next = (length: number): number => {
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
		return seed % length;
	};
	const pieces = [
		"abc",
		"界",
		"👩‍💻",
		"\n",
		"\x1b[31m",
		"\x1b[34m",
		"\x1b[1m",
		"\x1b[2m",
		"\x1b[22m",
		"\x1b[0m",
		"\x1b[38;2;10;20;30m",
		"\x1b]8;;https://example.com\x1b\\",
		"\x1b]8;;\x1b\\",
	];
	for (let sample = 0; sample < 500; sample++) {
		let text = "";
		for (let i = 0; i < 40; i++) text += pieces[next(pieces.length)];
		const chars = styledCharsFromTokens(tokenize(text));
		const serialized = styledCharsToString(chars);
		expect(activeCodes(styledCharsFromTokens(tokenize(serialized)))).toEqual(
			activeCodes(chars),
		);
		expect(styledCharsFromTokens(tokenize(`${serialized}x`)).at(-1)?.styles).toEqual([]);
		// Independently built style arrays must serialize the same way
		const copied = chars.map((char) => ({
			...char,
			styles: char.styles.map((style) => ({ ...style })),
		}));
		expect(styledCharsToString(copied)).toBe(serialized);
	}
	expect(styledCharsToString([])).toBe("");
});

test("closes a hyperlink where an end code with a different terminator ended it", () => {
	const str = "\x1b]8;;https://example.com\x07ab\x1b]8;;\x1b\\c";
	const expected = "\x1b]8;;https://example.com\x07ab\x1b]8;;\x07c";

	const actual = styledCharsToString(styledCharsFromTokens(tokenize(str)));

	expect(actual).toBe(expected);
});

test("round-trips underline colors", () => {
	const roundTrip = (s: string): string =>
		styledCharsToString(styledCharsFromTokens(tokenize(s)));

	expect(roundTrip("\x1b[4m\x1b[58;5;1mhello\x1b[59m world\x1b[24m")).toBe(
		"\x1b[4m\x1b[58;5;1mhello\x1b[59m world\x1b[24m",
	);
	expect(roundTrip("\x1b[4;58;2;255;0;0mhello\x1b[0m")).toBe(
		"\x1b[4m\x1b[58;2;255;0;0mhello\x1b[59m\x1b[24m",
	);
});

test("keeps dim active after bold is turned off", () => {
	const str = "\x1b[2m\x1b[1ma\x1b[22m\x1b[2mb";
	const expected = "\x1b[2m\x1b[1ma\x1b[22m\x1b[2mb\x1b[22m";

	const actual = styledCharsToString(styledCharsFromTokens(tokenize(str)));

	expect(actual).toBe(expected);
});
