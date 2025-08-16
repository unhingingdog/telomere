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

it("correctly handles a closable input", async () => {
  const result = telomere.processDelta("{");
  expect(result).toStrictEqual({
    type: "Success",
    cap: "}",
  });
});

it("correctly handles an unclosable input", async () => {
  // Not closable when mid object key state.
  const result = telomere.processDelta('{ "ke');
  expect(result).toStrictEqual({
    type: "NotClosable",
  });
});

it("correctly handles corrupt input", async () => {
  // stack is corrput if no opening bracket
  expect(() => telomere.processDelta("]")).toThrowError(
    new Error("corrupted stream"),
  );
});

it("correctly handles a series of inputs", async () => {
  // {
  const result = telomere.processDelta("{");
  expect(result).toStrictEqual({
    type: "Success",
    cap: "}",
  });

  // { "ke
  const result2 = telomere.processDelta(' "ke');
  expect(result2).toStrictEqual({
    type: "NotClosable",
  });

  // { "key"
  const result3 = telomere.processDelta('y"');
  expect(result3).toStrictEqual({
    type: "NotClosable",
  });

  // { "key":
  const result4 = telomere.processDelta(":");
  expect(result4).toStrictEqual({
    type: "NotClosable",
  });

  // { "key": "val
  const result5 = telomere.processDelta('"val');
  expect(result5).toStrictEqual({
    type: "Success",
    cap: '"}',
  });

  // { "key": "value"
  const result6 = telomere.processDelta('ue"');
  expect(result6).toStrictEqual({
    type: "Success",
    cap: "}",
  });

  // { "key": "value"
  const result7 = telomere.processDelta("}");
  expect(result7).toStrictEqual({
    type: "Success",
    cap: "",
  });
});
