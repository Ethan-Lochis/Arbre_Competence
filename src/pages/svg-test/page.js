import { treeView } from "@/ui/Test";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";


import { Animation } from "@/lib/animation.js";

let M = {};
let response = await fetch('/src/data/SAE.json');
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
  for (let i = 1; i < 8; i++) {
    // Rotation autour du centre
    Animation.rotateElement(V.tree.getAC("150" + i), 4, 82 - i * 12); 
    Animation.rotateElement(V.tree.getAC("140" + i), 4, 159 - i * 12.5);
    Animation.rotateElement(V.tree.getAC("130" + i), 4, 230 - i * 12);
    Animation.rotateElement(V.tree.getAC("120" + i), 4, 278 - i * 12);
    Animation.rotateElement(V.tree.getAC("110" + i), 4, 351 - i * 12);
    // Rotation des contenus
    Animation.counterRotateElement(V.tree.getACcontent("150" + i), 4, -82 + i * 12);
    Animation.counterRotateElement(V.tree.getACcontent("140" + i), 4, -159 + i * 12.5);
    Animation.counterRotateElement(V.tree.getACcontent("130" + i), 4, -230 + i * 12);
    Animation.counterRotateElement(V.tree.getACcontent("120" + i), 4, -278 + i * 12);
    Animation.counterRotateElement(V.tree.getACcontent("110" + i), 4, -351 + i * 12);
  }
  
  // Insère le SVG dans la page
  const svgSlot = V.rootPage.querySelector('slot[name="svg"]');
  svgSlot.replaceWith(V.tree.dom());
  
  // Attache les événements APRÈS l'insertion
  V.attachEvents();

  return V.rootPage;
};

V.attachEvents = function() {
  console.log('Attachement des événements...');
  
  // Trouve le SVG dans la page
  const svg = V.rootPage.querySelector('svg');
  if (!svg) {
    console.error('SVG non trouvé dans V.rootPage!');
    return;
  }
  
  console.log('SVG trouvé:', svg);
  console.log('Données chargées:', Object.keys(M.data).length, 'compétences');
  
  // Parcourt toutes les compétences dans M.data
  for (let competenceId in M.data) {
    const competence = M.data[competenceId];
    
    // Parcourt tous les niveaux
    competence.niveaux?.forEach(niveau => {
      // Parcourt toutes les ACs
      niveau.acs?.forEach(ac => {
        // Convertit AC11.01 en AC1101 pour matcher le nom du composant SVG
        const acCode = ac.code.replace('.', '');  // "AC11.01" -> "AC1101"
        // Cherche dans le SVG (acCode contient déjà "AC")
        const acElement = svg.querySelector('#' + acCode);
        
        console.log(`AC ${ac.code} (#${acCode}):`, acElement ? 'Trouvé ✓' : 'NON TROUVÉ ✗');
        
        if (acElement) {
          acElement.style.cursor = 'pointer';
          acElement.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Clic détecté sur ${ac.code}`);
            
            // Affiche le libellé dans le panneau
            const panel = V.rootPage.querySelector('#info-panel');
            const codeEl = V.rootPage.querySelector('#info-code');
            const libelleEl = V.rootPage.querySelector('#info-libelle');
            
            if (panel && codeEl && libelleEl) {
              codeEl.textContent = ac.code;
              libelleEl.textContent = ac.libelle;
              panel.style.display = 'block';
            }
          });
        }
      });
    });
  }
  
  // Ferme le panneau au clic sur le bouton
  const closeBtn = V.rootPage.querySelector('#close-info');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      V.rootPage.querySelector('#info-panel').style.display = 'none';
    });
  }
};

export function SVGtest() {
  return C.init();
}
