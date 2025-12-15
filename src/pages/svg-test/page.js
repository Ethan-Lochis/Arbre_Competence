import { treeView } from "@/ui/Test";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

import { Animation } from "@/lib/animation.js";

let M = {};

// Charge les données depuis localStorage ou depuis le fichier JSON
const savedData = localStorage.getItem("SAE_data");
if (savedData) {
  console.log("Chargement des données depuis localStorage");
  M.data = JSON.parse(savedData);
} else {
  console.log("Chargement des données depuis SAE.json");
  let response = await fetch("/src/data/SAE.json");
  M.data = await response.json();
}

// Fonction pour sauvegarder dans localStorage
M.saveData = function () {
  localStorage.setItem("SAE_data", JSON.stringify(M.data));
  console.log("Données sauvegardées dans localStorage");
};

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
  // Gestion de l'info bulle au clique 
  for (let competenceId in M.data) {
    let competence = M.data[competenceId];
    // Parcourt toutes les compétences dans M.data

    // Parcourt tous les niveaux
    competence.niveaux?.forEach((niveau, niveauIndex) => {
      // Parcourt toutes les ACs
      niveau.acs?.forEach((ac) => {
        // Convertit AC11.01 en AC1101 pour matcher le nom du composant SVG
        let acCode = ac.code.replace(".", ""); // "AC11.01" -> "AC1101"
        // Cherche dans le SVG (acCode contient déjà "AC")
        let acElement = svg.querySelector("#" + acCode);

        // Debug
        console.log(
          `AC ${ac.code} (#${acCode}):`,
          acElement ? "Trouvé ✓" : "NON TROUVÉ ✗",
        );

        if (acElement) {
          acElement.style.cursor = "pointer";
          acElement.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log(`Clic détecté sur ${ac.code}`);

            // Stocke les références pour les boutons
            V.currentAC = ac;
            V.currentCompetenceId = competenceId;
            V.currentNiveauIndex = niveauIndex;

            // Affiche le libellé dans le panneau
            let panel = V.rootPage.querySelector("#info-panel");
            let codeEl = V.rootPage.querySelector("#info-code");
            let libelleEl = V.rootPage.querySelector("#info-libelle");
            let levelEl = V.rootPage.querySelector("#info-level");

            if (panel && codeEl && libelleEl && levelEl) {
              codeEl.textContent = ac.code;
              libelleEl.textContent = ac.libelle;
              levelEl.textContent = ac.level !== undefined ? ac.level : 0;

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
      if (
        !V.currentAC ||
        !V.currentCompetenceId ||
        V.currentNiveauIndex === null
      ) {
        console.error("Aucune AC sélectionnée");
        return;
      }

      // Initialise level à 0 s'il n'existe pas
      if (V.currentAC.level === undefined) {
        V.currentAC.level = 0;
      }

      // Incrémente le niveau (max 5)
      if (V.currentAC.level < 5) {
        V.currentAC.level++;
        console.log(
          `Niveau ajouté ! ${V.currentAC.code} est maintenant au niveau ${V.currentAC.level}`,
        );
        console.log("AC mise à jour:", V.currentAC);

        // Met à jour l'affichage du level
        let levelEl = V.rootPage.querySelector("#info-level");
        if (levelEl) {
          levelEl.textContent = V.currentAC.level;
        }

        // Sauvegarde dans localStorage
        M.saveData();
      } else {
        console.log("Le niveau maximal (5) est atteint");
      }
    });
  }

  // Bouton pour retirer un niveau
  let removeNiveauBtn = V.rootPage.querySelector("#remove-niveau");
  if (removeNiveauBtn) {
    removeNiveauBtn.addEventListener("click", () => {
      if (
        !V.currentAC ||
        !V.currentCompetenceId ||
        V.currentNiveauIndex === null
      ) {
        console.error("Aucune AC sélectionnée");
        return;
      }

      // Initialise level à 0 s'il n'existe pas
      if (V.currentAC.level === undefined) {
        V.currentAC.level = 0;
      }

      // Décrémente le niveau (ne descend pas en dessous de 0)
      if (V.currentAC.level > 0) {
        V.currentAC.level--;
        console.log(
          `Niveau retiré ! ${V.currentAC.code} est maintenant au niveau ${V.currentAC.level}`,
        );
        console.log("AC mise à jour:", V.currentAC);

        // Met à jour l'affichage du level
        let levelEl = V.rootPage.querySelector("#info-level");
        if (levelEl) {
          levelEl.textContent = V.currentAC.level;
        }

        // Sauvegarde dans localStorage
        M.saveData();
      } else {
        console.log("Le niveau est déjà à 0");
      }
    });
  }
};

export function SVGtest() {
  // Format pour cibler une AC dans le json/M.data
  console.log(M.data["688548e4666873aa7a49491ba88a7271"].niveaux[0].acs[0]);
  return C.init();
}
