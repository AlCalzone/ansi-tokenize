import ansiRegex from "ansi-regex";
import isFullwidthCodePoint from "is-fullwidth-code-point";

const regex = ansiRegex();

export type Token =
	| {
			type: "char";
			value: string;
			fullWidth: boolean;
	  }
	| {
			type: "ansi";
			code: string;
	  };

export function tokenize(str: string): Token[] {
	const ret: Token[] = [];

	const matches = [...str.matchAll(regex)];

	let index = 0;
	while (index < str.length) {
		if (matches.length && matches[0].index === index) {
			const match = matches.shift()!;
			const code = match[0];
			ret.push({
				type: "ansi",
				code,
			});
			index += code.length;
		} else {
			const codePoint = str.codePointAt(index)!;
			const character = String.fromCodePoint(codePoint);

			ret.push({
				type: "char",
				value: character,
				fullWidth: isFullwidthCodePoint(codePoint),
			});

			index += character.length;
		}
	}

	return ret;
}
