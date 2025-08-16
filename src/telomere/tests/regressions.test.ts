import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  initTelomere,
  __initForTests,
  type Telomere,
} from "../telomere-wrapper";

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

it("replicates and validates the specific log failure scenario", () => {
  // This test replicates the exact state from the bug report log.
  // It processes the large initial chunk to get the parser into the specific state
  // that was causing the failure.
  const initialChunk = `{ "type": "container", "children": [ { "type": "heading", "level": 2, "content": "Let’s get started" }, { "type": "paragraph", "content": "Hi! Please provide your name and what you need help with." }, { "type": "form", "children": [ { "type": "input", "queryId": "user_name", "queryContent": "Your name" }, { "type": "input", "queryId": "user_need", "queryContent": "What do you need help with?" } ] `;
  telomere.processDelta(initialChunk);

  // This was the delta that caused the crash. It closes the "form" object.
  const failingDelta = "}";
  const result = telomere.processDelta(failingDelta);

  // The expected completion should close the top-level "children" array and the
  // top-level container object.
  expect(result).toStrictEqual({
    type: "Success",
    cap: "]}",
  });
});
