import { useMatchesMediaQuery } from "~/hooks/use-matches-media-query";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";

/**
 * prefersDarkModeMediaQuery is the media query used to detect if the user prefers dark mode.
 */
const prefersDarkModeMediaQuery = "(prefers-color-scheme: dark)";

/**
 * themes is a tuple of valid themes.
 */
const themes = ["system", "light", "dark"] as const;

/**
 * Theme is a string literal type that represents a valid theme.
 */
type Theme = (typeof themes)[number];

/**
 * theme is a helper which translates the Theme type into a string literal type.
 */
const theme = <T extends Theme>(value: T) => value;

/**
 * Type predicate that checks if a value is a valid theme.
 */
function isTheme(value: unknown): value is Theme {
	if (typeof value !== "string") {
		return false;
	}

	return themes.includes(value as Theme);
}

/**
 * DEFAULT_STORAGE_KEY is the default key used to store the theme in localStorage.
 */
const DEFAULT_STORAGE_KEY = "codycodes-ui-theme";

/**
 * ThemeProviderState is the shape of the state returned by the ThemeProviderContext.
 */
type ThemeProviderState = [theme: Theme, setTheme: (theme: Theme) => void];

/**
 * Initial state for the ThemeProviderContext.
 */
const initialState: ThemeProviderState = ["system", () => null];

/**
 * ThemeProviderContext is a React Context that provides the current theme and a function to set the theme.
 */
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * isBrowser returns true if the code is running in a browser environment.
 */
const isBrowser = () => typeof window !== "undefined";

/**
 * Gets the stored theme from localStorage or returns the default theme if no theme is stored.
 */
function getStoredTheme(storageKey: string, defaultTheme: Theme = "system") {
	const fallbackTheme = defaultTheme ?? "system";
	if (isBrowser()) {
		const storedTheme = window.localStorage.getItem(storageKey);
		return isTheme(storedTheme) ? storedTheme : fallbackTheme;
	}
	return fallbackTheme;
}

type ThemeProviderProps = PropsWithChildren;

const defaultTheme = "system" satisfies Theme;
const storageKey = DEFAULT_STORAGE_KEY;

/**
 * ThemeProvider is a React Context Provider that provides the current theme and a function to set the theme.
 */
function ThemeProvider({ children }: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		const initialTheme = getStoredTheme(storageKey, defaultTheme);
		applyTheme(initialTheme);
		return initialTheme;
	});

	useEffect(() => {
		const storedTheme = getStoredTheme(storageKey, defaultTheme);
		setTheme(storedTheme);
		applyTheme(storedTheme);
	}, []);

	useEffect(() => {
		const prefersDarkMql = window.matchMedia(prefersDarkModeMediaQuery);

		const onChange = () => {
			const storedTheme = getStoredTheme(storageKey, defaultTheme);

			// If the stored theme is not "system", then the user has explicitly set a theme and we should not
			// automatically change the theme when the user's system preferences change.
			if (storedTheme !== "system") {
				return;
			}

			applyTheme("system");
		};

		prefersDarkMql.addEventListener("change", onChange);

		return () => {
			prefersDarkMql.removeEventListener("change", onChange);
		};
	}, []);

	const value: ThemeProviderState = useMemo(
		() => [
			theme,
			(theme: Theme) => {
				window.localStorage.setItem(storageKey, theme);
				setTheme(theme);
				applyTheme(theme);
			},
		],
		[theme],
	);

	return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

/**
 * useTheme returns the current theme and a function to set the theme.
 *
 * @note This function will throw an error if used outside of a ThemeProvider context tree.
 */
function useTheme() {
	const context = useContext(ThemeProviderContext);

	invariant(context, "useTheme must be used within a ThemeProvider");

	return context;
}

/**
 * Applies the given theme to the <html> element.
 */
function applyTheme(theme: Theme) {
	if (!isBrowser()) {
		return;
	}

	const htmlElement = window.document.documentElement;
	htmlElement.classList.remove(...themes);
	const prefersDarkMode = window.matchMedia(prefersDarkModeMediaQuery).matches;
	const newTheme = resolveTheme(theme, { prefersDarkMode });
	htmlElement.classList.add(newTheme);
	htmlElement.dataset.appliedTheme = newTheme;
	htmlElement.dataset.theme = theme;
}

/**
 * If the theme is "system", it will resolve the theme based on the user's media query preferences, otherwise it will return the theme as is.
 * This will mirror the result that gets applied to the <html> element.
 */
function resolveTheme(theme: Theme, { prefersDarkMode }: { prefersDarkMode: boolean }) {
	if (theme === "system") {
		return determineThemeFromMediaQuery({ prefersDarkMode });
	}

	return theme;
}

/**
 * If the theme is "system", it will resolve the theme based on the user's media query preferences, otherwise it will return the theme as is.
 * This will mirror the result that gets applied to the <html> element.
 */
function useAppliedTheme() {
	const [theme] = useTheme();

	const prefersDarkMode = useMatchesMediaQuery(prefersDarkModeMediaQuery);

	return resolveTheme(theme, { prefersDarkMode });
}

/**
 * determineThemeFromMediaQuery returns the theme that should be used based on the user's media query preferences.
 * @private
 */
export function determineThemeFromMediaQuery({ prefersDarkMode }: { prefersDarkMode: boolean }) {
	return prefersDarkMode ? "dark" : "light";
}

function preventWrongThemeFlashScriptContent() {
	return `
(function() {
	const themes = ${JSON.stringify(themes)};
	const isTheme = (value) => typeof value === "string" && themes.includes(value);
	const fallbackTheme = "${defaultTheme}" ?? "system";
	const maybeStoredTheme = window.localStorage.getItem("${storageKey}");
	const hasStoredTheme = isTheme(maybeStoredTheme);
	if (!hasStoredTheme) {
		window.localStorage.setItem("${storageKey}", fallbackTheme);
	}
	const themePreference = hasStoredTheme ? maybeStoredTheme : fallbackTheme;
	const prefersDarkMode = window.matchMedia("${prefersDarkModeMediaQuery}").matches;
	let initialTheme = themePreference;
	if (initialTheme === "system") {
		if (prefersHighContrast) {
			initialTheme = prefersDarkMode ? "dark-high-contrast" : "light-high-contrast";
		} else {
			initialTheme = prefersDarkMode ? "dark" : "light";
		}
	}
	const htmlElement = document.documentElement;
	htmlElement.classList.remove(...themes);
	htmlElement.classList.add(initialTheme);
	htmlElement.dataset.appliedTheme = initialTheme;
	htmlElement.dataset.theme = themePreference;
})();
`.trim();
}

/**
 * PreventWrongThemeFlash is a React component that prevents the wrong theme from flashing on initial page load.
 * Render as high as possible in the DOM, preferably in the <head> element.
 */
const PreventWrongThemeFlash = () => (
	<script
		dangerouslySetInnerHTML={{
			__html: preventWrongThemeFlashScriptContent(),
		}}
	/>
);

export type { Theme, ThemeProviderProps };
export {
	isTheme,
	PreventWrongThemeFlash,
	preventWrongThemeFlashScriptContent,
	theme,
	ThemeProvider,
	useAppliedTheme,
	useTheme,
};
