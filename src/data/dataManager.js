// Gestionnaire des données utilisateur (export/import)

const DataManager = {
  /**
   * Exporte les données utilisateur vers un fichier JSON
   * @returns {boolean} true si succès, false sinon
   */
  exportUserData: function () {
    // Récupère les données utilisateur depuis localStorage
    const userData = localStorage.getItem("SAE_userData");
    
    if (!userData || userData === "{}") {
      alert("Aucune donnée à exporter. Commencez par valider des compétences !");
      return false;
    }

    // Crée un objet avec les données et la date d'export
    const exportData = {
      exportDate: new Date().toISOString(),
      userData: JSON.parse(userData)
    };

    // Crée un Blob avec les données JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });

    // Crée un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Nom du fichier avec la date
    const dateStr = new Date().toISOString().split("T")[0];
    link.download = `competences_${dateStr}.json`;
    
    // Déclenche le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libère l'URL
    URL.revokeObjectURL(url);
    
    console.log("✅ Données exportées avec succès");
    return true;
  },

  /**
   * Importe les données utilisateur depuis un fichier JSON
   * @param {File} file - Fichier JSON à importer
   * @returns {Promise<boolean>} true si succès, false sinon
   */
  importUserData: function (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          // Validation de la structure
          if (!importData.userData) {
            throw new Error("Format de fichier invalide");
          }

          // Sauvegarde les données dans localStorage
          localStorage.setItem("SAE_userData", JSON.stringify(importData.userData));
          
          console.log("✅ Données importées avec succès");
          alert("Données importées ! Rechargez la page pour voir les changements.");
          resolve(true);
        } catch (error) {
          console.error("❌ Erreur lors de l'import:", error);
          alert("Erreur : Le fichier n'est pas valide.");
          reject(false);
        }
      };
      
      reader.onerror = () => {
        console.error("❌ Erreur de lecture du fichier");
        alert("Erreur lors de la lecture du fichier.");
        reject(false);
      };
      
      reader.readAsText(file);
    });
  },

  /**
   * Réinitialise toutes les données utilisateur
   * @returns {boolean} true si confirmé et supprimé, false sinon
   */
  resetUserData: function () {
    const confirm = window.confirm(
      "⚠️ Êtes-vous sûr de vouloir supprimer toutes vos données ?\nCette action est irréversible."
    );
    
    if (confirm) {
      localStorage.removeItem("SAE_userData");
      console.log("✅ Données supprimées");
      alert("Données supprimées ! Rechargez la page.");
      return true;
    }
    
    return false;
  },

  /**
   * Charge les données utilisateur depuis localStorage
   * @param {Object} acIndex - Index des ACs pour appliquer les données
   * @returns {Object} userData chargé
   */
  loadUserData: function (acIndex) {
    const savedUserData = localStorage.getItem("SAE_userData");
    let userData = {};
    
    if (savedUserData) {
      console.log("Chargement des données utilisateur depuis localStorage");
      userData = JSON.parse(savedUserData);

      // Applique les niveaux et dates sauvegardés
      for (let acCode in userData) {
        const ac = acIndex[acCode];
        if (ac) {
          const acUserData = userData[acCode];
          ac.level = acUserData.level;
          ac.dates = acUserData.dates;
        }
      }
    }
    
    return userData;
  },

  /**
   * Sauvegarde les données utilisateur dans localStorage
   * @param {Object} acIndex - Index des ACs à sauvegarder
   * @returns {Object} userData sauvegardé
   */
  saveUserData: function (acIndex) {
    const userData = {};

    // Parcourt l'index
    for (let acCode in acIndex) {
      const ac = acIndex[acCode];
      // Ne sauvegarde que si l'AC a un niveau ou des dates
      if ((ac.level !== undefined && ac.level > 0) || 
          (ac.dates !== undefined && Object.keys(ac.dates).length > 0)) {
        userData[acCode] = {
          level: ac.level || 0,
          dates: ac.dates || {}
        };
      }
    }

    localStorage.setItem("SAE_userData", JSON.stringify(userData));
    console.log("Données utilisateur sauvegardées:", userData);
    return userData;
  },

  /**
   * Recherche une AC par son code
   * @param {string} acCode - Code de l'AC (ex: "AC11.01")
   * @param {Object} acIndex - Index des ACs
   * @returns {Object|null} Objet contenant ac, competenceId, niveauIndex
   */
  findACByCode: function (acCode, acIndex) {
    const ac = acIndex[acCode];
    if (ac) {
      return {
        ac,
        competenceId: ac.competenceId,
        niveauIndex: ac.niveauIndex,
      };
    }
    return null;
  },

  /**
   * Ajoute un niveau à une AC
   * @param {Object} ac - Objet AC
   * @param {Object} acIndex - Index des ACs
   * @returns {boolean} true si succès, false si niveau max atteint
   */
  addLevel: function (ac, acIndex) {
    if (ac.level === undefined) {
      ac.level = 0;
    }
    if (ac.level < 5) {
      ac.level++;

      // Enregistre la date d'atteinte du niveau
      if (!ac.dates) {
        ac.dates = {};
      }
      const now = new Date();
      ac.dates[ac.level] = now.toISOString();

      DataManager.saveUserData(acIndex);
      return true;
    }
    return false;
  },

  /**
   * Retire un niveau à une AC
   * @param {Object} ac - Objet AC
   * @param {Object} acIndex - Index des ACs
   * @returns {boolean} true si succès, false si niveau déjà à 0
   */
  removeLevel: function (ac, acIndex) {
    if (ac.level === undefined) {
      ac.level = 0;
    }
    if (ac.level > 0) {
      const previousLevel = ac.level;
      ac.level--;

      // Supprime la date du niveau retiré
      if (ac.dates && ac.dates[previousLevel]) {
        delete ac.dates[previousLevel];
      }

      DataManager.saveUserData(acIndex);
      return true;
    }
    return false;
  }
};

export { DataManager };
