import ansiStyles from "ansi-styles";
import type { AnsiCode } from "./tokenize.js";

export const ESCAPES = new Set([27, 155]); // \x1b and \x9b

export const endCodesSet = new Set<string>();
const endCodesMap = new Map<string, string>();
for (const [start, end] of ansiStyles.codes) {
	endCodesSet.add(ansiStyles.color.ansi(end));
	endCodesMap.set(ansiStyles.color.ansi(start), ansiStyles.color.ansi(end));
}

export function getEndCode(code: string): string {
	if (endCodesSet.has(code)) return code;
	if (endCodesMap.has(code)) return endCodesMap.get(code)!;

	code = code.slice(2);
	if (code.includes(";")) {
		code = code[0] + "0";
	}
	const ret = ansiStyles.codes.get(parseInt(code, 10));
	if (ret) {
		return ansiStyles.color.ansi(ret);
	} else {
		return ansiStyles.reset.open;
	}
}

export function ansiCodesToString(codes: AnsiCode[]): string {
	return codes.map((code) => code.code).join("");
}
