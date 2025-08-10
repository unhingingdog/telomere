# telomere

A WASM-powered library to cap incomplete JSON streams.

`telomere` processes an incomplete or streaming JSON object or array and provides the exact sequence of characters required to close it, making it syntactically complete. It is a lightweight, high-performance wrapper around the Rust `telomere-json` crate, compiled to WebAssembly.

## Purpose

The primary goal of `telomere` is to cap an incomplete JSON stream in real-time. It was designed specifically for use cases like processing structured JSON output from Large Language Models (LLMs), where the stream might be cut off before all structures are properly closed.

It is a specialized lexer and state machine, not a general-purpose JSON parser or validator. Its key function is to distinguish between a JSON stream that is merely incomplete and one that is structurally corrupted, and to provide the "cap" for the former.

## Key Features

\* **Streaming-First**: Processes JSON chunk-by-chunk via the `processDelta` method. \* **Intelligent Completion**: Calculates the precise closing characters required (e.g., `"}`, `"]}`). \* **Robust Error Handling**: Differentiates between key states: \* **Success**: The stream is valid so far and a valid closing "cap" is provided. \* **NotClosable**: The stream is incomplete but not yet invalid (e.g., waiting for a value after a colon: `{"key":`). More data is required. \* **Corrupted**: The stream has a definitive syntax violation (e.g., `[}`) and can never be completed. This will throw an error. \* **Lightweight & Fast**: A small package with no heavy dependencies and a focused API, running at native speed via WASM. A performance test processing 1,000,000 nested objects runs in under 100ms on a modern machine.

## Best Used For

`telomere` is ideal for any situation where you receive potentially incomplete JSON and need to safely make it whole.

\* **Capping AI/LLM structured data streams**: If a language model is generating JSON and hits a token limit, `telomere` can correctly close the output it has produced so far. \* **Real-time data feeds**: Safely terminating partial JSON objects from a log or data feed that may be interrupted. \* **Repairing truncated files**: Providing the closing characters for a JSON file that was not fully written to disk.

\---

## Installation

\`\`\`bash
npm install telomere
\`\`\`

## Quick Start

The library must be initialized before use. It's best to initialize it once and reuse the instance.

\`\`\`typescript
import initTelomere, { type Telomere, type ParseResult } from "telomere";

// Initialize the WASM module.
// This returns a promise, so you should await it.
const telomere: Telomere = await initTelomere();

// --- Example 1: Successful completion ---
let result = telomere.processDelta('{ "key": [1, 2');
// result is: { type: "Success", cap: ']}' }
console.log(result);

// --- Example 2: Streaming deltas ---
// The balancer is stateful. You can process chunks sequentially.
telomere.reset(); // Reset the internal state for a new stream
telomere.processDelta("{");
telomere.processDelta('"a":');
const finalResult = telomere.processDelta("[1,");

// Now we can use the cap to complete the JSON
// For demonstration, let's say we know the full intended object was {"a":[1]}
const fullStream = `{"a":[1${finalResult.cap}`; // -> '{"a":[1]}' which is now complete. Note: cap might be more complex depending on input.

// --- Example 3: Unclosable state ---
// The stream is not yet corrupt, but can't be closed in its current state.
// This often happens when waiting for a value or the rest of a string.
const unclosableResult = telomere.processDelta('{ "key"');
// unclosableResult is: { type: "NotClosable" }
console.log(unclosableResult);

// --- Example 4: Corrupted stream ---
// The stream has a syntax error. This will throw an exception.
try {
telomere.processDelta('{"key": }');
} catch (e) {
// e.message will be "corrupted stream"
console.error(e);
}
\`\`\`

## API

### `initTelomere(wasm?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module): Promise<Telomere>`

Initializes the WebAssembly module. This must be called before any other functions can be used. You can optionally pass a source for the `.wasm` file, but in most environments (like Node.js and modern bundlers) it will be located automatically.

### `telomere: Telomere`

The `Telomere` object returned by the initializer contains the following methods:

#### `processDelta(delta: string): ParseResult`

Processes a string chunk of JSON. It maintains an internal state stack.

\* **`delta`**: A string containing a partial or complete piece of a JSON stream. \* **Returns**: A `ParseResult` object, which is one of two types: \* `{ type: "Success", cap: string }`: The stream is valid and can be closed. `cap` contains the string needed to close it. \* `{ type: "NotClosable" }`: The stream is in a state where it cannot be closed yet (e.g., after a key but before the value). \* **Throws**: An `Error` with the message `"corrupted stream"` if a syntax error is found that makes the JSON impossible to complete.

#### `reset(): void`

Resets the internal state of the balancer. Call this method when you want to start processing a completely new and separate JSON stream.

## Limitations

\* **Not a Validator**: `telomere` is not a full JSON validator. It does not validate data types, check for duplicate keys, or enforce all the rules of the JSON specification. Its purpose is strictly to provide the closing characters for a structurally sound but incomplete stream. \* **Performance**: While very fast, performance could be further improved by using a shared memory buffer to avoid marshalling string data between JavaScript and WASM. This is a potential future enhancement.

## License

\[MIT\](\./LICENSE)
