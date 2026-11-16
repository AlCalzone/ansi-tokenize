import { ansiCodesToString } from "./ansiCodes.js";
import { diffAnsiCodes } from "./diff.js";
import { reduceAnsiCodesIncremental } from "./reduce.js";
import type { AnsiCode, Char, Token } from "./tokenize.js";

export interface StyledChar extends Char {
	styles: AnsiCode[];
}

export function styledCharsFromTokens(tokens: Token[]): StyledChar[] {
	let codes: AnsiCode[] = [];
	const ret: StyledChar[] = [];
	for (const token of tokens) {
		if (token.type === "ansi") {
			codes = reduceAnsiCodesIncremental(codes, [token]);
		} else if (token.type === "char") {
			ret.push({
				...token,
				styles: [...codes],
			});
		}
	}
	return ret;
}

/** Whether two reduced style arrays have an empty diff. */
function isSameStyle(from: AnsiCode[], to: AnsiCode[]): boolean {
	if (from === to) return true;
	if (from.length !== to.length) return false;
	for (let i = 0; i < from.length; i++) {
		if (from[i].code !== to[i].code || from[i].endCode !== to[i].endCode) {
			return false;
		}
	}
	return true;
}

export function styledCharsToString(chars: StyledChar[]): string {
	let ret = "";
	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		if (i === 0) {
			ret += ansiCodesToString(char.styles);
		} else if (!isSameStyle(chars[i - 1].styles, char.styles)) {
			ret += ansiCodesToString(diffAnsiCodes(chars[i - 1].styles, char.styles));
		}
		ret += char.value;
		// reset active styles at the end of the string
		if (i === chars.length - 1) {
			ret += ansiCodesToString(diffAnsiCodes(char.styles, []));
		}
	}
	return ret;
}
