import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

/** Serves the Stockfish (lite, multi-threaded) WASM binary. Needs a cross-origin-isolated page (COOP/COEP). */
export async function GET() {
  const require = createRequire(import.meta.url);
  let path;
  try {
    path = require.resolve("stockfish/bin/stockfish-18-lite.wasm");
  } catch {
    throw new Error(
      "chessEngine: true requires the `stockfish` package. Run `npm i stockfish`.",
    );
  }
  return new Response(readFileSync(path), {
    headers: {
      "content-type": "application/wasm",
      "cross-origin-resource-policy": "same-origin",
    },
  });
}
