import { reduceAnsiCodes } from "./reduce.js";
import type { AnsiCode } from "./tokenize.js";

/** Returns the combination of ANSI codes needed to undo the given ANSI codes */
export function undoAnsiCodes(codes: AnsiCode[]): AnsiCode[] {
	return reduceAnsiCodes(codes)
		.reverse()
		.map((code) => ({
			...code,
			code: code.endCode,
		}));
}
