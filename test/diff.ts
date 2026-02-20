import ansiStyles from "ansi-styles";
import { expect, test } from "vitest";
import { getLinkStartCode } from "../src/ansiCodes.js";
import { linkEndCode } from "../src/consts.js";
import { diffAnsiCodes } from "../src/diff.js";
import type { AnsiCode } from "../src/tokenize.js";

test("returns an empty array if both sides have the same styles (#1)", () => {
	const from: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.red.open,
			endCode: ansiStyles.red.close,
		},
	];
	const to: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.red.open,
			endCode: ansiStyles.red.close,
		},
	];

	const diff = diffAnsiCodes(from, to);
	const expected: AnsiCode[] = [];
	expect(JSON.stringify(diff)).toBe(JSON.stringify(expected));
});

test("returns an empty array if both sides have the same styles (#2)", () => {
	const from: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.bgGray.open,
			endCode: ansiStyles.bgGray.close,
		},
		{
			type: "ansi",
			code: ansiStyles.underline.open,
			endCode: ansiStyles.underline.close,
		},
	];
	const to: AnsiCode[] = [
		// Order does not matter
		{
			type: "ansi",
			code: ansiStyles.underline.open,
			endCode: ansiStyles.underline.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bgGray.open,
			endCode: ansiStyles.bgGray.close,
		},
	];

	const diff = diffAnsiCodes(from, to);
	const expected: AnsiCode[] = [];
	expect(JSON.stringify(diff)).toBe(JSON.stringify(expected));
});

test("disables/enables styles per group accordingly", () => {
	const from: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.bgGray.open,
			endCode: ansiStyles.bgGray.close,
		},
		{
			type: "ansi",
			code: ansiStyles.underline.open,
			endCode: ansiStyles.underline.close,
		},
		{
			type: "ansi",
			code: ansiStyles.red.open,
			endCode: ansiStyles.red.close,
		},
	];
	const to: AnsiCode[] = [
		// No underline, different background color
		{
			type: "ansi",
			code: ansiStyles.bgBlue.open,
			endCode: ansiStyles.bgBlue.close,
		},
		// Unchanged foreground color
		{
			type: "ansi",
			code: ansiStyles.red.open,
			endCode: ansiStyles.red.close,
		},
	];

	const diff = diffAnsiCodes(from, to);
	const expected: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.underline.close,
			endCode: ansiStyles.underline.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bgBlue.open,
			endCode: ansiStyles.bgBlue.close,
		},
	];
	expect(JSON.stringify(diff)).toBe(JSON.stringify(expected));
});

test("closes links properly", () => {
	const from: AnsiCode[] = [
		{
			type: "ansi",
			code: getLinkStartCode("https://example.com"),
			endCode: linkEndCode,
		},
	];
	const to: AnsiCode[] = [];

	const diff = diffAnsiCodes(from, to);

	const expected: AnsiCode[] = [
		{
			type: "ansi",
			code: linkEndCode,
			endCode: linkEndCode,
		},
	];
	expect(JSON.stringify(diff)).toBe(JSON.stringify(expected));
});
