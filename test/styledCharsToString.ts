import ansiStyles from "ansi-styles";
import test from "ava";
import chalk from "chalk";
import { StyledChar, styledCharsToString } from "../src/styledChars.js";

test("renders the least amount of styles necessary (#1)", (t) => {
	const expected = chalk.red("foo") + "bar";
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

	t.is(actual, expected);
});

test("renders the least amount of styles necessary (#2)", (t) => {
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

	t.is(actual, expected);
});
