# Copilot Instructions

## Architecture

- **Structure**: Respecter l'architecture modulaire du projet
- **Animations**: Toutes les animations doivent utiliser GSAP
- **Centralisation**: Regrouper les animations dans `lib/animations.js`
- **Conventions**: Suivre les conventions de nommage du projet
- **Nommage**: Les AC du svg sont au format "AC" + code (ex: AC1101) alors que dans le json c'est AC11.01

## Guidelines

### Animations

- Importer GSAP depuis la dépendance du projet
- Créer des fonctions réutilisables pour chaque type d'animation
- Exporter les fonctions d'animation depuis `lib/animations.js`
- Documenter les paramètres et les options GSAP utilisées

### Imports

### Documentation GSAP

- Utiliser la documentation fournie dans `.vscode/mcp/json` pour les références et les exemples d'animations.
