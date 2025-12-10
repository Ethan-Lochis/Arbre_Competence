import { StarView } from "@/ui/star/index.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

import { Animation } from "@/lib/animation.js";

let M = {};

let response = await fetch('/src/data/stars.json');
M.starsData = await response.json();

let C = {};

C.handler_clickStar = function(ev) {
  if (ev.target.dataset.name === 'star') {
    Animation.bounce( ev.target, 1.5, 50 );
  }
};


C.init = function() {

  return V.init();
}

let V = {
  rootPage: null,
  stars: []
};

V.init = function(starsData = M.starsData) {
  V.rootPage = htmlToDOM(template);
  let container = document.createElement('div');

  for (let s of starsData) {
    const star = new StarView();
    star.setFillColor(s.fill);
    star.setStrokeColor(s.stroke);
    star.setTransformScale(s.scale);
    V.stars.push(star);
    container.appendChild(star.dom());
  }

  V.rootPage.querySelector('slot[name="svg"]').replaceWith(container);
  V.attachEvents();
  return V.rootPage;
};

V.attachEvents = function() {
  V.rootPage.addEventListener('click', C.handler_clickStar);
};

export function SvgDemo5Page() {
  return C.init();
};