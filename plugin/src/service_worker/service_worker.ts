const debug = require("debug")("app:background");

import { getAxios, getExtendedConfig } from "../shared/background";
import "../shared/dev_debug";

chrome.webNavigation.onHistoryStateUpdated.addListener(urlChanged);

debug("Hello from service worker");
async function urlChanged() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  debug("Changed url", tabs[0]?.url);
  // var activeTab = tabs[0];
  // chrome.tabs.sendMessage(activeTab.id, { message: "urlChanged" });
}

getExtendedConfig().then(config => debug("Config:", config));
getAxios().then(axios => debug("Axios:", axios));
