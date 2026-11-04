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
import { SwimmingFavicon } from "./features/favicon/swimming-favicon.tsx";
import { SITE_NAME, X_HANDLE } from "./site.ts";
import { staleBuild } from "./stale-build.ts";

import geistUrl from "@fontsource-variable/geist/wght.css?url";
import jetbrainsMonoUrl from "@fontsource-variable/jetbrains-mono/wght.css?url";
import globalUrl from "./global.css?url";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: geistUrl },
	{ rel: "stylesheet", href: jetbrainsMonoUrl },
	{ rel: "stylesheet", href: globalUrl },
	{ rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
	{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
	{ rel: "alternate", type: "application/rss+xml", title: SITE_NAME, href: "/rss.xml" },
	{ rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
	{ rel: "manifest", href: "/site.webmanifest" },
];

/** Loads the target of a navigation as a document when the tab knows of a newer build. */
export const clientMiddleware = [staleBuild.middleware];

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en-US" dir="ltr">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<meta name="theme-color" content="#02121a" />
				{/* Why here: these tags are the same on every page. `pageMeta` writes the ones that differ. */}
				<meta name="author" content={SITE_NAME} />
				<meta property="og:site_name" content={SITE_NAME} />
				<meta property="og:locale" content="en_US" />
				<meta name="twitter:site" content={`@${X_HANDLE}`} />
				<meta name="twitter:creator" content={`@${X_HANDLE}`} />
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
	return (
		<>
			<SwimmingFavicon />
			<Outlet />
		</>
	);
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
