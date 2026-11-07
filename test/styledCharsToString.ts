import ansiStyles from "ansi-styles";
import { expect, test } from "vitest";
import { StyledChar, styledCharsFromTokens, styledCharsToString } from "../src/styledChars.js";
import { ansiCodesToString } from "../src/ansiCodes.js";
import { diffAnsiCodes } from "../src/diff.js";
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

test("matches the full diff serializer for generated style transitions", () => {
	// Keep the original serializer as a reference, including its exact byte order.
	const serializeWithDiff = (chars: StyledChar[]): string => {
		let result = "";
		for (let i = 0; i < chars.length; i++) {
			result += ansiCodesToString(
				i === 0 ? chars[i].styles : diffAnsiCodes(chars[i - 1].styles, chars[i].styles),
			);
			result += chars[i].value;
		}
		if (chars.length)
			result += ansiCodesToString(diffAnsiCodes(chars[chars.length - 1].styles, []));
		return result;
	};
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
		expect(styledCharsToString(chars)).toBe(serializeWithDiff(chars));
		// Callers can also construct equivalent arrays independently.
		const copied = chars.map((char) => ({
			...char,
			styles: char.styles.map((style) => ({ ...style })),
		}));
		expect(styledCharsToString(copied)).toBe(serializeWithDiff(chars));
	}
	expect(styledCharsToString([])).toBe("");
});
