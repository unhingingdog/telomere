import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [
    wasm(),
    tsconfigPaths(),
    dts({
      outDir: "dist",
      entryRoot: "src/telomere",
      include: ["src/telomere/**/*.ts"],
      exclude: ["**/*.test.ts", "**/__tests__/**", "src/telomere/testUtils.ts"],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      "@telomere/wasm": fileURLToPath(
        new URL(
          "./telomere-json-wasm/src/pkg/telomere_json_wasm.js",
          import.meta.url,
        ),
      ),
    },
  },
  build: {
    target: "esnext",
    emptyOutDir: true,
    lib: {
      entry: "src/telomere/index.ts",
      formats: ["es"],
      fileName: () => "index.js",
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
