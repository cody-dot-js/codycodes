import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { staleBuild } from "./stale-build.ts";

/** The router hooks that tell `staleBuild` when a navigation starts. */
const INSTRUMENTATIONS = [staleBuild.instrumentation];

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter unstable_fetch={staleBuild.fetch} instrumentations={INSTRUMENTATIONS} />
		</StrictMode>,
	);
});
