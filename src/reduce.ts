import ansiStyles from "ansi-styles";
import { endCodesSet } from "./ansiCodes.js";
import type { AnsiCode } from "./tokenize.js";

/** Reduces the given array of ANSI codes to the minimum necessary to render with the same style */
export function reduceAnsiCodes(codes: AnsiCode[]): AnsiCode[] {
	return reduceAnsiCodesIncremental([], codes);
}

/** Like {@link reduceAnsiCodes}, but assumes that `codes` is already reduced. Further reductions are only done for the items in `newCodes`. */
export function reduceAnsiCodesIncremental(codes: AnsiCode[], newCodes: AnsiCode[]): AnsiCode[] {
	let ret: AnsiCode[] = [...codes];
	for (const code of newCodes) {
		if (code.code === ansiStyles.reset.open) {
			// Reset code, disable all codes
			ret = [];
		} else if (endCodesSet.has(code.code)) {
			// This is an end code, disable all matching start codes
			ret = ret.filter((retCode) => retCode.endCode !== code.code);
		} else {
			// This is a start code. Remove codes it "overrides", then add it.
			// If a new code has the same endCode, it "overrides" existing ones.
			// Special case: Intensity codes (1m, 2m) can coexist (both end with 22m).
			const isIntensityCode =
				code.code === ansiStyles.bold.open || code.code === ansiStyles.dim.open;
			if (!isIntensityCode) {
				ret = ret.filter((retCode) => retCode.endCode !== code.endCode);
			}
			ret.push(code);
		}
	}
	return ret;
}
