import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  initTelomere,
  __initForTests,
  type Telomere,
} from "../telomere-wrapper";
import { makeOpenJSONPrefix } from "./testUtils";

let bytes: NonSharedBuffer;
let telomere: Telomere;

beforeEach(async () => {
  bytes = readFileSync(
    fileURLToPath(
      new URL(
        "../../../telomere-json-wasm/src/pkg/telomere_json_wasm_bg.wasm",
        import.meta.url,
      ),
    ),
  );

  await __initForTests(bytes); // pre-init via SAME module instance

  telomere = await initTelomere();
});

// Just a dumb benchmark. Should pass on any machine that can install this.
// It does ~36MB/s on my M1 MBP.
it("runs fast", () => {
  const levels = 1_000_000;

  const input = makeOpenJSONPrefix(levels);

  performance.mark("op:start");
  const result = telomere.processDelta(input);
  performance.mark("op:end");

  expect(result).toStrictEqual({
    type: "Success",
    cap: "}".repeat(levels),
  });

  const { duration } = performance.measure("op", "op:start", "op:end");
  console.info(`Perf test ran for ${levels} levels in ${duration}ms`);

  expect(duration).toBeLessThan(levels / 100);
});
