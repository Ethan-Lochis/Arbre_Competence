import { ShapesView } from "@/ui/shapes/index.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

import { Animation } from "@/lib/animation.js";

let C = {};


C.init = function() {
  return V.init();
}

let V = {
  rootPage: null,
  shapes: null
};

V.init = function() {
  V.rootPage = htmlToDOM(template);
  V.shapes = new ShapesView();
  V.rootPage.querySelector('slot[name="svg"]').replaceWith( V.shapes.dom() );

  Animation.rotateElement( V.shapes.getSquare(), 5 );
  Animation.rotateElement( V.shapes.getTriangle(), 3 );
  Animation.rotateElement( V.shapes.getOctagon(), 8 );
  Animation.colorTransition( V.shapes.getSquare(), '#ffffff', '#0000ff', 10 );
  Animation.colorTransition( V.shapes.getTriangle(), '#00ff00', '#ff00ff', 10 );
  Animation.colorTransition( V.shapes.getOctagon(), '#0000ff', '#ffff00', 10 ); 

  return V.rootPage;
};

V.attachEvents = function() {
  // no events to attach
}

export function SvgDemo3Page() {
  return C.init();
}