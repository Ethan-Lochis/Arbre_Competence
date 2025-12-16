import data from "./SAE.json";

let pn = [];

// Convertit l'objet en array
for (let cmpId in data) {
  pn.push(data[cmpId]);
}

// Trie par numéro de compétence
pn.sort((a, b) => a.numero - b.numero);

// Crée un index pour accès direct aux AC
pn.acIndex = {};
for (let competence of pn) {
  competence.niveaux?.forEach((niveau, niveauIndex) => {
    niveau.acs?.forEach((ac) => {
      ac.competenceId = competence.id;
      ac.competenceNumero = competence.numero;
      ac.niveauIndex = niveauIndex;
      pn.acIndex[ac.code] = ac;
    });
  });
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

// Récupère l'AC par son code (accès direct via index)
pn.getAC = function (ACcode) {
  return pn.acIndex[ACcode];
};

// Récupère le libellé d'une AC
pn.getACLibelle = function (ACcode) {
  const ac = pn.acIndex[ACcode];
  return ac ? ac.libelle : null;
};

export { pn };
