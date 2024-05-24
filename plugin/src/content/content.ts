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

//#1 Check if the page is a form, can just check for form and input tags?
// const body = document.querySelector("body")?.innerHTML;
// console.log(document.querySelector("body")?.innerHTML);
// const prompt =
//   "Does the following HTML contain a HTML Form div with inputs? Respond only yes or no. \n HTML: \n" +
//   body;
// chrome.runtime.sendMessage({ type: C.llm_generate, prompt }, (resp) => {
//   debug("RESP", resp);
// });

// #2 If yes, then add Controls to the page with a start button to start the process

// #3 On start, go to first value

// #4

// A Parse page to get all form inputs with labels in order
// i Use the already written label getter looking around the input
// ii For radio buttons, get all radio buttons in the same group
// iii For select, get all options
// I Could use LLMs to get the labels

addControls(parseForm);

// ARBITRARY PARSING
//8k token limit, so *4 character average rounded down to 3.5 = 8000 * 3.5 = 28000 characters
const LLM_MAX_LENGTH = 28000;
async function llmParseEverything() {
  const body = document.querySelector("body");
  if (!body) {
    return;
  }

  const resp = await llmParse(body);
  debug("FINAL RESP", resp);
  debug("YES CHILDREN", YES_CHILDREN);
  // const YES_YES_CHILDREN: Element[] = [];
  // for (const el of YES_CHILDREN) {
  //   const elHtml = el.outerHTML;
  //   const prompt = `Does the following HTML contain a single HTML input or a group of radios/checkboxes including a label of what the input means? Only respond with 'Y' or 'N' and nothing else! \n HTML: \n ${elHtml}`;
  //   const resp: string = await browser.runtime.sendMessage({
  //     type: C.llm_generate,
  //     prompt,
  //   });
  //   debug("PROMPT\n", prompt, "RESP\n", resp);
  //   if (resp === "Y") {
  //     YES_YES_CHILDREN.push(el);
  //   }
  // }

  // debug("YES CHILDREN", YES_CHILDREN);
  // debug("YES YES CHILDREN", YES_YES_CHILDREN);
}

const YES_CHILDREN: Element[] = [];

async function llmParse(el: HTMLElement): Promise<string> {
  const elHtml = el.outerHTML;
  const elChildren = Array.from(el.children);

  if (elChildren.length > 0) {
    const parsedChildren = await Promise.all(
      Array.from(el.children).map(async (child) => {
        const description = await llmParse(child as HTMLElement);
        return { el: child, description };
      }),
    );

    const resp = parsedChildren.some(
      (parsedChild) => parsedChild.description === "Y",
    )
      ? "Y"
      : "N";
    if (resp === "Y") {
      YES_CHILDREN.push(el);
    }
    return resp;

    // const basePrompt = `Does the following HTML descriptions contain a HTML form, editable text, or an input? Only respond with 'Y' or 'N' and nothing else! \n`;
    // const descriptions = `Descriptions: \n ${parsedChildren.map((parsedChild) => parsedChild.description).join("\n")}`;
    // const prompt = basePrompt + descriptions;
    // const resp: string = await browser.runtime.sendMessage({
    //   type: C.llm_generate,
    //   prompt,
    // });
    // if (resp === "Y") {
    //   YES_CHILDREN.push(el);
    // }
    // debug("PROMPT\n", prompt, "RESP\n", resp);
    // return resp;
  }

  const prompt = `Does the following HTML contain a HTML form, editable text, or an input? Only respond with 'Y' or 'N' and nothing else! \n HTML: \n ${elHtml}`;
  const resp: string = await browser.runtime.sendMessage({
    type: C.llm_generate,
    prompt,
  });
  if (resp === "Y") {
    YES_CHILDREN.push(el);
  }
  debug("PROMPT\n", prompt, "RESP\n", resp);
  return resp;
}

// FORM PARSING
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
  Array.from(parent.childNodes).forEach((child) => {
    // debug("CHILDREN", child);
    child;
    if (
      child === el ||
      (child.nodeType === 1 && isHidden(child as HTMLElement))
    ) {
      return;
    }

    if (child.nodeType === 1 && "innerText" in child && child.innerText) {
      debug("Found inner text", child.innerText);
      label = child.innerText as string;
    } else if (child.nodeType === 3 && child.textContent) {
      debug("Found text content", child.textContent);
      label = child.textContent as string;
    }
  });

  if (label) {
    return label;
  } else {
    return getNearbyLabel(parent);
  }
}

// Need to group checkboxs and radios

type SingleInput = {
  type: "TEXT" | "TEXTAREA" | "EMAIL" | "TEL";
  question: string | null;
  input: HTMLInputElement | HTMLTextAreaElement;
};

type SelectInput = {
  type: "SELECT";
  question: string | null;
  input: HTMLSelectElement;
  options: Array<string>;
};

type MultiInput = {
  type: "CHECKBOX" | "RADIO";
  question: string | null;
  inputs: {
    label: string | null;
    input: HTMLInputElement;
  }[];
};

type FormInput = SingleInput | SelectInput | MultiInput;

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

async function parseForm() {
  const elementsWithLabels: Array<{
    label: string | null;
    element: FormElement;
  }> = [];

  document.querySelectorAll("input, textarea, select").forEach((elRaw, j) => {
    const el = elRaw as FormElement;
    if (isHidden(el)) {
      return;
    }
    let label: string | null = null;

    elementsWithLabels.push({
      label: getNearbyLabel(el),
      element: el,
    });

    debug("el found", j, label, el, el.value);
  });
  debug("ELEMENTS", elementsWithLabels);

  // Group elements by label
  const formQuestions: Array<FormInput> = [];

  for (let i = 0; i < elementsWithLabels.length; i++) {
    const el = elementsWithLabels[i];
    const label = el.label;
    const element = el.element;

    switch (element.tagName) {
      case "SELECT":
        const options: Array<string> = [];
        if ("options" in element && element.options.length > 0) {
          for (let i = 0; i < element.options.length; i++) {
            options.push(element.options[i].value);
          }
        }

        formQuestions.push({
          type: "SELECT",
          question: label,
          input: element as HTMLSelectElement,
          options: options,
        });
        break;
      case "TEXTAREA":
        formQuestions.push({
          type: "TEXTAREA",
          question: label,
          input: element as HTMLTextAreaElement,
        });
        break;
      case "INPUT":
        switch (element.type) {
          case "text":
            formQuestions.push({
              type: "TEXT",
              question: label,
              input: element as HTMLInputElement,
            });
            break;
          case "email":
            formQuestions.push({
              type: "EMAIL",
              question: label,
              input: element as HTMLInputElement,
            });
            break;
          case "tel":
            formQuestions.push({
              type: "TEL",
              question: label,
              input: element as HTMLInputElement,
            });
            break;
          case "checkbox":
          case "radio":
            //get all radios and checkboxes in the same group
            const group: Array<{
              label: string | null;
              input: HTMLInputElement;
            }> = [];
            group.push({
              label: label,
              input: element as HTMLInputElement,
            });

            const groupName = element.getAttribute("name");
            let j = i + 1;
            while (j < elementsWithLabels.length) {
              const curEl = elementsWithLabels[j];
              if (
                curEl.element.tagName === "INPUT" &&
                curEl.element.getAttribute("name") === groupName
              ) {
                group.push({
                  // label: curEl.element.value || curEl.label,
                  label: curEl.label,
                  input: curEl.element as HTMLInputElement,
                });
              } else {
                break;
              }

              j++;
              i++;
            }

            debug("GROUP", group);
            formQuestions.push({
              type: el.element.type.toUpperCase() as "CHECKBOX" | "RADIO",
              question: await getGroupLabel(group),
              inputs: group,
            });
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  debug("FORM QUESTIONS", formQuestions);
}

function getParentList(el: HTMLElement) {
  const parents: Array<HTMLElement> = [];
  let curEl: HTMLElement | null = el;
  while (curEl) {
    parents.unshift(curEl);
    curEl = curEl.parentElement;
  }

  return parents;
}

async function getGroupLabel(
  group: Array<{ label: string | null; input: HTMLInputElement }>,
) {
  const inputs = group.map((g) => g.input);
  const lca = findLowestCommonAncestor(inputs);
  if (!lca) {
    return "";
  }

  const lcaHTML = lca?.outerHTML;

  const prompt = `${lcaHTML}\n Does the above HTML include BOTH the question text and its corresponding radio options? Answer only 'Y' or 'N'.`;

  const resp: string = await browser.runtime.sendMessage({
    type: C.llm_generate,
    prompt,
  });
  // debug("getGroupLabel", prompt, lca, resp);
  if (resp === "Y") {
    const prompt = `${lcaHTML}\n What is the question in the above HTML form group? Return only the question without quotes and nothing else.`;

    const resp: string = await browser.runtime.sendMessage({
      type: C.llm_generate,
      prompt,
    });
    // debug("getGroupLabel QUESTION", prompt, lca, resp);
    return resp;
  } else {
    // debug("getGroupLabel getNearbyLabel");
    return getNearbyLabel(lca);
  }
}

function findLowestCommonAncestor(nodes: FormElement[]) {
  const parents = nodes.map((node) => getParentList(node));
  debug("PARENTS", parents);

  // Find the lowest common ancestor
  let i = 0;
  const minLength = Math.min(...parents.map((p) => p.length));
  while (i < minLength) {
    const isInvalid = parents.some((p) => p[i] !== parents[0][i]);
    if (isInvalid) {
      break;
    }

    i++;
  }

  if (i === 0) {
    return null;
  }

  return parents[0][i - 1]; // Return the last matching parent
}
