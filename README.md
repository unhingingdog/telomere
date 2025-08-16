# telomere

A library for completing, or "capping," incomplete JSON streams.

`telomere` processes a partial JSON object or array and provides the exact sequence of characters required to make it syntactically valid. Its primary use case is completing structured data from sources that may be interrupted, such as LLM responses or real-time data feeds. It is a specialized tool designed for this single purpose, not a general-purpose JSON validator.

This is a WASM wrapper over the Rust `telomere-json` [crate](https://crates.io/crates/telomere_json).

## Installation

```bash
npm install telomere
```

## Usage

The library must be initialized before use. The `processDelta` function is stateful and can be called repeatedly as more data streams in.

```typescript
import { initTelomere } from "telomere";

// Initialize the library by calling the imported function
const telomereInstance = await initTelomere();

const partialJson = '{ "key": [1, 2, "hello"';
const result = telomereInstance.processDelta(partialJson);

switch (result.type) {
  case "Success":
    const completed = partialJson + result.cap;
    console.log("JSON completed:", completed);
    break;

  case "NotClosable":
    console.log("JSON is incomplete and needs more data.");
    break;
}

// For structurally invalid JSON, processDelta will throw an error.
try {
  telomereInstance.processDelta('{"key": }');
} catch (e) {
  console.error(e.message); // -> "corrupted stream"
}
```

## API

The public API consists of two functions:

- **`initTelomere()`**: Asynchronously loads and initializes the library. Returns a promise that resolves to the `telomere` instance.
- **`telomere.processDelta(chunk)`**: Processes a string chunk of JSON and returns a result object indicating the stream's state (`Success` or `NotClosable`), or throws an error if the stream is corrupted.

## Limitations

- **Not a Validator**: This library does not validate data types, check for duplicate keys, or enforce all JSON specification rules. Its only purpose is to provide the closing characters for a structurally sound but incomplete stream.

- **Unicode**: Unicode character values are not currently supported, and may cause unpredictable outputs.

## License

MIT
