import data from "./SAE.json";

let pn = [];

// Convertit l'objet en array
for (let cmpId in data) {
  pn.push(data[cmpId]);
}

// Extrait l'index de compétence depuis le code AC (AC11.01 -> 1)
pn.getSkillIndex = function (ACcode) {
  return parseInt(ACcode.charAt(2)) - 1;
};

// Extrait l'index de niveau depuis le code AC (AC11.01 -> 1)
pn.getLevelIndex = function (ACcode) {
  return parseInt(ACcode.charAt(3)) - 1;
};

// Extrait l'index d'AC depuis le code AC (AC11.01 -> 01)
pn.getACIndex = function (ACcode) {
  return parseInt(ACcode.substring(5)) - 1;
};

// Récupère l'AC par son code (parcourt pn)
pn.getAC = function (ACcode) {
  const skillIndex = pn.getSkillIndex(ACcode);
  const levelIndex = pn.getLevelIndex(ACcode);
  const acIndex = pn.getACIndex(ACcode);
  
  return pn[skillIndex]?.niveaux?.[levelIndex]?.acs?.[acIndex];
};

// Récupère le libellé d'une AC
pn.getACLibelle = function (ACcode) {
  const ac = pn.getAC(ACcode);
  return ac ? ac.libelle : null;
};

export { pn };
