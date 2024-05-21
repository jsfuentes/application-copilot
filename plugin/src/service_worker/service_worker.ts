import browser from "webextension-polyfill";
const debug = require("debug")("app:background");

import { getAxios, getExtendedConfig } from "../shared/background";
import C from "../shared/constants";
import "../shared/dev_debug";
import { llmGenerate } from "../shared/utils";

debug("Hello from service worker");

async function urlChanged() {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  debug("Changed url", tabs[0]?.url);
  // var activeTab = tabs[0];
  // browser.tabs.sendMessage(activeTab.id, { message: "urlChanged" });
}

browser.webNavigation.onHistoryStateUpdated.addListener(urlChanged);

browser.runtime.onMessage.addListener((request) => {
  debug("Background request", request);
  if (request.type === C.llm_generate) {
    return new Promise((resolve) => {
      getAxios().then(async (axios) => {
        const resp = await llmGenerate(axios, request.prompt);
        debug("Axios:", resp);
        resolve(resp);
      });
    });
  }
});

getExtendedConfig().then((config) => debug("Config:", config));
getAxios().then((axios) => debug("Axios:", axios));
