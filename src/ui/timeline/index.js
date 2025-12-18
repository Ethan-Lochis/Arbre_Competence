import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

/**
 * TimelineView - Composant UI de frise chronologique
 * Composant simple qui retourne uniquement le template HTML
 * Toute la logique métier est dans le Controller de la page
 */
let TimelineView = {
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
  }
};

export { TimelineView };

