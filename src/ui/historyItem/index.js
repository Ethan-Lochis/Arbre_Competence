import { genericRenderer, htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

/**
 * HistoryItemView - Composant UI pour un élément d'historique
 * Représente une modification unique (AC + niveau + date)
 */
let HistoryItemView = {
  /**
   * Retourne le HTML d'un élément d'historique
   * @param {Object} data - Données de l'événement
   * @param {string} data.acCode - Code de l'AC (ex: "AC11.01")
   * @param {string} data.libelle - Libellé de l'AC
   * @param {number} data.level - Niveau atteint
   * @param {string} data.dateStr - Date formatée (ex: "18/12/2025")
   * @param {string} data.timeStr - Heure formatée (ex: "09:15")
   * @param {string} data.levelLabel - Label du niveau (ex: "Acquis")
   * @returns {string} HTML de l'élément
   */
  html: function (data) {
    return genericRenderer(template, data);
  },

  /**
   * Retourne le DOM d'un élément d'historique
   * @param {Object} data - Données de l'événement (voir html())
   * @returns {DocumentFragment} Fragment DOM
   */
  dom: function (data) {
    return htmlToDOM(HistoryItemView.html(data));
  }
};

export { HistoryItemView };
