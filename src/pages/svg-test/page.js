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

// Sauvegarde uniquement les niveaux et dates
M.saveData = function () {
  // Extrait uniquement les niveaux depuis M.data
  M.levels = {};
  M.dates = {};
  
  for (let competenceId in M.data) {
    let competence = M.data[competenceId];
    competence.niveaux?.forEach((niveau) => {
      niveau.acs?.forEach((ac) => {
        if (ac.level !== undefined && ac.level > 0) {
          M.levels[ac.code] = ac.level;
        }
        if (ac.dates !== undefined && Object.keys(ac.dates).length > 0) {
          M.dates[ac.code] = ac.dates;
        }
      });
    });
  }
  
  localStorage.setItem("SAE_levels", JSON.stringify(M.levels));
  localStorage.setItem("SAE_dates", JSON.stringify(M.dates));
  console.log("Niveaux sauvegardés dans localStorage:", M.levels);
  console.log("Dates sauvegardées dans localStorage:", M.dates);
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
    
    // Enregistre la date d'atteinte du niveau
    if (!ac.dates) {
      ac.dates = {};
    }
    const now = new Date();
    ac.dates[ac.level] = now.toISOString();
    
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
    const previousLevel = ac.level;
    ac.level--;
    
    // Supprime la date du niveau retiré
    if (ac.dates && ac.dates[previousLevel]) {
      delete ac.dates[previousLevel];
    }
    
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

// Obtient le nom CSS de la compétence depuis le code AC (ex: AC11.01 -> comprendre)
M.getCompetenceColorName = function (acCode) {
  const competenceNum = acCode.charAt(2); // AC11.01 -> "1"
  const competenceMap = {
    "1": "comprendre",
    "2": "concevoir",
    "3": "exprimer",
    "4": "developper",
    "5": "entreprendre"
  };
  return competenceMap[competenceNum] || "comprendre";
};

// Obtient la variable CSS de couleur pour une AC et son niveau
M.getACColor = function (acCode, level) {
  // Extrait les 2 premiers chiffres après AC : AC11.01 -> "11", AC15.07 -> "15"
  const competenceCode = acCode.substring(2, 4); // "11", "12", "13", "14", "15"
  const safeLevel = Math.max(0, Math.min(5, level || 0)); // Clamp entre 0 et 5
  return `var(--color-${competenceCode}-${safeLevel})`;
};

// Obtient la couleur du stroke des vectors pour les AC13
M.getVectorStrokeColor = function (acCode, level) {
  // Les AC13 ont un stroke blanc aux niveaux 0 et 1, noir au-dessus
  if (acCode.startsWith("AC13")) {
    return (level === 0 || level === 1) ? "white" : "black";
  }
  return null; // Pas de changement pour les autres compétences
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

  // Applique les couleurs en fonction des niveaux
  V.applyAllACColors();

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
  const datesContainer = V.rootPage.querySelector("#info-dates");

  if (panel && panelH3 && descriptionPanel && levelAC) {
    panelH3.textContent = ac.code;
    descriptionPanel.textContent = ac.libelle;
    levelAC.textContent = ac.level !== undefined ? ac.level : 0;

    // Affiche les dates si elles existent
    if (datesContainer) {
      datesContainer.innerHTML = "";
      if (ac.dates && Object.keys(ac.dates).length > 0) {
        const datesTitle = document.createElement("div");
        datesTitle.innerHTML = "<strong>Historique :</strong>";
        datesTitle.style.marginTop = "10px";
        datesContainer.appendChild(datesTitle);

        for (let level in ac.dates) {
          const dateString = ac.dates[level];
          const date = new Date(dateString);
          const formattedDate = date.toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          
          const dateItem = document.createElement("div");
          dateItem.className = "date-item";
          dateItem.innerHTML = `Niveau ${level} atteint le ${formattedDate}`;
          datesContainer.appendChild(dateItem);
        }
      }
    }

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
  
  // Met à jour l'affichage des dates
  const datesContainer = V.rootPage.querySelector("#info-dates");
  if (datesContainer && M.currentAC) {
    datesContainer.innerHTML = "";
    if (M.currentAC.dates && Object.keys(M.currentAC.dates).length > 0) {
      const datesTitle = document.createElement("div");
      datesTitle.innerHTML = "<strong>Historique :</strong>";
      datesTitle.style.marginTop = "10px";
      datesContainer.appendChild(datesTitle);

      for (let lvl in M.currentAC.dates) {
        const dateString = M.currentAC.dates[lvl];
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        
        const dateItem = document.createElement("div");
        dateItem.className = "date-item";
        dateItem.innerHTML = `Niveau ${lvl} atteint le ${formattedDate}`;
        datesContainer.appendChild(dateItem);
      }
    }
  }
  
  // Met à jour la couleur du Circle_bg
  if (M.currentAC) {
    V.updateACColor(M.currentAC.code, level);
  }
};

// Met à jour la couleur du fond de l'AC dans le SVG
V.updateACColor = function (acCode, level) {
  const svgId = M.convertACCodeToSVGId(acCode);
  const acGroup = V.rootPage.querySelector(`#${svgId}`);
  
  if (acGroup) {
    // Cherche circle_bg dans le groupe AC (avec underscore et minuscule)
    const circleBg = acGroup.querySelector('[id^="circle_bg"]');
    
    if (circleBg) {
      const color = M.getACColor(acCode, level);
      // Utilise GSAP pour une transition fluide
      Animation.transitionACColor(circleBg, color, 0.4);
      console.log(`Couleur mise à jour pour ${acCode} (niveau ${level}): ${color}`);
    } else {
      console.warn(`circle_bg non trouvé pour ${acCode}`);
    }

    // Mise à jour du stroke des vectors pour les AC13
    const vectorStroke = M.getVectorStrokeColor(acCode, level);
    if (vectorStroke) {
      const vectors = acGroup.querySelectorAll('[id^="Vector"]');
      // Utilise GSAP pour une transition fluide du stroke
      Animation.transitionStrokeColor(vectors, vectorStroke, 0.4);
      console.log(`Stroke des vectors mis à jour pour ${acCode}: ${vectorStroke}`);
    }
  } else {
    console.warn(`Groupe AC non trouvé: ${svgId}`);
  }
};

// Applique les couleurs à toutes les ACs au chargement
V.applyAllACColors = function () {
  for (let competenceId in M.data) {
    let competence = M.data[competenceId];
    competence.niveaux?.forEach((niveau) => {
      niveau.acs?.forEach((ac) => {
        const level = ac.level || 0;
        V.updateACColor(ac.code, level);
      });
    });
  }
};

export function SVGtest() {
  return C.init();
}
