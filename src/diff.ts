import { isIntensityCode, normalizeLinkEndCode } from "./ansiCodes.js";
import type { AnsiCode } from "./tokenize.js";
import { undoAnsiCodes } from "./undo.js";

/**
 * Returns the minimum amount of ANSI codes necessary to get from the compound style `from` to `to`.
 * Both `from` and `to` are expected to be reduced.
 */
export function diffAnsiCodes(from: AnsiCode[], to: AnsiCode[]): AnsiCode[] {
	const endCodesInTo = new Set(to.map((code) => normalizeLinkEndCode(code.endCode)));
	const startCodesInTo = new Set(to.map((code) => code.code));
	const startCodesInFrom = new Set(from.map((code) => code.code));

	// Ignore all styles in `from` that are not overwritten or removed by `to`
	// Disable all styles in `from` that are removed in `to`
	const removedFromStyles = from.filter((code) => {
		// Special case: Intensity codes (1m, 2m) can coexist (both end with 22m).
		// We have to check the start codes for those, otherwise we might miss a reset.
		if (isIntensityCode(code)) {
			return !startCodesInTo.has(code.code);
		}
		return !endCodesInTo.has(normalizeLinkEndCode(code.endCode));
	});
	// 22m turns off both bold and dim, so any intensity code that stays active must be re-added
	const undoesIntensity = removedFromStyles.some(isIntensityCode);

	return [
		...undoAnsiCodes(removedFromStyles),
		// Add all styles in `to` that don't exist in `from`
		...to.filter(
			(code) =>
				!startCodesInFrom.has(code.code) || (undoesIntensity && isIntensityCode(code)),
		),
	];
}
