import { initTelomere } from "./telomere/telomere-wrapper";
import type { ParseResult } from "./telomere/wasm-interface-type";

const { processDelta } = await initTelomere();

console.log(processDelta("{"));

export { initTelomere, type ParseResult };
