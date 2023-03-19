import isFullwidthCodePoint from "is-fullwidth-code-point";
import { ESCAPES, getEndCode } from "./ansiCodes.js";

export interface AnsiCode {
	type: "ansi";
	code: string;
	endCode: string;
}

export interface Char {
	type: "char";
	value: string;
	fullWidth: boolean;
}

export type Token = AnsiCode | Char;

function findNumberIndex(str: string): number {
	for (let index = 0; index < str.length; index++) {
		const charCode = str.charCodeAt(index);
		if (charCode >= 48 && charCode <= 57) {
			return index;
		}
	}

	return -1;
}

function parseAnsiCode(string: string, offset: number): string | undefined {
	string = string.slice(offset, offset + 19);
	const startIndex = findNumberIndex(string);
	if (startIndex !== -1) {
		let endIndex = string.indexOf("m", startIndex);
		if (endIndex === -1) {
			endIndex = string.length;
		}

		return string.slice(0, endIndex + 1);
	}
}

export function tokenize(str: string, endChar: number = Number.POSITIVE_INFINITY): Token[] {
	const ret: Token[] = [];

	let index = 0;
	let visible = 0;
	while (index < str.length) {
		const codePoint = str.codePointAt(index)!;

		if (ESCAPES.has(codePoint)) {
			const code = parseAnsiCode(str, index);
			if (code) {
				ret.push({
					type: "ansi",
					code,
					endCode: getEndCode(code),
				});
				index += code.length;
				continue;
			}
		}

		const fullWidth = isFullwidthCodePoint(codePoint);
		const character = String.fromCodePoint(codePoint);

		ret.push({
			type: "char",
			value: character,
			fullWidth,
		});

		index += character.length;
		visible += fullWidth ? 2 : character.length;

		if (visible >= endChar) {
			break;
		}
	}

	return ret;
}
