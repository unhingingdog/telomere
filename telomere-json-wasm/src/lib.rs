use js_sys::{Error as JsError, Object, Reflect};
use serde::Serialize;
use serde_wasm_bindgen as swb;
use telomere_json::{Error, JSONBalancer};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmBalancer {
    balancer: JSONBalancer,
}

#[derive(Serialize)]
#[serde(tag = "type")]
enum ParseDeltaResult {
    Success { cap: String },
    NotClosable,
}

#[wasm_bindgen]
impl WasmBalancer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        #[cfg(all(feature = "console_error_panic_hook", target_arch = "wasm32"))]
        console_error_panic_hook::set_once();

        Self {
            balancer: JSONBalancer::new(),
        }
    }

    #[wasm_bindgen(js_name = processDelta)]
    pub fn process_delta(&mut self, delta: &str) -> Result<JsValue, JsValue> {
        match self.balancer.process_delta(delta) {
            Ok(cap) => Ok(swb::to_value(&ParseDeltaResult::Success { cap }).unwrap()),
            Err(Error::NotClosable) => Ok(swb::to_value(&ParseDeltaResult::NotClosable).unwrap()),
            Err(e) => Err(js_sys::Error::new(&e.to_string()).into()),
        }
    }
}

#[wasm_bindgen(start)]
pub fn start() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
