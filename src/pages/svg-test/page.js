import { treeView } from "@/ui/Test";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";


import { Animation } from "@/lib/animation.js";

let M = {};
let response = await fetch('/src/data/stars.json');
M.data = await response.json();


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
 
  // Animation ouverture des branches
  for (let i = 1; i < 8; i++) {
    // Rotation autour du centre
    Animation.rotateElement(V.tree.getAC("150" + i), 4, 82 - i * 12); 
    Animation.rotateElement(V.tree.getAC("140" + i), 4, 159 - i * 12.5);
    Animation.rotateElement(V.tree.getAC("130" + i), 4, 230 - i * 12);
    Animation.rotateElement(V.tree.getAC("120" + i), 4, 278 - i * 12);
    Animation.rotateElement(V.tree.getAC("110" + i), 4, 351 - i * 12);
    // Rotation des contenus
    Animation.counterRotateElement(V.tree.getACcontent("150" + i), 4, -82 + i * 12);
    Animation.counterRotateElement(V.tree.getACcontent("140" + i), 4, -159 + i * 12.5);
    Animation.counterRotateElement(V.tree.getACcontent("130" + i), 4, -230 + i * 12);
    Animation.counterRotateElement(V.tree.getACcontent("120" + i), 4, -278 + i * 12);
    Animation.counterRotateElement(V.tree.getACcontent("110" + i), 4, -351 + i * 12);
  }
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.tree.dom());
  return V.rootPage;
};

export function SVGtest() {
  return C.init();
}
