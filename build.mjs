import * as esbuild from "esbuild";
import { cpSync } from "node:fs";

await esbuild.build({
  entryPoints: ["qp-breakout.wc.js"],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: "esm",
  target: ["es2022"],
  outfile: "docs/qp-breakout.bundle.js",
});

cpSync("images", "docs/images", { recursive: true });
console.log("Build complete.");
