import { htmlToDOM } from "../../lib/utils.js";
import template from "./template1.html?raw";

class treeView {
  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  getAC1101() {
    return this.root.querySelector("#AC11\\.06");
  }
  getComprendre() {
    return this.root.querySelector("#Comprendre");
  }
   getConcevoir() {
    return this.root.querySelector("#Concevoir");
  }
  getAC(code){
    return this.root.querySelector("#AC"+code);
  }
  getACcontent(code) {
    return this.root.querySelector("#AC" + code +"__Content");
}
  }
export { treeView };
