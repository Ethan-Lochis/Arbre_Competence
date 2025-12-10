import { htmlToDOM } from "@/lib/utils.js";
import { BarbaMeView } from "@/ui/BarbaMe";

import template from "./template.html?raw";

import { Animation } from "@/lib/animation.js";

let C = {};

C.init = function () {
  return V.init();
};

let V = {
  rootPage: null,
  barbapapa: null,
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.barbapapa = new BarbaMeView();
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(V.barbapapa.dom());

  // Passer l'élément DOM directement au lieu d'un sélecteur CSS
  const bpapElement = V.barbapapa.dom().querySelector("#bpap");
  Animation.drawLine(V.barbapapa.getPaths(), V.barbapapa.getFills(), 2);

  return V.rootPage;
};

V.attachEvents = function () {
  // no events to attach
};

export function SvgDemo4Page() {
  return C.init();
}
