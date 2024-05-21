import browser from "webextension-polyfill";
const debug = require("debug")("app:content");

import C from "../shared/constants";
import "../shared/dev_debug";
import addControls from "./controls";

debug("Sample content script runs");
browser.storage.sync.get(["test"]).then(async (storage) => {
  const newVal = storage.test !== undefined ? storage.test + 1 : 0;
  await browser.storage.sync.set({
    test: newVal,
  });
});

//#1 Check if the page is a form
const body = document.querySelector("body")?.innerHTML;
console.log(document.querySelector("body")?.innerHTML);
const prompt =
  "Does the following HTML contain a form? Respond only yes or no. \n HTML: \n" +
  body;
chrome.runtime.sendMessage({ type: C.llm_generate, prompt }, (resp) => {
  debug("RESP", resp);
});

addControls();

function isHidden(el: HTMLElement) {
  const computedStyle = window.getComputedStyle(el);

  return (
    computedStyle.visibility === "hidden" ||
    computedStyle.display === "none" ||
    ("type" in el && el.type === "hidden")
  );
}

function getNearbyLabel(el: HTMLElement) {
  // debug("Checking for nearby label", el);
  const parent = el.parentElement;
  if (!parent) {
    debug("No parent");
    return null;
  }

  let label: string | null = null;
  Array.from(parent.children).forEach((child) => {
    if (child === el || isHidden(child as HTMLElement)) {
      return;
    }

    if ("innerText" in child && child.innerText) {
      // debug("Found inner text", child.innerText);
      label = child.innerText as string;
    }
  });

  if (label) {
    return label;
  } else {
    return getNearbyLabel(parent);
  }
}

// function getRadioGroup(el: HTMLInputElement) {
//   const parent = el.parentElement;
//   if (!parent) {
//     debug("No parent");
//     return null;
//   }

//   let radios: HTMLInputElement[] = [];
//   Array.from(parent.children).forEach((child) => {
//     if (child === el || isHidden(child as HTMLElement)) {
//       return;
//     }

//     if ("tagName" in child && child.tagName === "INPUT") {
//       radios.push(child as HTMLInputElement);
//     }
//   });

//   if (radios.length > 1) {
//     return radios;
//   } else {
//     return getRadioGroup(parent);
//   }
// }

function fillForm() {
  document.querySelectorAll("input, textarea, select").forEach((elRaw, j) => {
    const el = elRaw as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    if (isHidden(el)) {
      return;
    }
    let label: string | null = null;

    switch (el.tagName) {
      case "SELECT":
        label = getNearbyLabel(el);

        if ("options" in el && el.options.length > 0) {
          el.value = el.options[1].value;
        }
        debug("OPTIONS", el.options);
        //skip for now
        return;
      case "TEXTAREA":
        label = getNearbyLabel(el);
        el.value = label || "";
        break;
      case "INPUT":
        label = getNearbyLabel(el);

        switch (el.type) {
          case "text":
            el.value = label || "";
            break;
          case "checkbox":
            //skip for now
            return;
          case "email":
            el.value = label || "";
            //skip for now
            return;
          case "radio":
            //handled seperately
            return;
          default:
            break;
        }

        break;
      default:
        break;
    }

    debug("el found", j, label, el);
  });
}
