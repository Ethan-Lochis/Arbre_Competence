import { htmlToDOM, randomHexaColor } from "@/lib/utils.js";
import template from "./template.html?raw";

class SpinnerView {

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

  changeColor() {
    const newColor = randomHexaColor();
    this.root.querySelector('circle').setAttribute('stroke', newColor);
  }
  
}
export { SpinnerView };