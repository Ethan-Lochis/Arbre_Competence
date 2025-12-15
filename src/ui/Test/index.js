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

  
  // Animation ouverture des branches
  openingAnimation() {
    for (let i = 1; i < 8; i++) {
      // Rotation autour du centre
      Animation.rotateElement(this.getAC("150" + i), 4, 82 - i * 12);
      Animation.rotateElement(this.getAC("140" + i), 4, 159 - i * 12.5);
      Animation.rotateElement(this.getAC("130" + i), 4, 230 - i * 12);
      Animation.rotateElement(this.getAC("120" + i), 4, 278 - i * 12);
      Animation.rotateElement(this.getAC("110" + i), 4, 351 - i * 12);
      // Rotation des contenus
      Animation.counterRotateElement(
        this.getACcontent("150" + i),
        4,
        -82 + i * 12,
      );
      Animation.counterRotateElement(
        this.getACcontent("140" + i),
        4,
        -159 + i * 12.5,
      );
      Animation.counterRotateElement(
        this.getACcontent("130" + i),
        4,
        -230 + i * 12,
      );
      Animation.counterRotateElement(
        this.getACcontent("120" + i),
        4,
        -278 + i * 12,
      );
      Animation.counterRotateElement(
        this.getACcontent("110" + i),
        4,
        -351 + i * 12,
      );
    }
  }
}
export { treeView };
