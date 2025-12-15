import { htmlToDOM } from "../../lib/utils.js";
import template from "./template1.html?raw";
import { Animation } from "../../lib/animation.js";

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

  getAC(code) {
    return this.root.querySelector("#AC" + code);
  }
  getACcontent(code) {
    return this.root.querySelector("#AC" + code + "__Content");
  }


  // Animation ouverture des branches ( AC, ACcontent)
  openingAnimation() { Animation.openBranches( (code) => this.getAC(code), (code) => this.getACcontent(code));}
}
export { treeView };
