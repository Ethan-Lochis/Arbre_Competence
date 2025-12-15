import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class InfosView {

    constructor() {
        this.root = htmlToDOM(template);
    }

    html() {
        return template;
    }

    dom() {
        return this.root;
    }

 
}
export { InfosView };