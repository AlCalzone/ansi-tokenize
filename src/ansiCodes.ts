import ansiStyles from "ansi-styles";
import type { AnsiCode } from "./tokenize.js";
import {
	CC_OSC,
	linkCodePrefix,
	linkCodeSuffix,
	linkEndCode,
	linkEndCodeC1ST,
	linkEndCodeST,
} from "./consts.js";

export const endCodesSet = new Set<string>();
const endCodesMap = new Map<string, string>();
for (const [start, end] of ansiStyles.codes) {
	endCodesSet.add(ansiStyles.color.ansi(end));
	endCodesMap.set(ansiStyles.color.ansi(start), ansiStyles.color.ansi(end));
}
const linkEndCodes = new Set([linkEndCode, linkEndCodeST, linkEndCodeC1ST]);
for (const code of linkEndCodes) endCodesSet.add(code);

/**
 * Maps all hyperlink end codes to the same value, because they only differ in their terminator
 * and any of them ends the open hyperlink. Other end codes are returned unchanged.
 */
export function normalizeLinkEndCode(endCode: string): string {
	// Check for ESC ] first so SGR end codes skip the Set lookup
	return endCode.charCodeAt(1) === CC_OSC && linkEndCodes.has(endCode) ? linkEndCode : endCode;
}

export function getLinkStartCode(url: string, params?: Record<string, string>): string {
	const paramsStr = params
		? Object.entries(params)
				.map(([k, v]) => `${k}=${v}`)
				.join(":")
		: "";
	return `${linkCodePrefix}${paramsStr};${url}${linkCodeSuffix}`;
}

export function getEndCode(code: string): string {
	if (endCodesSet.has(code)) return code;
	if (endCodesMap.has(code)) return endCodesMap.get(code)!;

	// We have a few special cases to handle here:
	// Links:
	if (code.startsWith(linkCodePrefix)) {
		if (code.endsWith("\x1B\\")) return linkEndCodeST;
		if (code.endsWith("\x9C")) return linkEndCodeC1ST;
		return linkEndCode; // BEL (\x07)
	}

	code = code.slice(2);

	// 8-bit/24-bit colors:
	if (code.startsWith("38")) {
		return ansiStyles.color.close;
	} else if (code.startsWith("48")) {
		return ansiStyles.bgColor.close;
	} else if (code.startsWith("58")) {
		return ansiStyles.underlineColor.close;
	}

	// Otherwise find the reset code in the ansi-styles map
	const ret = ansiStyles.codes.get(parseInt(code, 10));
	if (ret) {
		return ansiStyles.color.ansi(ret);
	} else {
		return ansiStyles.reset.open;
	}
}

export function ansiCodesToString(codes: AnsiCode[]): string {
	// Deduplicate ANSI code strings before joining
	const deduplicated = new Set(codes.map((code) => code.code));
	return [...deduplicated].join("");
}

/** Check if a code is an intensity code (bold or dim) - these share endCode 22m but can coexist */
export function isIntensityCode(code: AnsiCode): boolean {
	return code.code === ansiStyles.bold.open || code.code === ansiStyles.dim.open;
}
