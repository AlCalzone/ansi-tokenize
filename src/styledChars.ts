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

export function styledCharsToString(chars: StyledChar[]): string {
	let ret = "";
	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		if (i === 0) {
			ret += ansiCodesToString(char.styles);
		} else {
			ret += ansiCodesToString(diffAnsiCodes(chars[i - 1].styles, char.styles));
		}
		ret += char.value;
	}
	return ret;
}
