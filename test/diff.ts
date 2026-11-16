import ansiStyles from "ansi-styles";
import { expect, test } from "vitest";
import { getLinkStartCode } from "../src/ansiCodes.js";
import { linkEndCode, linkEndCodeST } from "../src/consts.js";
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

test("replaces a link with a link that uses a different terminator without closing it first", () => {
	const from: AnsiCode[] = [
		{
			type: "ansi",
			code: "\x1b]8;;https://a.example\x07",
			endCode: linkEndCode,
		},
	];
	const to: AnsiCode[] = [
		{
			type: "ansi",
			code: "\x1b]8;;https://b.example\x1b\\",
			endCode: linkEndCodeST,
		},
	];

	expect(diffAnsiCodes(from, to)).toEqual(to);
});

test("re-adds an intensity style that stays active after the other one is removed", () => {
	const dim: AnsiCode = {
		type: "ansi",
		code: ansiStyles.dim.open,
		endCode: ansiStyles.dim.close,
	};
	const bold: AnsiCode = {
		type: "ansi",
		code: ansiStyles.bold.open,
		endCode: ansiStyles.bold.close,
	};

	expect(diffAnsiCodes([dim, bold], [dim])).toEqual([
		{ ...bold, code: ansiStyles.bold.close },
		dim,
	]);
	expect(diffAnsiCodes([dim, bold], [bold])).toEqual([
		{ ...dim, code: ansiStyles.dim.close },
		bold,
	]);
});
