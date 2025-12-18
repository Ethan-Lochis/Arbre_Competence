import { htmlToDOM } from "../../lib/utils.js";
import { HistoryItemView } from "../historyItem/index.js";
import template from "./template.html?raw";

/**
 * HistoryView - Composant UI pour l'historique des modifications
 * Suit le pattern standard : objet avec html() et dom()
 */
let HistoryView = {
  /**
   * Retourne le template HTML sous forme de string
   * @returns {string} Template HTML
   */
  html: function () {
    return template;
  },

  /**
   * Retourne le template HTML sous forme de DocumentFragment
   * @returns {DocumentFragment} Fragment DOM
   */
  dom: function () {
    return htmlToDOM(template);
  },

  /**
   * Génère le contenu de l'historique à partir des données utilisateur
   * @param {Object} acIndex - Index des ACs
   * @param {string} sortMode - Mode de tri : "date" (par date) ou "ac" (par AC)
   * @returns {DocumentFragment} Fragment DOM de l'historique
   */
  generateHistoryContent: function (acIndex, sortMode = "date") {
    const fragment = document.createDocumentFragment();
    
    // Collecte tous les événements avec leurs dates
    const events = [];

    for (let acCode in acIndex) {
      const ac = acIndex[acCode];
      if (ac.dates && Object.keys(ac.dates).length > 0) {
        for (let level in ac.dates) {
          events.push({
            acCode: ac.code,
            libelle: ac.libelle,
            level: parseInt(level),
            date: new Date(ac.dates[level]),
            dateISO: ac.dates[level]
          });
        }
      }
    }

    if (events.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'history-empty';
      emptyDiv.textContent = '📭 Aucune modification enregistrée';
      fragment.appendChild(emptyDiv);
      return fragment;
    }

    // Tri selon le mode sélectionné
    if (sortMode === "ac") {
      // Trie par AC, puis par date décroissante
      events.sort((a, b) => {
        if (a.acCode !== b.acCode) {
          return a.acCode.localeCompare(b.acCode);
        }
        return b.date - a.date;
      });
    } else {
      // Trie par date décroissante (plus récent en premier)
      events.sort((a, b) => b.date - a.date);
    }

    // Labels pour les niveaux
    const labels = {
      0: "Jamais vu",
      1: "Non acquis",
      2: "Fragile",
      3: "En cours d'acquisition",
      4: "Acquis",
      5: "Dépassé"
    };

    // Si tri par AC, regrouper visuellement
    let lastAcCode = null;
    
    // Crée les éléments DOM pour chaque événement
    events.forEach(event => {
      // Ajoute un séparateur visuel pour chaque nouvelle AC (mode tri par AC)
      if (sortMode === "ac" && event.acCode !== lastAcCode) {
        if (lastAcCode !== null) {
          const separator = document.createElement('div');
          separator.className = 'history-ac-separator';
          fragment.appendChild(separator);
        }
        lastAcCode = event.acCode;
      }

      const dateStr = event.date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeStr = event.date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Utilise le composant HistoryItemView pour générer chaque élément
      const itemDOM = HistoryItemView.dom({
        acCode: event.acCode,
        libelle: event.libelle,
        level: event.level,
        dateStr: dateStr,
        timeStr: timeStr,
        levelLabel: labels[event.level]
      });

      fragment.appendChild(itemDOM);
    });

    return fragment;
  }
};

export { HistoryView };
