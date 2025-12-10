import { SpinnerView } from "@/ui/spinner/index.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

let C = {};

C.handler_click = function(ev) {
    if (ev.target.dataset.name === V.spinner.getName() ) {
        V.spinner.changeColor();
    }
};

C.init = function() {
  return V.init();
}

let V = {
  rootPage: null,
  spinner: null
};
 
V.init = function() {
 
  // ici on va mémoriser notre composant  dans V pour y 
  // accéder plus facilement plus tard (C.handler_click)
  V.spinner = new SpinnerView();
  V.rootPage = htmlToDOM(template);
  console.log(V.rootPage);
  V.rootPage.querySelector('slot[name="svg"]').replaceWith( V.spinner.dom() );
  V.attachEvents();
  return V.rootPage;
};

V.attachEvents = function() {
    V.rootPage.addEventListener("click", C.handler_click);
}

export function SvgDemo2Page() {
  return C.init();
}