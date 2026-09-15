import ansiStyles from "ansi-styles";
import { expect, test } from "vitest";
import { linkEndCodeST } from "../src/consts.js";
import { styledCharsFromTokens } from "../src/styledChars.js";
import { tokenize } from "../src/tokenize.js";

test("remembers the active ANSI codes for each character", () => {
	const str = `${ansiStyles.red.open}foo${ansiStyles.red.close}bar`;
	const styled = styledCharsFromTokens(tokenize(str));

	const expected = [
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

	expect(JSON.stringify(styled)).toBe(JSON.stringify(expected));
});

test("OSC hyperlink endCode does not leak into following characters", () => {
	const linkStart = "\x1b]8;;https://example.com\x1b\\";
	const str = `${linkStart}x${linkEndCodeST}hi`;
	const styled = styledCharsFromTokens(tokenize(str));

	const expected = [
		{
			type: "char",
			value: "x",
			fullWidth: false,
			styles: [
				{
					type: "ansi",
					code: linkStart,
					endCode: linkEndCodeST,
				},
			],
		},
		{
			type: "char",
			value: "h",
			fullWidth: false,
			styles: [],
		},
		{
			type: "char",
			value: "i",
			fullWidth: false,
			styles: [],
		},
	];

	expect(JSON.stringify(styled)).toBe(JSON.stringify(expected));
});
