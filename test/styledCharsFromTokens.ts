import ansiStyles from "ansi-styles";
import { expect, test } from "vitest";
import { linkEndCodeST } from "../src/consts.js";
import { styledCharsFromTokens, styledCharsToString } from "../src/styledChars.js";
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

test("later style changes do not modify earlier runs", () => {
	const chars = styledCharsFromTokens(tokenize("\x1b[31mab\x1b[1mcd\x1b[0mef"));
	const original = styledCharsToString(chars.slice(0, 2));
	chars[1].styles = [
		...chars[1].styles,
		{
			type: "ansi",
			code: ansiStyles.underline.open,
			endCode: ansiStyles.underline.close,
		},
	];
	expect(styledCharsToString(chars.slice(0, 1))).toBe("\x1b[31ma\x1b[39m");
	expect(original).toBe("\x1b[31mab\x1b[39m");
	expect(chars[2].styles.map((style) => style.code)).toEqual(["\x1b[31m", "\x1b[1m"]);
	expect(chars[4].styles).toEqual([]);
});
