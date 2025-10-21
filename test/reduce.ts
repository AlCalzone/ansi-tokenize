import ansiStyles from "ansi-styles";
import { expect, test } from "vitest";
import { reduceAnsiCodes } from "../src/reduce.js";
import type { AnsiCode } from "../src/tokenize.js";

test("start and end codes cancel each other out", () => {
	const codes: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.red.open,
			endCode: ansiStyles.red.close,
		},
		{
			type: "ansi",
			code: ansiStyles.underline.open,
			endCode: ansiStyles.underline.close,
		},
		{
			type: "ansi",
			code: ansiStyles.red.close,
			endCode: ansiStyles.red.close,
		},
	];

	const reduced = reduceAnsiCodes(codes);
	const expected: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.underline.open,
			endCode: ansiStyles.underline.close,
		},
	];
	expect(JSON.stringify(reduced)).toBe(JSON.stringify(expected));
});

test("end and start codes cancel each other out", () => {
	const codes: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.red.close,
			endCode: ansiStyles.red.close,
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

	const reduced = reduceAnsiCodes(codes);
	const expected: AnsiCode[] = [
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
	expect(JSON.stringify(reduced)).toBe(JSON.stringify(expected));
});

test("Multiple codes of the same group cancel each other out", () => {
	const codes: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.red.open,
			endCode: ansiStyles.red.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bgBlue.open,
			endCode: ansiStyles.bgBlue.close,
		},
		{
			type: "ansi",
			code: ansiStyles.yellow.open,
			endCode: ansiStyles.yellow.close,
		},
		{
			type: "ansi",
			code: ansiStyles.blue.open,
			endCode: ansiStyles.blue.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bgGreen.open,
			endCode: ansiStyles.bgGreen.close,
		},
		{
			type: "ansi",
			code: ansiStyles.color.ansi16m(1, 2, 3),
			endCode: ansiStyles.color.close,
		},
	];

	const reduced = reduceAnsiCodes(codes);
	const expected: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.bgGreen.open,
			endCode: ansiStyles.bgGreen.close,
		},
		{
			type: "ansi",
			code: ansiStyles.color.ansi16m(1, 2, 3),
			endCode: ansiStyles.color.close,
		},
	];
	expect(JSON.stringify(reduced)).toBe(JSON.stringify(expected));
});

test("A reset code cancels all other codes", () => {
	const codes: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.red.open,
			endCode: ansiStyles.red.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bgBlue.open,
			endCode: ansiStyles.bgBlue.close,
		},
		{
			type: "ansi",
			code: ansiStyles.yellow.open,
			endCode: ansiStyles.yellow.close,
		},
		{
			type: "ansi",
			code: ansiStyles.blue.open,
			endCode: ansiStyles.blue.close,
		},
		{
			type: "ansi",
			code: ansiStyles.reset.open,
			endCode: ansiStyles.reset.close,
		},
		{
			type: "ansi",
			code: ansiStyles.color.ansi16m(1, 2, 3),
			endCode: ansiStyles.color.close,
		},
	];

	const reduced = reduceAnsiCodes(codes);
	const expected: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.color.ansi16m(1, 2, 3),
			endCode: ansiStyles.color.close,
		},
	];
	expect(JSON.stringify(reduced)).toBe(JSON.stringify(expected));
});

test("dim + bold are both preserved", () => {
	const codes: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.dim.open,
			endCode: ansiStyles.dim.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bold.open,
			endCode: ansiStyles.bold.close,
		},
	];

	const reduced = reduceAnsiCodes(codes);
	expect(reduced.length).toBe(2);
	expect(JSON.stringify(reduced)).toBe(JSON.stringify(codes));
});

test("dim + bold do not stack infinitely", () => {
	const codes: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.dim.open,
			endCode: ansiStyles.dim.close,
		},
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
		{
			type: "ansi",
			code: ansiStyles.bold.open,
			endCode: ansiStyles.bold.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bold.open,
			endCode: ansiStyles.bold.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bold.open,
			endCode: ansiStyles.bold.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bold.open,
			endCode: ansiStyles.bold.close,
		},
	];

	const expected: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.dim.open,
			endCode: ansiStyles.dim.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bold.open,
			endCode: ansiStyles.bold.close,
		},
	];

	const reduced = reduceAnsiCodes(codes);
	expect(reduced.length).toBe(2);
	expect(JSON.stringify(reduced)).toBe(JSON.stringify(expected));
});

test("dim + bold are both closed at the same time", () => {
	const codes: AnsiCode[] = [
		{
			type: "ansi",
			code: ansiStyles.dim.open,
			endCode: ansiStyles.dim.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bold.open,
			endCode: ansiStyles.bold.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bold.close,
			endCode: ansiStyles.bold.close,
		},
	];

	const reduced = reduceAnsiCodes(codes);
	expect(reduced).toEqual([]);
});
