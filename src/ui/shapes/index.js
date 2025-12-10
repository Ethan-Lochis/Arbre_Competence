import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

class ShapesView {

  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  getSquare() {
    return this.root.querySelector('[data-name="square"]');
  }

  getTriangle() {
    return this.root.querySelector('[data-name="triangle"]');
  }

  getOctagon() {
    return this.root.querySelector('[data-name="octagon"]');
  }

  getOctagon() {
    return this.root.querySelector('[data-name="octagon"]');
  }

  getName() {
    return this.root.getAttribute('data-name');
  }
  
  
}
export { ShapesView };