import template from "./template.html?raw";
import { htmlToDOM } from "@/lib/utils.js";
import { HeaderView } from "@/ui/header/index.js";
import { FooterView } from "@/ui/footer/index.js";
import { StarfieldView } from "@/ui/starfield/index.js";



/**
 * Construit et retourne le layout principal de l'application.
 *
 * @function
 * @returns {DocumentFragment} Le fragment DOM représentant le layout complet.
 *
 * @description
 * - Crée un fragment DOM à partir du template HTML.
 * - Génère le DOM de l'en-tête via HeaderView.dom().
 * - Génère le DOM du pied de page via FooterView.dom().
 * - Génère le fond étoilé via StarfieldView.dom().
 * - Remplace le slot nommé "header" par le DOM de l'en-tête.
 * - Remplace le slot nommé "footer" par le DOM du pied de page.
 * - Remplace le slot nommé "starfield" par le DOM du ciel étoilé.
 * - Retourne le fragment DOM finalisé.
 */
export function RootLayout() {
    let layout = htmlToDOM(template);
    let header = HeaderView.dom();
    let footer = FooterView.dom();
    let starfield = StarfieldView.dom();
    
    layout.querySelector('slot[name="header"]').replaceWith(header);
    layout.querySelector('slot[name="footer"]').replaceWith(footer);
    layout.querySelector('slot[name="starfield"]').replaceWith(starfield);
    
    // Initialiser l'animation du header après le premier render
    setTimeout(() => {
        HeaderView.init();
        attachDropdownEvents();
        StarfieldView.init(); // Initialise le ciel étoilé
    }, 0);
    
    return layout;
}

/**
 * Gère les événements du dropdown dans le header
 */
function attachDropdownEvents() {
    const dropdownBtn = document.querySelector('#demo-dropdown-btn');
    const dropdownMenu = document.querySelector('#demo-dropdown-menu');
    
    if (!dropdownBtn || !dropdownMenu) return;
    
    // Toggle du menu au clic sur le bouton
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    // Ferme le menu si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    // Ferme le menu après avoir cliqué sur un item
    const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    });
}