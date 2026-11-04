import type { ReactNode } from "react";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
} from "react-router";

import type { Route } from "./+types/root";
import { SITE_NAME } from "./site.ts";

import geistUrl from "@fontsource-variable/geist/wght.css?url";
import jetbrainsMonoUrl from "@fontsource-variable/jetbrains-mono/wght.css?url";
import globalUrl from "./global.css?url";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: geistUrl },
	{ rel: "stylesheet", href: jetbrainsMonoUrl },
	{ rel: "stylesheet", href: globalUrl },
	{ rel: "icon", href: "/favicon.ico", sizes: "48x48" },
	{ rel: "alternate", type: "application/rss+xml", title: SITE_NAME, href: "/rss.xml" },
];

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en-US" dir="ltr">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<meta name="theme-color" content="#02121a" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	const heading = isRouteErrorResponse(error)
		? `${error.status} ${error.statusText}`
		: "Something broke";
	return (
		<main className="mx-auto grid max-w-3xl gap-4 px-4 py-24">
			<p className="font-mono text-xs tracking-widest text-label uppercase">error</p>
			<h1 className="text-4xl font-semibold tracking-tight">{heading}</h1>
			<p className="text-label">
				The shrimp lost the current.{" "}
				<a href="/" className="text-blush underline">
					Swim home.
				</a>
			</p>
		</main>
	);
}
