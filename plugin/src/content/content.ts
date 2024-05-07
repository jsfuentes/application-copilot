const debug = require("debug")("app:content");

import "../shared/dev_debug";

debug("Sample content script runs");

chrome.storage.sync.get(["test"]).then(async storage => {
  const newVal = storage.test !== undefined ? storage.test + 1 : 0;
  await chrome.storage.sync.set({
    test: newVal
  });
});
