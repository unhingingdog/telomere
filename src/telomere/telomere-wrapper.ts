import initWasm, { WasmBalancer } from "@telomere/wasm";
import type { ParseResult } from "./wasm-interface-type";

let initialized = false;

export async function __initForTests(
  input: Response | BufferSource | WebAssembly.Module,
) {
  await initWasm(input);
  initialized = true;
}

export interface Telomere {
  processDelta(delta: string): ParseResult;
  reset(): void;
}

export const initTelomere = async (
  wasm?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module,
): Promise<Telomere> => {
  if (!initialized) {
    await initWasm(wasm);
    initialized = true;
  }

  let b = new WasmBalancer();

  return {
    // This ugly, seemingly redundant fn wrapping is required to stop it from binding
    // 'this' to call site.
    processDelta: (delta: string) => b.processDelta(delta),
    reset: () => {
      b = new WasmBalancer();
    },
  };
};
