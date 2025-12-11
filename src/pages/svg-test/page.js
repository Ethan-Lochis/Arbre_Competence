import { treeView } from "@/ui/Test";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

import { Animation } from "@/lib/animation.js";

let C = {};

C.init = function () {
  return V.init();
};

let V = {
  rootPage: null,
  tree: null,
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.tree = new treeView();
  // Animation.rotateElement(V.tree.getComprendre(), 3, 285);
  // Animation.rotateElement(V.tree.getConcevoir(), 3, 235);
  for (let i = 1; i < 7; i++) {
    Animation.rotateElement(V.tree.getAC("150" + i), 4, 84 - i * 12);
  }
  for (let i = 1; i < 7; i++) {
    Animation.rotateElement(V.tree.getAC("140" + i), 4, 162 - i * 13);
  }
    for (let i = 1; i < 7; i++) {
    Animation.rotateElement(V.tree.getAC("130" + i), 4, 240 - i * 13);
  }

  for (let i = 1; i < 7; i++) {
    Animation.counterRotateElement(V.tree.getACcontent("130" + i), 4, -240 + i * 13);
  }

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.tree.dom());
  return V.rootPage;
};

export function SVGtest() {
  return C.init();
}
