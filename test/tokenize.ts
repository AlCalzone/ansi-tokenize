import ansiStyles from "ansi-styles";
import { expect, test } from "vitest";
import { tokenize } from "../src/tokenize.js";

test("splits unformatted strings into characters", () => {
	const str = "foo";
	const tokens = tokenize(str);

	const expected = [
		{
			type: "char",
			value: "f",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
	];
	expect(JSON.stringify(tokens)).toBe(JSON.stringify(expected));
});

test("splits into characters and ANSI codes", () => {
	const str = `${ansiStyles.red.open}foo${ansiStyles.red.close}bar`;
	const tokens = tokenize(str);

	const expected = [
		{
			type: "ansi",
			code: ansiStyles.red.open,
			endCode: ansiStyles.red.close,
		},
		{
			type: "char",
			value: "f",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "ansi",
			code: ansiStyles.red.close,
			endCode: ansiStyles.red.close,
		},
		{
			type: "char",
			value: "b",
			fullWidth: false,
		},
		{
			type: "char",
			value: "a",
			fullWidth: false,
		},
		{
			type: "char",
			value: "r",
			fullWidth: false,
		},
	];

	expect(JSON.stringify(tokens)).toBe(JSON.stringify(expected));
});

test("supports fullwidth characters", () => {
	const str =
		`${ansiStyles.red.open}${ansiStyles.bgBlueBright.open}안녕${ansiStyles.bgBlueBright.close}${ansiStyles.red.close}` +
		`${ansiStyles.underline.open}하세${ansiStyles.underline.close}`;

	const tokens = tokenize(str);

	const expected = [
		{
			type: "ansi",
			code: ansiStyles.red.open,
			endCode: ansiStyles.red.close,
		},
		{
			type: "ansi",
			code: ansiStyles.bgBlueBright.open,
			endCode: ansiStyles.bgBlueBright.close,
		},
		{
			type: "char",
			value: "안",
			fullWidth: true,
		},
		{
			type: "char",
			value: "녕",
			fullWidth: true,
		},
		{
			type: "ansi",
			code: ansiStyles.bgBlueBright.close,
			endCode: ansiStyles.bgBlueBright.close,
		},
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
			type: "char",
			value: "하",
			fullWidth: true,
		},
		{
			type: "char",
			value: "세",
			fullWidth: true,
		},
		{
			type: "ansi",
			code: ansiStyles.underline.close,
			endCode: ansiStyles.underline.close,
		},
	];

	expect(JSON.stringify(tokens)).toBe(JSON.stringify(expected));
});

test("supports unicode surrogate pairs", () => {
	const str = "a\uD83C\uDE00BC";

	const tokens = tokenize(str);

	const expected = [
		{
			type: "char",
			value: "a",
			fullWidth: false,
		},
		{
			type: "char",
			value: "\u{1F200}",
			fullWidth: true,
		},
		{
			type: "char",
			value: "B",
			fullWidth: false,
		},
		{
			type: "char",
			value: "C",
			fullWidth: false,
		},
	];

	expect(JSON.stringify(tokens)).toBe(JSON.stringify(expected));
});

test("support 8-bit color escape sequences", () => {
	const str = `${ansiStyles.color.ansi256(123)}foo${ansiStyles.color.close}`;

	const tokens = tokenize(str);

	const expected = [
		{
			type: "ansi",
			code: ansiStyles.color.ansi256(123),
			endCode: ansiStyles.color.close,
		},
		{
			type: "char",
			value: "f",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "ansi",
			code: ansiStyles.color.close,
			endCode: ansiStyles.color.close,
		},
	];

	expect(JSON.stringify(tokens)).toBe(JSON.stringify(expected));
});

test("support true color escape sequences", () => {
	const str = `${ansiStyles.bgColor.ansi16m(255, 254, 253)}foo${ansiStyles.bgColor.close}`;

	const tokens = tokenize(str);

	const expected = [
		{
			type: "ansi",
			code: ansiStyles.bgColor.ansi16m(255, 254, 253),
			endCode: ansiStyles.bgColor.close,
		},
		{
			type: "char",
			value: "f",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "ansi",
			code: ansiStyles.bgColor.close,
			endCode: ansiStyles.bgColor.close,
		},
	];

	expect(JSON.stringify(tokens)).toBe(JSON.stringify(expected));
});

test("supports links", () => {
	const str = "\x1B]8;;https://example.com\x07foo\x1B]8;;\x07";

	const tokens = tokenize(str);

	const expected = [
		{
			type: "ansi",
			code: "\x1B]8;;https://example.com\x07",
			endCode: "\x1B]8;;\x07",
		},
		{
			type: "char",
			value: "f",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "ansi",
			code: "\x1B]8;;\x07",
			endCode: "\x1B]8;;\x07",
		},
	];

	expect(JSON.stringify(tokens, null, 4)).toBe(JSON.stringify(expected, null, 4));
});

test("supports links with parameters", () => {
	const str = "\x1B]8;id=1;https://example.com\x07foo\x1B]8;;\x07";

	const tokens = tokenize(str);

	const expected = [
		{
			type: "ansi",
			code: "\x1B]8;id=1;https://example.com\x07",
			endCode: "\x1B]8;;\x07",
		},
		{
			type: "char",
			value: "f",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "ansi",
			code: "\x1B]8;;\x07",
			endCode: "\x1B]8;;\x07",
		},
	];

	expect(JSON.stringify(tokens, null, 4)).toBe(JSON.stringify(expected, null, 4));
});

test("supports links with multiple colon-separated parameters", () => {
	// OSC 8 params are key=value pairs separated by colons
	// See: https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda
	const str = "\x1B]8;id=foo:line=42;https://example.com\x07bar\x1B]8;;\x07";

	const tokens = tokenize(str);

	const expected = [
		{
			type: "ansi",
			code: "\x1B]8;id=foo:line=42;https://example.com\x07",
			endCode: "\x1B]8;;\x07",
		},
		{
			type: "char",
			value: "b",
			fullWidth: false,
		},
		{
			type: "char",
			value: "a",
			fullWidth: false,
		},
		{
			type: "char",
			value: "r",
			fullWidth: false,
		},
		{
			type: "ansi",
			code: "\x1B]8;;\x07",
			endCode: "\x1B]8;;\x07",
		},
	];

	expect(JSON.stringify(tokens, null, 4)).toBe(JSON.stringify(expected, null, 4));
});

test("supports links with semicolons in URL", () => {
	const str = "\x1B]8;id=1;https://example.com/path;param=value\x07foo\x1B]8;;\x07";

	const tokens = tokenize(str);

	const expected = [
		{
			type: "ansi",
			code: "\x1B]8;id=1;https://example.com/path;param=value\x07",
			endCode: "\x1B]8;;\x07",
		},
		{
			type: "char",
			value: "f",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "char",
			value: "o",
			fullWidth: false,
		},
		{
			type: "ansi",
			code: "\x1B]8;;\x07",
			endCode: "\x1B]8;;\x07",
		},
	];

	expect(JSON.stringify(tokens, null, 4)).toBe(JSON.stringify(expected, null, 4));
});

test("correctly detects emojis as full-width", () => {
	const str = "✅";
	const tokens = tokenize(str);
	const expected = [
		{
			type: "char",
			value: "✅",
			fullWidth: true,
		},
	];

	expect(JSON.stringify(tokens, null, 4)).toBe(JSON.stringify(expected, null, 4));
});

test("splits compound ANSI codes with multiple attributes into individual tokens", () => {
	// bold + some 24-bit color + underline + green
	const str = "\x1b[1;38;2;12;23;34;4;32mbaz\x1b[0m";
	const tokens = tokenize(str);

	const expected = [
		{
			type: "ansi",
			code: ansiStyles.bold.open,
			endCode: ansiStyles.bold.close,
		},
		{
			type: "ansi",
			code: ansiStyles.color.ansi16m(12, 23, 34),
			endCode: ansiStyles.color.close,
		},
		{
			type: "ansi",
			code: ansiStyles.underline.open,
			endCode: ansiStyles.underline.close,
		},
		{
			type: "ansi",
			code: ansiStyles.green.open,
			endCode: ansiStyles.green.close,
		},
		{
			type: "char",
			value: "b",
			fullWidth: false,
		},
		{
			type: "char",
			value: "a",
			fullWidth: false,
		},
		{
			type: "char",
			value: "z",
			fullWidth: false,
		},
		{
			type: "ansi",
			code: ansiStyles.reset.open,
			endCode: ansiStyles.reset.close,
		},
	];

	expect(JSON.stringify(tokens, null, 4)).toBe(JSON.stringify(expected, null, 4));
});
