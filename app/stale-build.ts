import { staleBuildReactRouter } from "@ngrok/app-server/client";

/**
 * Moves an open tab to the new build at its next navigation after a deploy,
 * so the old code never renders the new build's data. The server sends the
 * build ID on each document and data response.
 */
export const staleBuild = staleBuildReactRouter();
