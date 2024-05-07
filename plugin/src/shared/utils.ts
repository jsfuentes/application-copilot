const debug = require("debug")("app:shared:utils");

let isDev: boolean;
export function isDevMode() {
  if (isDev === undefined) {
    if (typeof chrome.runtime.getManifest) {
      isDev = !("update_url" in chrome.runtime.getManifest());
      console.log("isDev", isDev, chrome.runtime.getManifest());
    } else {
      isDev = true;
      console.log("chrome.runtime.getManifest not found, so isDev", isDev);
    }
  }

  return isDev;
}
