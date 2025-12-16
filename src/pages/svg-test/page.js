import { treeView } from "@/ui/Test";
import { InfosView } from "@/ui/Infos/index.js";
import { DateHistoryView } from "@/ui/dateHistory/index.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import { Animation } from "@/lib/animation.js";
import gsap from "gsap";

// ============================================================================
// MODÈLE (M) - Gestion des données
// ============================================================================
let M = {
  data: null,
  levels: {}, // Stockage des niveaux uniquement { "AC11.01": 3, "AC12.05": 2, ... }
  currentAC: null,
  currentCompetenceId: null,
  currentNiveauIndex: null,
  // État du drag
  drag: {
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    threshold: 5 // Distance minimale pour considérer un drag
  }
};

// Initialisation des données
M.init = async function () {
  // Charge toujours les données complètes depuis le JSON
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

// Recherche d'une AC par son code pour en extraire les données associées
M.findACByCode = function (acCode) {
  console.log("Recherche de l'AC par code:", acCode);
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

// Convertit AC11.01 en AC1101
M.convertACCodeToSVGId = function (acCode) {
  return acCode.replace(".", "");
};

// Obtient la variable CSS de couleur pour une AC et son niveau
M.getACColor = function (acCode, level) {
  // Extrait les 2 premiers chiffres après AC : AC11.01 -> "11", AC15.07 -> "15"
  const competenceCode = acCode.substring(2, 4); // "11", "12", "13", "14", "15"
  const safeLevel = Math.max(0, Math.min(5, level || 0)); // Clamp entre 0 et 5
  return `var(--color-${competenceCode}-${safeLevel})`;
};

// Changement de couleur des AC13 en fonction du niveau pour plus de visibilité
M.getVectorStrokeColor = function (acCode, level) {
  // Les AC13 ont un stroke blanc aux niveaux 0 et 1, noir au-dessus
  if (acCode.startsWith("AC13")) {
    return level === 0 || level === 1 ? "white" : "black";
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
  const acCode = acId.replace(/^(AC\d{2})(\d{2})$/, "$1.$2");
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
    V.updateLevel(M.currentAC.level);
  } else {
    console.log("Le niveau est déjà à 0");
  }
};

C.handler_dragStart = function (ev) {
  // Ignore si c'est un clic sur un élément interactif
  if (ev.target.closest(".zoom-controls") || ev.target.closest("#info-panel")) {
    return;
  }

  M.drag.isDragging = true;
  M.drag.hasMoved = false;
  M.drag.startX = ev.clientX - M.drag.currentX;
  M.drag.startY = ev.clientY - M.drag.currentY;
};

C.handler_dragMove = function (ev, zoomWrapper, container) {
  if (!M.drag.isDragging) return;

  const newX = ev.clientX - M.drag.startX;
  const newY = ev.clientY - M.drag.startY;
  
  // Vérifie si on a dépassé le threshold
  const distance = Math.sqrt(
    Math.pow(newX - M.drag.currentX, 2) + Math.pow(newY - M.drag.currentY, 2)
  );
  
  if (distance > M.drag.threshold) {
    M.drag.hasMoved = true;
    container.style.cursor = "grabbing";
  }

  if (M.drag.hasMoved) {
    M.drag.currentX = newX;
    M.drag.currentY = newY;

    gsap.set(zoomWrapper, {
      x: M.drag.currentX,
      y: M.drag.currentY,
    });
  }
};

C.handler_dragEnd = function (container) {
  if (M.drag.isDragging) {
    M.drag.isDragging = false;
    container.style.cursor = "grab";
    M.drag.hasMoved = false;
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

  // Crée un wrapper pour le zoom
  const zoomWrapper = document.createElement("div");
  zoomWrapper.id = "svg-zoom-wrapper";
  zoomWrapper.appendChild(V.tree.dom());
  svgSlot.replaceWith(zoomWrapper);

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
  const svg = V.rootPage.querySelector("#arbre");
  if (!svg) {
    console.error("SVG #arbre non trouvé dans V.rootPage!");
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

  console.log("Event listener ajouté sur SVG");

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

  // Slider de zoom
  const zoomSlider = V.rootPage.querySelector("#zoom-slider");
  const zoomValue = V.rootPage.querySelector("#zoom-value");
  const zoomWrapper = V.rootPage.querySelector("#svg-zoom-wrapper");
  if (zoomSlider && zoomValue && zoomWrapper) {
    zoomSlider.addEventListener("input", (ev) => {
      const scale = parseFloat(ev.target.value);
      Animation.zoomSVG(zoomWrapper, scale);
      zoomValue.textContent = Math.round(scale * 100) + "%";
    });
  }

  // Système de drag pour déplacer le SVG quand il est zoomé
  V.attachDragEvents(zoomWrapper);
};

V.attachDragEvents = function (zoomWrapper) {
  const container = V.rootPage.querySelector(".svg-test-container");
  if (!container) return;

  container.addEventListener("mousedown", (ev) => C.handler_dragStart(ev));
  
  container.addEventListener("mousemove", (ev) => 
    C.handler_dragMove(ev, zoomWrapper, container)
  );
  
  container.addEventListener("mouseup", () => C.handler_dragEnd(container));
  
  container.addEventListener("mouseleave", () => C.handler_dragEnd(container));

  // Curseur grab quand on survole
  container.style.cursor = "grab";
};

V.findACIdFromTarget = function (target, svg) {
  let currentElement = target;
  let depth = 0;

  while (currentElement && currentElement !== svg) {
    if (currentElement.id && currentElement.id.startsWith("AC")) {
      // Extrait uniquement la partie AC + 4 chiffres (ex: AC1106 depuis AC1106__Content)
      const match = currentElement.id.match(/^(AC\d{4})/);
      if (match) {
        return match[1];
      }
    }
    currentElement = currentElement.parentElement;
    depth++;
  }

  console.log("  ✗ Aucune AC trouvée");
  return null;
};

// Gestion des infos de l'ac
V.showACInfo = function (ac, clientX, clientY) {
  const panel = V.rootPage.querySelector("#info-panel");
  const panelH3 = V.rootPage.querySelector("#info-code");
  const descriptionPanel = V.rootPage.querySelector("#info-libelle");
  const levelAC = V.rootPage.querySelector("#info-level");
  const datesContainer = V.rootPage.querySelector("#info-dates");

  if (panel && panelH3 && descriptionPanel && levelAC) {
    // Met à jour les informations de l'AC
    panelH3.textContent = ac.code;
    descriptionPanel.textContent = ac.libelle;
    levelAC.textContent = ac.level !== undefined ? ac.level : 0;

    // Affiche l'historique des dates
    if (datesContainer) {
      datesContainer.innerHTML = "";
      datesContainer.appendChild(DateHistoryView.dom(ac));
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

  // Met à jour l'affichage de l'historique
  const datesContainer = V.rootPage.querySelector("#info-dates");
  if (datesContainer && M.currentAC) {
    datesContainer.innerHTML = "";
    datesContainer.appendChild(DateHistoryView.dom(M.currentAC));
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
    } else {
    }

    // Mise à jour du stroke des vectors pour les AC13
    const vectorStroke = M.getVectorStrokeColor(acCode, level);
    if (vectorStroke) {
      const vectors = acGroup.querySelectorAll('[id^="Vector"]');
      // Utilise GSAP pour une transition fluide du stroke
      Animation.transitionStrokeColor(vectors, vectorStroke, 0.4);
    }

    // Mise à jour du chiffre dans le carré info
    const competenceText = acGroup.querySelector('[id^="competence_"]');
    if (competenceText) {
      competenceText.textContent = level;
    }
  } else {
    // console.warn(`Groupe AC non trouvé: ${svgId}`);
  }
};

// Applique les couleurs à toutes les ACs au chargement en fonction du niveau
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
