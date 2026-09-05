import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

/** Serves the Stockfish (lite, multi-threaded) engine script. Needs a cross-origin-isolated page (COOP/COEP). */
export async function GET() {
  const require = createRequire(import.meta.url);
  let path;
  try {
    path = require.resolve("stockfish/bin/stockfish-18-lite.js");
  } catch {
    throw new Error(
      "chessEngine: true requires the `stockfish` package. Run `npm i stockfish`.",
    );
  }
  return new Response(readFileSync(path), {
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      // A worker loaded from a cross-origin-isolated page must itself carry
      // a matching COEP header, or Chrome blocks the worker creation.
      "cross-origin-embedder-policy": "require-corp",
      "cross-origin-resource-policy": "same-origin",
    },
  });
}
