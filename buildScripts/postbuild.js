#!/usr/bin/env node
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const src = join(
  __dirname,
  "..",
  "telomere-json-wasm",
  "src",
  "pkg",
  "telomere_json_wasm_bg.wasm",
);
const destDir = join(__dirname, "..", "dist");
const dest = join(destDir, "telomere_json_wasm_bg.wasm");

mkdirSync(destDir, { recursive: true });
if (!existsSync(src)) {
  console.error(
    `Missing wasm at ${src}. Run "npm run build:wasm:release" first.`,
  );
  process.exit(1);
}
copyFileSync(src, dest);
console.log(`Copied: ${relative(process.cwd(), dest)}`);
