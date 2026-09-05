import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

/** Serves the Stockfish (lite, single-threaded) engine script from the consumer's `stockfish` package. */
export async function GET() {
  const require = createRequire(import.meta.url);
  let path;
  try {
    path = require.resolve("stockfish/bin/stockfish-18-lite-single.js");
  } catch {
    throw new Error(
      "chessEngine: true requires the `stockfish` package. Run `npm i stockfish`.",
    );
  }
  return new Response(readFileSync(path), {
    headers: { "content-type": "text/javascript; charset=utf-8" },
  });
}
