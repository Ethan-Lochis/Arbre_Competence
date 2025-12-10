import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class BarbaMeView {
  constructor(svgid = undefined) {
    this.svgid = undefined;
    this.root = htmlToDOM(template);
    this.parts = [];
    let nodes = this.root.querySelectorAll("[data-id]");
    for (let node of nodes) {
      this.parts.push(node.getAttribute("data-id"));
    }

    if (svgid !== undefined) {
      this.svgid = svgid;
      this.root.setAttribute("data-svgid", svgid);
    }
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  has(elt) {
    return this.parts.includes(elt.getAttribute("data-id"));
  }

  getPaths() {
    return this.root.querySelectorAll("path");
  }

  getFills() {
    return this.root.querySelectorAll(".clr-corps, .oeil__fond");
  }
}
export { BarbaMeView };
