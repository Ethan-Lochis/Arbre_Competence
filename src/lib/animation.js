import { gsap } from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
gsap.registerPlugin(DrawSVGPlugin);

let Animation = {};

Animation.rotateElement = function (element, duration = 1, angle = 360) {
  gsap.to(element, {
    rotation: "+=" + angle,
    transformOrigin: "100% 0%",
    repeat: 0,
    ease: "expo.inOut",
    duration: duration,
  });
};
Animation.counterRotateElement = function (
  element,
  duration = 1,
  angle = -360,
) {
  gsap.to(element, {
    rotation: "+=" + angle,
    transformOrigin: "50% 50%",
    repeat: 0,
    ease: "expo.inOut",
    duration: duration,
  });
};

Animation.colorTransition = function (element, newColor, duration = 0.4) {
  if (!element) {
    console.warn("Animation.transitionACColor: élément null");
    return;
  }

  // 1. Lisez la couleur actuelle de l'élément AVANT l'animation
  const currentColor = window.getComputedStyle(element).fill;

  gsap.fromTo(element, 
    // FROM (état de départ)
    { fill: currentColor },
    // TO (état d'arrivée)
    { 
      fill: newColor,
      duration: duration,
      ease: "power2.out",
    }
  );
};

/**
 * Anime la couleur de fond d'un élément SVG (transition unique)
 * @param {Element} element - L'élément SVG à animer
 * @param {string} newColor - La nouvelle couleur (CSS variable ou valeur)
 * @param {number} duration - Durée de la transition en secondes
 */
Animation.transitionACColor = function (element, newColor, duration = 0.4) {
  if (!element) {
    console.warn("Animation.transitionACColor: élément null");
    return;
  }

  // 1. Lisez la couleur actuelle de l'élément AVANT l'animation
  const currentColor = window.getComputedStyle(element).fill;

  gsap.fromTo(
    element,
    // FROM (état de départ)
    { fill: currentColor },
    // TO (état d'arrivée)
    {
      fill: newColor,
      duration: duration,
      ease: "power2.out",
    },
  );
};

/**
 * Anime la couleur de stroke des éléments SVG (transition unique)
 * @param {NodeList|Array} elements - Les éléments SVG à animer
 * @param {string} newColor - La nouvelle couleur du stroke
 * @param {number} duration - Durée de la transition en secondes
 */
Animation.transitionStrokeColor = function (
  elements,
  newColor,
  duration = 0.4,
) {
  if (!elements || elements.length === 0) {
    return;
  }

  gsap.to(elements, {
    stroke: newColor,
    duration: duration,
    ease: "power2.out",
  });
};

Animation.stretchElement = function (
  element,
  direction = "x",
  scale = 2,
  duration = 1,
) {
  const props = direction === "x" ? { scaleX: scale } : { scaleY: scale };
  gsap.to(element, {
    ...props,
    duration: duration,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
    transformOrigin: "50% 50%",
  });
};

Animation.drawLine = function (paths, fills, duration = 1) {
  gsap
    .timeline()
    .from(paths, {
      drawSVG: 0,
      duration: duration,
      ease: "power1.inOut",
      stagger: 0.1,
    })
    .from(
      fills,
      {
        opacity: 0,
        scale: 1.5,
        transformOrigin: "center center",
        duration: 0.8,
        ease: "elastic.out(2, 0.3)",
      },
      "-=1",
    );
};

Animation.bounce = function (element, duration = 1, height = 100) {
  gsap.to(element, {
    y: -height,
    duration: duration / 2,
    ease: "power1.out",
    yoyo: true,
    repeat: 1,
    transformOrigin: "50% 100%",
  });
};

/**
 * Anime l'ouverture des branches d'un arbre de compétences
 * @param {Function} getAC - Fonction pour récupérer un élément AC par son code
 * @param {Function} getACContent - Fonction pour récupérer le contenu d'un élément AC par son code
 */
Animation.openBranches = function (getAC, getACContent) {
  const branches = [
    { code: "150", angle: 82, step: 12 },
    { code: "140", angle: 159, step: 13 },
    { code: "130", angle: 230, step: 12 },
    { code: "120", angle: 278, step: 12 },
    { code: "110", angle: 351, step: 12 },
  ];

  for (let i = 1; i < 8; i++) {
    branches.forEach(({ code, angle, step }) => {
      const ac = getAC(code + i);
      const content = getACContent(code + i);

      if (ac) Animation.rotateElement(ac, 4, angle - i * step);
      if (content) {
        const contentStep = code === "140" ? step + 0.5 : step;
        Animation.counterRotateElement(content, 4, -angle + i * contentStep);
      }
    });
  }
};

/**
 * Cache le header lors du scroll vers le bas et le fait réapparaître lors du scroll vers le haut
 * @param {HTMLElement} headerElement - L'élément header à animer
 * @param {number} threshold - Distance minimale de scroll avant activation (en pixels)
 */
Animation.hideHeaderOnScroll = function (headerElement, threshold = 5) {
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;

    // Ne rien faire si on est tout en haut
    if (currentScrollY < 10) {
      gsap.to(headerElement, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    // Scroll vers le bas - cacher le header
    if (currentScrollY > lastScrollY && currentScrollY > threshold) {
      gsap.to(headerElement, {
        y: -100,
        duration: 0.3,
        ease: "power2.in",
      });
    }
    // Scroll vers le haut - montrer le header
    else if (currentScrollY < lastScrollY) {
      gsap.to(headerElement, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  // Retourner une fonction de nettoyage
  return () => {
    window.removeEventListener("scroll", onScroll);
  };
};

/**
 * Anime l'apparition du panneau d'informations
 * @param {HTMLElement} panelElement - L'élément panneau à afficher
 * @param {number} x - Position X pour le panneau
 * @param {number} y - Position Y pour le panneau
 */
Animation.showInfoPanel = function (panelElement, x = null, y = null) {
  // Positionne le panneau si les coordonnées sont fournies
  if (x !== null && y !== null) {
    const panelWidth = 400;
    const panelHeight = 250;
    const margin = 20;

    let left = x + margin;
    let top = y + margin;

    if (left + panelWidth > window.innerWidth) {
      left = x - panelWidth - margin;
    }

    if (top + panelHeight > window.innerHeight) {
      top = y - panelHeight - margin;
    }

    left = Math.max(margin, left);
    top = Math.max(margin, top);

    panelElement.style.left = left + "px";
    panelElement.style.top = top + "px";
    panelElement.style.right = "auto";
  }

  // Ajoute la classe visible pour display: block
  panelElement.classList.add("visible");

  // Anime l'apparition
  gsap.to(panelElement, {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    ease: "back.out(1.7)",
  });
};

/**
 * Anime la disparition du panneau d'informations
 * @param {HTMLElement} panelElement - L'élément panneau à masquer
 */
Animation.hideInfoPanel = function (panelElement) {
  gsap.to(panelElement, {
    opacity: 0,
    scale: 0.9,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
      panelElement.classList.remove("visible");
    },
  });
};

/**
 * Applique un zoom au SVG avec une animation fluide
 * @param {SVGElement} svgElement - L'élément SVG à zoomer
 * @param {number} scale - Le facteur de zoom (0.5 à 3)
 */
Animation.zoomSVG = function (svgElement, scale = 1) {
  gsap.to(svgElement, {
    scale: scale,
    transformOrigin: "center center",
    duration: 0.3,
    ease: "power2.out",
  });
};

/**
 * Anime le scintillement d'une étoile
 * @param {HTMLElement} starElement - L'élément étoile à animer
 * @param {number} delay - Délai avant le début de l'animation
 * @param {number} duration - Durée d'une boucle d'animation
 */
Animation.twinkleStar = function (starElement, delay = 0, duration = 3) {
  gsap.to(starElement, {
    opacity: 0.2 + Math.random() * 0.3,
    duration: duration,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    delay: delay
  });
};

/**
 * Anime le mouvement léger d'une étoile
 * @param {HTMLElement} starElement - L'élément étoile à animer
 * @param {number} delay - Délai avant le début de l'animation
 * @param {number} duration - Durée d'une boucle d'animation
 */
Animation.driftStar = function (starElement, delay = 0, duration = 15) {
  const xOffset = -10 + Math.random() * 20;
  const yOffset = -10 + Math.random() * 20;
  
  gsap.to(starElement, {
    x: xOffset,
    y: yOffset,
    duration: duration,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: delay
  });
};

export { Animation };
