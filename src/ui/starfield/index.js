import { htmlToDOM } from "../../lib/utils.js";
import { Animation } from "../../lib/animation.js";
import template from "./template.html?raw";

/**
 * StarfieldView - Composant UI pour le fond de ciel étoilé animé
 * Génère et anime des étoiles avec GSAP
 */
let StarfieldView = {
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
   * Génère et anime les étoiles dans le conteneur
   * @param {number} count - Nombre d'étoiles à générer (par défaut 150)
   */
  generateStars: function (count = 150) {
    const container = document.querySelector("#starfield");
    if (!container) return;

    // Génère les étoiles
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "star";
      
      // Taille aléatoire (small, medium, large)
      const sizeRandom = Math.random();
      if (sizeRandom < 0.7) {
        star.classList.add("star-small");
      } else if (sizeRandom < 0.9) {
        star.classList.add("star-medium");
      } else {
        star.classList.add("star-large");
      }

      // Position aléatoire
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;

      container.appendChild(star);

      // Animation de scintillement avec GSAP
      const delay = Math.random() * 3;
      const duration = 2 + Math.random() * 3;
      
      Animation.twinkleStar(star, delay, duration);

      // Animation de déplacement léger pour certaines étoiles
      if (Math.random() > 0.7) {
        const driftDelay = Math.random() * 5;
        const driftDuration = 10 + Math.random() * 10;
        Animation.driftStar(star, driftDelay, driftDuration);
      }
    }
  },

  /**
   * Initialise le ciel étoilé
   * À appeler après l'insertion du DOM
   */
  init: function () {
    StarfieldView.generateStars(150);
  }
};

export { StarfieldView };
