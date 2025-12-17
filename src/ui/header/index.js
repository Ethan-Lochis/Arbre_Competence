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

    // Attacher l'événement d'import
    const importBtn = document.querySelector("#import-data-btn");
    const fileInput = document.querySelector("#import-file-input");
    
    if (importBtn && fileInput) {
      // Le bouton ouvre le sélecteur de fichier
      importBtn.addEventListener("click", () => {
        fileInput.click();
      });

      // Quand un fichier est sélectionné, on l'importe
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
          await DataManager.importUserData(file);
          // Réinitialise l'input pour permettre de réimporter le même fichier
          fileInput.value = "";
        }
      });
    }
  }
};

export { HeaderView };
