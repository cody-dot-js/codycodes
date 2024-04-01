import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { MetaFunction } from "@vercel/remix";
import { PreventWrongThemeFlash, ThemeProvider } from "./components/theme-provider";
import "./tailwind.css";

export const meta: MetaFunction = () => {
	return [{ title: "codycod.es" }, { name: "description", content: "Ello gov'na!" }];
};

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en-US" dir="ltr">
			<head>
				<PreventWrongThemeFlash />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<ThemeProvider>{children}</ThemeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
