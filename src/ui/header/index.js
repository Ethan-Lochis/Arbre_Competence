import { htmlToDOM  } from "../../lib/utils.js";
import { Animation } from "../../lib/animation.js";
import { DataManager } from "../../data/dataManager.js";
import template from "./template.html?raw";

// HeaderView est un composant statique
// on ne fait que charger le template HTML
// en donnant la possibilité de l'avoir sous forme html ou bien de dom
let HeaderView = {
  html: function () {
    return template;
  },

  dom: function () {
    return htmlToDOM(template);
  },

  init: function () {
    // Initialiser l'animation de hide/show au scroll
    const headerElement = document.querySelector(".header");
    if (headerElement) {
      Animation.hideHeaderOnScroll(headerElement);
    }

    // Attacher l'événement d'export
    const exportBtn = document.querySelector("#export-data-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", DataManager.exportUserData);
    }
  }
};

export { HeaderView };
