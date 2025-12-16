import { htmlToDOM, genericRenderer } from "@/lib/utils.js";
import template from "./template.html?raw";

let DateHistoryView = {
  /**
   * Formate une date ISO en format français
   */
  formatDate: function (dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  /**
   * Génère le HTML de l'historique des dates
   * @param {Object} ac - L'objet AC contenant les dates
   * @returns {string} Le HTML généré
   */
  html: function (ac) {
    if (!ac.dates || Object.keys(ac.dates).length === 0) {
      return "";
    }

    let htmlString = '<div class="date-history">';
    htmlString += '<div class="date-history-title" style="margin-top: 10px;"><strong>Historique :</strong></div>';
    
    for (let level in ac.dates) {
      const formattedDate = this.formatDate(ac.dates[level]);
      htmlString += `<div class="date-item">Niveau ${level} atteint le ${formattedDate}</div>`;
    }

    htmlString += '</div>';
    return htmlString;
  },

  /**
   * Génère le DOM de l'historique des dates
   * @param {Object} ac - L'objet AC contenant les dates
   * @returns {DocumentFragment} Le fragment DOM généré
   */
  dom: function (ac) {
    const htmlContent = this.html(ac);
    if (!htmlContent) {
      return document.createDocumentFragment();
    }
    return htmlToDOM(htmlContent);
  },
};

export { DateHistoryView };
