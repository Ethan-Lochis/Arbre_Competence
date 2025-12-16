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
  }
};

export { DataManager };
