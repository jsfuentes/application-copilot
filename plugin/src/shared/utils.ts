import { AxiosInstance } from "axios";
import browser from "webextension-polyfill";
const debug = require("debug")("app:shared:utils");

let isDev: boolean;
export function isDevMode() {
  if (isDev === undefined) {
    if (typeof browser.runtime.getManifest) {
      isDev = !("update_url" in browser.runtime.getManifest());
      console.log("isDev", isDev, browser.runtime.getManifest());
    } else {
      isDev = true;
      console.log("browser.runtime.getManifest not found, so isDev", isDev);
    }
  }

  return isDev;
}

export async function llmGenerate(axios: AxiosInstance, prompt: string) {
  // debug("Sending to llama", prompt);
  debug("Sending to llama", prompt);
  const resp = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3:latest",
    prompt,
    stream: false,
  });

  debug("Response from LLAMA", resp);
  return resp.data.response;
}
