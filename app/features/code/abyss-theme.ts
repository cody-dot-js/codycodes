import type { ThemeRegistration } from "shiki";

/**
 * The Shiki theme for code fences, in the abyss brand colors. The background is
 * transparent, so the code block's panel shows through. Each color has a
 * contrast ratio of 7 or more on the panel.
 */
export const abyssTheme = {
	name: "abyss",
	type: "dark",
	colors: { "editor.background": "#00000000", "editor.foreground": "#fff8f1" },
	tokenColors: [
		{
			scope: ["comment", "punctuation.definition.comment"],
			settings: { foreground: "#8fb0ba", fontStyle: "italic" },
		},
		{
			scope: ["keyword", "storage", "keyword.operator.new", "keyword.control"],
			settings: { foreground: "#ff9db4" },
		},
		{
			scope: ["string", "string.quoted", "punctuation.definition.string"],
			settings: { foreground: "#6fffe4" },
		},
		{
			scope: ["constant.numeric", "constant.language", "constant.character"],
			settings: { foreground: "#ffd9a8" },
		},
		{
			scope: ["entity.name.function", "support.function", "meta.function-call"],
			settings: { foreground: "#ffe3c2" },
		},
		{
			scope: ["entity.name.tag", "support.class.component", "entity.name.type", "support.type"],
			settings: { foreground: "#ffb1aa" },
		},
		{
			scope: [
				"entity.other.attribute-name",
				"meta.object-literal.key",
				"support.type.property-name",
			],
			settings: { foreground: "#a9c8d1" },
		},
		{
			scope: ["punctuation", "meta.brace", "keyword.operator"],
			settings: { foreground: "#a9c8d1" },
		},
		{
			scope: ["variable", "variable.other.readwrite", "meta.definition.variable"],
			settings: { foreground: "#fff8f1" },
		},
	],
} satisfies ThemeRegistration;
