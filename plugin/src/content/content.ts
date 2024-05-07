const debug = require("debug")("app:content");

import "../shared/dev_debug";

debug("Sample content script runs");

chrome.storage.sync.get(["test"]).then(async (storage) => {
  const newVal = storage.test !== undefined ? storage.test + 1 : 0;
  await chrome.storage.sync.set({
    test: newVal,
  });
});

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
      debug("Found inner text", child.innerText);
      label = child.innerText as string;
    }
  });

  if (label) {
    return label;
  } else {
    return getNearbyLabel(parent);
  }
}

// document.querySelectorAll("form").forEach((form, i) => {
//   debug("Form founds", i, form);

document.querySelectorAll("input").forEach((input, j) => {
  if (isHidden(input)) {
    return;
  }

  let label: string | null = null;
  if (input.type === "text") {
    if (input.name === "name") {
      input.value = "John Doe";
    }

    label = getNearbyLabel(input);
  } else if (input.type === "checkbox") {
    //skip for now
    return;
  } else if (input.type === "email") {
    label = getNearbyLabel(input);
  } else if (input.type === "radio") {
    //handled seperately
  }

  debug("Input found", j, label, input);
  input.value = label || "";
});
// });

//how to structure code
