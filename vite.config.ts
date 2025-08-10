import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "url";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    includeSource: ["src/**/*.{ts,tsx}"],
  },
  plugins: [wasm(), tsconfigPaths()],
  resolve: {
    alias: [
      {
        find: /^@telomere\/wasm$/,
        replacement: fileURLToPath(
          new URL(
            "./telomere-json-wasm/src/pkg/telomere_json_wasm.js",
            import.meta.url,
          ),
        ),
      },
    ],
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib.ts"),
      name: "telomere",
      formats: ["es"],
      fileName: "telomere",
    },
    target: "esnext",
  },
});
