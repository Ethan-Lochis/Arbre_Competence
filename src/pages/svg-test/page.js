import { treeView } from "@/ui/Test";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

import { Animation } from "@/lib/animation.js";

let M = {};
let response = await fetch("/src/data/SAE.json");
M.data = await response.json();

let C = {};

C.init = function () {
  return V.init();
};

let V = {
  rootPage: null,
  tree: null,
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.tree = new treeView();

  // Animation ouverture des branches

  // Insère le SVG dans la page
  let svgSlot = V.rootPage.querySelector('slot[name="svg"]');
  svgSlot.replaceWith(V.tree.dom());

  // Lance l'animation d'ouverture
  V.tree.openingAnimation();

  // Attache les événements APRÈS l'insertion
  V.attachEvents();

  return V.rootPage;
};

V.attachEvents = function () {
  console.log("Attachement des événements...");

  // Trouve le SVG dans la page
  let svg = V.rootPage.querySelector("svg");
  if (!svg) {
    console.error("SVG non trouvé dans V.rootPage!");
    return;
  }

  console.log("SVG trouvé:", svg);
  console.log("Données chargées:", Object.keys(M.data).length, "compétences");

  // Parcourt toutes les compétences dans M.data
  for (let competenceId in M.data) {
    let competence = M.data[competenceId];

    // Parcourt tous les niveaux
    competence.niveaux?.forEach((niveau) => {
      // Parcourt toutes les ACs
      niveau.acs?.forEach((ac) => {
        // Convertit AC11.01 en AC1101 pour matcher le nom du composant SVG
        let acCode = ac.code.replace(".", ""); // "AC11.01" -> "AC1101"
        // Cherche dans le SVG (acCode contient déjà "AC")
        let acElement = svg.querySelector("#" + acCode);

        console.log(
          `AC ${ac.code} (#${acCode}):`,
          acElement ? "Trouvé ✓" : "NON TROUVÉ ✗",
        );

        if (acElement) {
          acElement.style.cursor = "pointer";
          acElement.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log(`Clic détecté sur ${ac.code}`);

            // Affiche le libellé dans le panneau
            let panel = V.rootPage.querySelector("#info-panel");
            let codeEl = V.rootPage.querySelector("#info-code");
            let libelleEl = V.rootPage.querySelector("#info-libelle");

            if (panel && codeEl && libelleEl) {
              codeEl.textContent = ac.code;
              libelleEl.textContent = ac.libelle;

              // Positionne le panneau aux coordonnées du clic
              const x = e.clientX;
              const y = e.clientY;

              // Ajuste la position pour que le panneau ne sorte pas de l'écran
              const panelWidth = 400; // max-width du panneau
              const panelHeight = 250; // hauteur estimée
              const margin = 20;

              let left = x + margin;
              let top = y + margin;

              // Si le panneau dépasse à droite, le place à gauche du clic
              if (left + panelWidth > window.innerWidth) {
                left = x - panelWidth - margin;
              }

              // Si le panneau dépasse en bas, le place au-dessus du clic
              if (top + panelHeight > window.innerHeight) {
                top = y - panelHeight - margin;
              }

              // S'assure que le panneau ne sort pas par la gauche ou le haut
              left = Math.max(margin, left);
              top = Math.max(margin, top);

              panel.style.left = left + "px";
              panel.style.top = top + "px";
              panel.style.right = "auto"; // Désactive la position right fixe
              panel.style.display = "block";
            }
          });
        }
      });
    });
  }

  // Ferme le panneau au clic sur le bouton
  let closeBtn = V.rootPage.querySelector("#close-info");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      V.rootPage.querySelector("#info-panel").style.display = "none";
    });
  }

  // Bouton pour ajouter un niveau
  let addNiveauBtn = V.rootPage.querySelector("#add-niveau");
  if (addNiveauBtn) {
    addNiveauBtn.addEventListener("click", () => {
      console.log("Ajouter un niveau");
      // TODO: Implémenter la logique d'ajout de niveau
    });
  }

  // Bouton pour retirer un niveau
  let removeNiveauBtn = V.rootPage.querySelector("#remove-niveau");
  if (removeNiveauBtn) {
    removeNiveauBtn.addEventListener("click", () => {
      console.log("Retirer un niveau");
      // TODO: Implémenter la logique de retrait de niveau
    });
  }
};

export function SVGtest() {
  return C.init();
}
