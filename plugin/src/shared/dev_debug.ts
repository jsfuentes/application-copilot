//include this in both content, service_worker, and popup script for debug messages
import debugMaker from "debug";

import { isDevMode } from "./utils";
const debug = debugMaker("app:scripts:dev_debug");

if (isDevMode()) {
  console.log(
    "Starting console debug mode (turn on verbose in console to see debug messages)"
  );
  debugMaker.enable("app:*");
  debug("Welcome to console debug mode");
}

if (chrome.management) {
  //Do stuff in popup and service worker
} else {
  //Do stuff in content script
}

//Debug local storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let key in changes) {
    const storageChange = changes[key];
    //not all in `` b/c it abbreivates objs there
    debug(
      `${namespace} ${key} changed from`,
      storageChange.oldValue,
      "to",
      storageChange.newValue
    );
  }
});

chrome.runtime.onMessage.addListener(msg => {
  debug("Message recieved", msg);
  // Content script debug messages will be slightly delayed
  // console.log("Message recieved", msg);
  return false;
});
