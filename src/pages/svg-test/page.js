import { treeView } from "@/ui/Test";
import { InfosView } from "@/ui/Infos/index.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import { Animation } from "@/lib/animation.js";

// ============================================================================
// MODÈLE (M) - Gestion des données
// ============================================================================
let M = {
  data: null,
  levels: {}, // Stockage des niveaux uniquement { "AC11.01": 3, "AC12.05": 2, ... }
  currentAC: null,
  currentCompetenceId: null,
  currentNiveauIndex: null,
};

// Initialisation des données
M.init = async function () {
  // Charge toujours les données complètes depuis le JSON
  console.log("Chargement des données depuis SAE.json");
  let response = await fetch("/src/data/SAE.json");
  M.data = await response.json();

  // Charge les niveaux depuis localStorage
  const savedLevels = localStorage.getItem("SAE_levels");
  if (savedLevels) {
    console.log("Chargement des niveaux depuis localStorage");
    M.levels = JSON.parse(savedLevels);
    
    // Applique les niveaux sauvegardés aux ACs
    for (let competenceId in M.data) {
      let competence = M.data[competenceId];
      competence.niveaux?.forEach((niveau) => {
        niveau.acs?.forEach((ac) => {
          if (M.levels[ac.code] !== undefined) {
            ac.level = M.levels[ac.code];
          }
        });
      });
    }
  }
};

// Sauvegarde uniquement les niveaux
M.saveData = function () {
  // Extrait uniquement les niveaux depuis M.data
  M.levels = {};
  for (let competenceId in M.data) {
    let competence = M.data[competenceId];
    competence.niveaux?.forEach((niveau) => {
      niveau.acs?.forEach((ac) => {
        if (ac.level !== undefined && ac.level > 0) {
          M.levels[ac.code] = ac.level;
        }
      });
    });
  }
  
  localStorage.setItem("SAE_levels", JSON.stringify(M.levels));
  console.log("Niveaux sauvegardés dans localStorage:", M.levels);
};

// Recherche d'une AC par son code
M.findACByCode = function (acCode) {
  for (let competenceId in M.data) {
    let competence = M.data[competenceId];
    for (
      let niveauIndex = 0;
      niveauIndex < (competence.niveaux?.length || 0);
      niveauIndex++
    ) {
      let niveau = competence.niveaux[niveauIndex];
      for (let ac of niveau.acs || []) {
        if (ac.code === acCode) {
          return {
            ac,
            competenceId,
            niveauIndex,
          };
        }
      }
    }
  }
  return null;
};

// Ajoute un niveau à une AC
M.addLevel = function (ac) {
  if (ac.level === undefined) {
    ac.level = 0;
  }
  if (ac.level < 5) {
    ac.level++;
    M.saveData();
    return true;
  }
  return false;
};

// Retire un niveau à une AC
M.removeLevel = function (ac) {
  if (ac.level === undefined) {
    ac.level = 0;
  }
  if (ac.level > 0) {
    ac.level--;
    M.saveData();
    return true;
  }
  return false;
};

// Convertit AC1101 en AC11.01
M.convertSVGIdToACCode = function (svgId) {
  return svgId.replace(/^(AC\d{2})(\d{2})$/, "$1.$2");
};

// Convertit AC11.01 en AC1101
M.convertACCodeToSVGId = function (acCode) {
  return acCode.replace(".", "");
};

// ============================================================================
// CONTRÔLEUR (C) - Logique métier et handlers
// ============================================================================
let C = {};

C.init = async function () {
  await M.init();
  return V.init();
};

C.handleACClick = function (acId, clientX, clientY) {
  const acCode = M.convertSVGIdToACCode(acId);
  console.log(`Clic détecté sur ${acId} → ${acCode}`);

  const result = M.findACByCode(acCode);
  if (!result) {
    console.warn(`AC ${acCode} non trouvée dans les données`);
    return;
  }

  // Stocke les références dans le modèle
  M.currentAC = result.ac;
  M.currentCompetenceId = result.competenceId;
  M.currentNiveauIndex = result.niveauIndex;

  // Met à jour la vue
  V.showACInfo(result.ac, clientX, clientY);
};

C.handleClosePanel = function () {
  V.hideACInfo();
};

C.handleAddLevel = function () {
  if (!M.currentAC) {
    console.error("Aucune AC sélectionnée");
    return;
  }

  const success = M.addLevel(M.currentAC);
  if (success) {
    console.log(
      `Niveau ajouté ! ${M.currentAC.code} est maintenant au niveau ${M.currentAC.level}`,
    );
    V.updateLevel(M.currentAC.level);
  } else {
    console.log("Le niveau maximal (5) est atteint");
  }
};

C.handleRemoveLevel = function () {
  if (!M.currentAC) {
    console.error("Aucune AC sélectionnée");
    return;
  }

  const success = M.removeLevel(M.currentAC);
  if (success) {
    console.log(
      `Niveau retiré ! ${M.currentAC.code} est maintenant au niveau ${M.currentAC.level}`,
    );
    V.updateLevel(M.currentAC.level);
  } else {
    console.log("Le niveau est déjà à 0");
  }
};

// ============================================================================
// VUE (V) - Gestion de l'affichage et des événements DOM
// ============================================================================
let V = {
  rootPage: null,
  tree: null,
  infoPanel: null,
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.tree = new treeView();
  V.infoPanel = new InfosView();

  // Insère le SVG dans la page
  let svgSlot = V.rootPage.querySelector('slot[name="svg"]');
  svgSlot.replaceWith(V.tree.dom());

  let infoPanel = V.rootPage.querySelector('slot[name="info"]');
  infoPanel.replaceWith(V.infoPanel.dom());

  // Lance l'animation d'ouverture
  V.tree.openingAnimation();

  // Attache les événements
  V.attachEvents();

  return V.rootPage;
};

V.attachEvents = function () {
  console.log("Attachement des événements...");

  const svg = V.rootPage.querySelector("svg");
  if (!svg) {
    console.error("SVG non trouvé dans V.rootPage!");
    return;
  }

  // Event delegation sur le SVG
  svg.addEventListener("click", (ev) => {
    const acId = V.findACIdFromTarget(ev.target, svg);
    if (acId) {
      C.handleACClick(acId, ev.clientX, ev.clientY);
    } else {
      console.log("Clic en dehors d'une AC");
    }
  });

  // Bouton fermer
  const closeBtn = V.rootPage.querySelector("#close-info");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => C.handleClosePanel());
  }

  // Bouton ajouter niveau
  const addNiveauBtn = V.rootPage.querySelector("#add-niveau");
  if (addNiveauBtn) {
    addNiveauBtn.addEventListener("click", () => C.handleAddLevel());
  }

  // Bouton retirer niveau
  const removeNiveauBtn = V.rootPage.querySelector("#remove-niveau");
  if (removeNiveauBtn) {
    removeNiveauBtn.addEventListener("click", () => C.handleRemoveLevel());
  }
};

V.findACIdFromTarget = function (target, svg) {
  while (target && target !== svg) {
    if (target.id && target.id.startsWith("AC")) {
      // Extrait uniquement la partie AC + 4 chiffres (ex: AC1106 depuis AC1106__Content)
      const match = target.id.match(/^(AC\d{4})/);
      if (match) {
        return match[1];
      }
    }
    target = target.parentElement;
  }
  return null;
};

V.showACInfo = function (ac, clientX, clientY) {
  const panel = V.rootPage.querySelector("#info-panel");
  const panelH3 = V.rootPage.querySelector("#info-code");
  const descriptionPanel = V.rootPage.querySelector("#info-libelle");
  const levelAC = V.rootPage.querySelector("#info-level");

  if (panel && panelH3 && descriptionPanel && levelAC) {
    panelH3.textContent = ac.code;
    descriptionPanel.textContent = ac.libelle;
    levelAC.textContent = ac.level !== undefined ? ac.level : 0;

    Animation.showInfoPanel(panel, clientX, clientY);
  }
};

V.hideACInfo = function () {
  const panel = V.rootPage.querySelector("#info-panel");
  Animation.hideInfoPanel(panel);
};

V.updateLevel = function (level) {
  const levelAC = V.rootPage.querySelector("#info-level");
  if (levelAC) {
    levelAC.textContent = level;
  }
};

export function SVGtest() {
  return C.init();
}
