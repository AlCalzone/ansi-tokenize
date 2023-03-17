import ansiStyles from "ansi-styles";
import test from "ava";
import chalk from "chalk";
import { tokenize } from "../src/index.js";

test("splits unformatted strings into characters", (t) => {
	const str = "foo";
	const tokens = tokenize(str);

	t.deepEqual(tokens, [
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
	]);
});

test("splits into characters and ANSI codes", (t) => {
	const str = chalk.red("foo") + "bar";
	const tokens = tokenize(str);

	t.deepEqual(tokens, [
		{
			type: "ansi",
			code: ansiStyles.red.open,
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
	]);
});

test("supports fullwidth characters", (t) => {
	const str = chalk.red.bgBlueBright("안녕") + chalk.underline("하세");

	const tokens = tokenize(str);

	t.deepEqual(tokens, [
		{
			type: "ansi",
			code: ansiStyles.red.open,
		},
		{
			type: "ansi",
			code: ansiStyles.bgBlueBright.open,
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
		},
		{
			type: "ansi",
			code: ansiStyles.red.close,
		},
		{
			type: "ansi",
			code: ansiStyles.underline.open,
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
		},
	]);
});

test("supports unicode surrogate pairs", (t) => {
	const str = "a\uD83C\uDE00BC";

	const tokens = tokenize(str);

	t.deepEqual(tokens, [
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
	]);
});

test("support true color escape sequences", (t) => {
	const str = chalk.bgRgb(255, 254, 253)("foo");

	const tokens = tokenize(str);

	t.deepEqual(tokens, [
		{
			type: "ansi",
			code: ansiStyles.bgColor.ansi16m(255, 254, 253),
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
		},
	]);
});
