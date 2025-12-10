import { htmlToDOM, randomHexaColor } from "@/lib/utils.js";
import template from "./template.html?raw";

class StarView {

  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  getName() {
    return this.root.getAttribute('data-name');
  }

  setFillColor(color) {
    this.root.querySelector('polygon').setAttribute('fill', color);
  }

  setStrokeColor(color) {
    this.root.querySelector('polygon').setAttribute('stroke', color);
  }

  setTransformScale(scale) {
    this.root.setAttribute('transform', `scale(${scale})`);
  }
  
}
export { StarView };