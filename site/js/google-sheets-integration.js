// Fonctionnalité d'intégration avec Google Sheets - Version adaptée pour le chargement exclusif depuis Google Sheets
document.addEventListener('DOMContentLoaded', function() {
    // Référence aux éléments d'interface
    const googleSheetUrlInput = document.getElementById('google-sheet-url');
    const loadGoogleSheetBtn = document.getElementById('load-google-sheet-btn');
    const googleSheetInfo = document.getElementById('google-sheet-info');
    const modalGoogleSheetUrlInput = document.getElementById('modal-google-sheet-url');
    const modalLoadBtn = document.getElementById('modal-load-btn');
    const modalSheetInfo = document.getElementById('modal-sheet-info');
    
    // Ajouter les gestionnaires d'événements pour l'interface principale
    if (googleSheetUrlInput && loadGoogleSheetBtn && googleSheetInfo) {
        // Gestionnaire pour le bouton de chargement
        loadGoogleSheetBtn.addEventListener('click', function() {
            loadGoogleSheetData(googleSheetUrlInput.value, googleSheetInfo);
        });
        
        // Gestionnaire pour la touche Entrée dans le champ de saisie
        googleSheetUrlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadGoogleSheetData(googleSheetUrlInput.value, googleSheetInfo);
            }
        });
        
        // Charger les données du Google Sheet si une URL est déjà stockée
        const storedGoogleSheetUrl = localStorage.getItem('googleSheetUrl');
        if (storedGoogleSheetUrl) {
            googleSheetUrlInput.value = storedGoogleSheetUrl;
        }
    }
    
    // Ajouter les gestionnaires d'événements pour le modal
    if (modalGoogleSheetUrlInput && modalLoadBtn && modalSheetInfo) {
        // Gestionnaire pour le bouton de chargement du modal
        modalLoadBtn.addEventListener('click', function() {
            loadGoogleSheetData(modalGoogleSheetUrlInput.value, modalSheetInfo, true);
        });
        
        // Gestionnaire pour la touche Entrée dans le champ de saisie du modal
        modalGoogleSheetUrlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadGoogleSheetData(modalGoogleSheetUrlInput.value, modalSheetInfo, true);
            }
        });
    }
    
    // Ouvrir le modal au chargement de la page si aucune donnée n'est chargée
    const hasData = localStorage.getItem('questionnaireData');
    if (!hasData) {
        const uploadModal = new bootstrap.Modal(document.getElementById('upload-modal'));
        if (uploadModal) {
            uploadModal.show();
        }
    }
    
    // Gestionnaire pour le bouton "Je le ferai plus tard"
    const uploadLaterBtn = document.getElementById('upload-later-btn');
    if (uploadLaterBtn) {
        uploadLaterBtn.addEventListener('click', function() {
            const uploadModal = bootstrap.Modal.getInstance(document.getElementById('upload-modal'));
            if (uploadModal) {
                uploadModal.hide();
            }
        });
    }
    
    // Fonction pour charger les données depuis Google Sheets
    function loadGoogleSheetData(url, infoElement, isModal = false) {
        url = url.trim();
        
        // Vérifier si l'URL est valide
        if (!url) {
            infoElement.innerHTML = '<div class="alert alert-danger">Veuillez entrer une URL de Google Sheet.</div>';
            return;
        }
        
        // Vérifier si c'est une URL Google Sheets
        if (!url.includes('docs.google.com/spreadsheets')) {
            infoElement.innerHTML = '<div class="alert alert-danger">L\'URL ne semble pas être une URL Google Sheets valide.</div>';
            return;
        }
        
        // Afficher un message de chargement
        infoElement.innerHTML = '<div class="alert alert-info">Chargement des données depuis Google Sheets...</div>';
        
        // Extraire l'ID du document à partir de l'URL
        const sheetId = extractSheetId(url);
        
        if (!sheetId) {
            infoElement.innerHTML = '<div class="alert alert-danger">Impossible d\'extraire l\'ID du document à partir de l\'URL.</div>';
            return;
        }
        
        // Utiliser une URL publique pour les données CSV
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        
        // Charger directement les données CSV
        fetch(csvUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données CSV. Assurez-vous que le Google Sheet est partagé publiquement (au moins en lecture).');
                }
                return response.text();
            })
            .then(csvData => {
                // Convertir les données CSV en JSON
                const jsonData = parseCSV(csvData);
                
                // Traiter les données
                processGoogleSheetData(jsonData, url, infoElement, isModal);
            })
            .catch(error => {
                console.error('Erreur lors du chargement des données:', error);
                infoElement.innerHTML = `<div class="alert alert-danger">Erreur lors du chargement des données: ${error.message}</div>`;
            });
        
        // Enregistrer l'URL dans localStorage
        localStorage.setItem('googleSheetUrl', url);
        
        // Si nous sommes dans le modal, mettre aussi l'URL dans le champ principal
        if (isModal && googleSheetUrlInput) {
            googleSheetUrlInput.value = url;
        }
    }
    
    // Fonction pour extraire l'ID du document à partir de l'URL
    function extractSheetId(url) {
        // Format typique: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
        const regex = /\/d\/([a-zA-Z0-9-_]+)/;
        const match = url.match(regex);
        
        return match ? match[1] : null;
    }
    
    // Fonction pour analyser les données CSV
    function parseCSV(csvText) {
        // Diviser le texte en lignes
        const lines = csvText.split('\n');
        
        // Extraire les en-têtes (première ligne)
        const headers = parseCSVLine(lines[0]);
        
        // Convertir les données en format JSON
        const jsonData = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Ignorer les lignes vides
            
            const values = parseCSVLine(lines[i]);
            
            // Créer un objet pour cette ligne
            const rowData = {};
            
            for (let j = 0; j < headers.length && j < values.length; j++) {
                rowData[headers[j]] = values[j];
            }
            
            jsonData.push(rowData);
        }
        
        return jsonData;
    }
    
    // Fonction pour analyser une ligne CSV en tenant compte des guillemets
    function parseCSVLine(line) {
        const values = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim().replace(/^"|"$/g, ''));
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // Ajouter la dernière valeur
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        
        return values;
    }
    
    // Fonction pour analyser les données du questionnaire et extraire les informations clés
    function analyzeQuestionnaireData(data) {
        try {
            // Vérifier si les données sont valides
            if (!data || !Array.isArray(data) || data.length === 0) {
                return { error: "Les données sont vides ou invalides" };
            }
            
            console.log("Analyse des données en cours...", data);
            
            // Statistiques de base - compter tous les répondants (réellement tous)
            const totalEntries = data.length;
            
            // Compter les étudiants et non-étudiants séparément pour l'analyse détaillée
            const studentCount = data.filter(entry => entry["Es-tu étudiant ?"] === "Oui").length;
            const nonStudentCount = data.filter(entry => entry["Es-tu étudiant ?"] === "Non").length;
            const emptyResponseCount = totalEntries - studentCount - nonStudentCount;
            
            console.log(`Total des entrées: ${totalEntries}, Étudiants: ${studentCount}, Non-étudiants: ${nonStudentCount}, Réponses vides: ${emptyResponseCount}`);
            
            // Intérêt pour la salle de sport (5 niveaux) - uniquement pour les étudiants
            const interestLevels = [0, 0, 0, 0, 0, 0]; // 0 à 5
            let interestedCount = 0;
            
            // Budget moyen
            let totalBudget = 0;
            let budgetCount = 0;
            
            // Compter les activités
            const activitiesCounts = {};
            let mostPopularActivity = "";
            let maxActivityCount = 0;
            
            // Parcourir toutes les données des étudiants pour les statistiques spécifiques
            data.filter(entry => entry["Es-tu étudiant ?"] === "Oui").forEach(entry => {
                // Extraire le niveau d'intérêt (échelle 1-5)
                const interestLevel = parseInt(entry["Sur une échelle de 1 à 5, quel est votre intérêt pour une salle de sport étudiante et participative à prix réduit ?"]);
                if (!isNaN(interestLevel) && interestLevel >= 1 && interestLevel <= 5) {
                    interestLevels[interestLevel]++;
                    if (interestLevel >= 4) {
                        interestedCount++;
                    }
                }
                
                // Extraire le budget préféré
                const budgetRange = entry["Quel prix par mois te paraît raisonnable pour la salle de sport ?"];
                let budget = 0;
                
                if (budgetRange === "<10€") budget = 7.5;
                else if (budgetRange === "10€ à 14,99€") budget = 12.5;
                else if (budgetRange === "15€ à 19,99€") budget = 17.5;
                else if (budgetRange === "20€ à 24,99€") budget = 22.5;
                else if (budgetRange === ">25€") budget = 27.5;
                
                if (budget > 0) {
                    totalBudget += budget;
                    budgetCount++;
                }
                
                // Compter les activités (séparer les activités multiples)
                const activities = entry["Quel(s) sport(s) pratiques-tu ? "];
                if (activities && activities !== "Aucun") {
                    const activityList = activities.split(", ");
                    activityList.forEach(activity => {
                        if (!activitiesCounts[activity]) {
                            activitiesCounts[activity] = 0;
                        }
                        activitiesCounts[activity]++;
                        
                        if (activitiesCounts[activity] > maxActivityCount) {
                            maxActivityCount = activitiesCounts[activity];
                            mostPopularActivity = activity;
                        }
                    });
                }
            });
            
            // Calculer le pourcentage d'étudiants intéressés (niveau 4-5)
            const interestedPercentage = studentCount > 0 ? Math.round((interestedCount / studentCount) * 100) : 0;
            
            // Calculer le budget moyen
            const averageBudget = budgetCount > 0 ? Math.round(totalBudget / budgetCount) : 0;
            
            // Préparer les résultats de l'analyse
            const results = {
                totalEntries,            // Nombre total d'entrées dans le fichier
                totalRespondents: totalEntries, // Pour compatibilité avec le code existant
                studentCount,            // Nombre d'entrées avec "Es-tu étudiant ?" = "Oui"
                nonStudentCount,         // Nombre d'entrées avec "Es-tu étudiant ?" = "Non"
                emptyResponseCount,      // Nombre d'entrées sans réponse à cette question
                interestedPercentage,
                averageBudget,
                mostPopularActivity,
                activitiesCounts,
                interestLevels
            };
            
            console.log("Résultats de l'analyse :", results);
            return results;
            
        } catch (error) {
            console.error("Erreur lors de l'analyse des données :", error);
            return { error: "Erreur lors de l'analyse des données: " + error.message };
        }
    }
    
    // Fonction pour traiter les données de Google Sheets
    function processGoogleSheetData(jsonData, url, infoElement, isModal) {
        if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
            infoElement.innerHTML = '<div class="alert alert-danger">Les données récupérées sont vides ou invalides.</div>';
            return;
        }
        
        try {
            console.log("Données extraites de Google Sheets:", jsonData);
            
            // Enregistrer les données dans localStorage
            saveGoogleSheetDataToLocalStorage(jsonData, url);
            
            // Analyser et mettre à jour les données et les graphiques
            const analyzedData = analyzeQuestionnaireData(jsonData);
            updateAllData(analyzedData);
            
            // Mettre à jour l'interface utilisateur
            updateUIAfterGoogleSheetLoad(infoElement);
            
            // Si nous sommes dans un modal, le fermer
            if (isModal) {
                const uploadModal = bootstrap.Modal.getInstance(document.getElementById('upload-modal'));
                if (uploadModal) {
                    uploadModal.hide();
                }
            }
            
        } catch (error) {
            console.error("Erreur lors du traitement des données Google Sheets:", error);
            infoElement.innerHTML = `<div class="alert alert-danger">Erreur lors du traitement des données: ${error.message}</div>`;
        }
    }
    
    // Fonction pour enregistrer les données de Google Sheets dans localStorage
    function saveGoogleSheetDataToLocalStorage(jsonData, url) {
        try {
            // Enregistrer les données
            localStorage.setItem('questionnaireData', JSON.stringify(jsonData));
            
            // Enregistrer les informations sur le fichier
            const now = new Date();
            const fileInfo = {
                name: "Google Sheets - " + url.split('/').pop(),
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
                timestamp: now.getTime(),
                isGoogleSheet: true,
                url: url
            };
            
            // Récupérer l'historique des fichiers
            let fileHistory = JSON.parse(localStorage.getItem('fileHistory') || '[]');
            
            // Ajouter le nouveau fichier à l'historique
            fileHistory.push(fileInfo);
            
            // Limiter l'historique aux 10 derniers fichiers
            if (fileHistory.length > 10) {
                fileHistory = fileHistory.slice(-10);
            }
            
            // Enregistrer l'historique mis à jour
            localStorage.setItem('fileHistory', JSON.stringify(fileHistory));
            
            // Enregistrer le fichier actuel
            localStorage.setItem('currentFile', JSON.stringify(fileInfo));
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde dans localStorage:', error);
            // Ne pas afficher d'erreur ici, car nous ne savons pas quel élément d'information utiliser
        }
    }
    
    // Fonction pour mettre à jour l'interface utilisateur après le chargement de Google Sheets
    function updateUIAfterGoogleSheetLoad(infoElement) {
        // Récupérer les informations sur le fichier actuel
        const currentFile = JSON.parse(localStorage.getItem('currentFile'));
        
        // Mettre à jour l'interface utilisateur
        infoElement.innerHTML = `<div class="alert alert-success">Données Google Sheets chargées avec succès!</div>`;
        
        // Mettre à jour les informations sur le dernier fichier chargé
        const lastUploadInfo = document.getElementById('last-upload-info');
        if (lastUploadInfo && currentFile) {
            lastUploadInfo.innerHTML = `<div class="card-text"><strong>Dernières données chargées:</strong> Google Sheets<br><strong>Date:</strong> ${currentFile.date} à ${currentFile.time}</div>`;
        }
        
        // Afficher une notification
        showNotification('Données mises à jour', 'Toutes les visualisations ont été mises à jour avec les données de Google Sheets.');
    }
    
    // Fonction pour afficher une notification
    function showNotification(title, message) {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = 'toast show';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
        notification.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">${title}</strong>
                <small>à l'instant</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        // Ajouter la notification au document
        document.body.appendChild(notification);
        
        // Supprimer la notification après 5 secondes
        setTimeout(function() {
            notification.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
        
        // Gestionnaire d'événement pour le bouton de fermeture
        notification.querySelector('.btn-close').addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(notification);
            }, 500);
        });
    }
    
    // Fonction pour mettre à jour toutes les données et graphiques
    function updateAllData(analyzedData) {
        try {
            console.log("Mise à jour des données avec:", analyzedData);
            
            // Vérifier si les données sont valides
            if (!analyzedData || analyzedData.error) {
                throw new Error(analyzedData.error || "Données d'analyse invalides");
            }
            
            // Mettre à jour les statistiques sur la page
            document.getElementById('total-respondents').textContent = analyzedData.totalRespondents;
            document.getElementById('interested-percentage').textContent = analyzedData.interestedPercentage + '%';
            document.getElementById('average-budget').textContent = analyzedData.averageBudget + '€';
            document.getElementById('most-popular-activity').textContent = analyzedData.mostPopularActivity || '-';
            
            // Mettre à jour les données globales
            data.totalRespondents = analyzedData.totalRespondents;
            data.interestedPercentage = analyzedData.interestedPercentage;
            data.averageBudget = analyzedData.averageBudget;
            
            // Mettre à jour les données pour le graphique d'intérêt
            data.interest.data = [
                analyzedData.interestedPercentage,
                (100 - analyzedData.interestedPercentage) * 0.6,
                (100 - analyzedData.interestedPercentage) * 0.4
            ];
            
            // Mettre à jour les données pour le graphique des activités
            if (analyzedData.activitiesCounts) {
                const activitiesData = [];
                const activitiesLabels = [];
                const activityColors = [];
                
                // Couleurs pour les activités
                const colorPalette = [
                    '#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0',
                    '#3F51B5', '#FF9800', '#795548', '#607D8B', '#E91E63'
                ];
                
                // Trier les activités par nombre de pratiquants (décroissant)
                const sortedActivities = Object.entries(analyzedData.activitiesCounts)
                    .filter(([activity]) => activity !== "Aucun")
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10); // Limiter aux 10 activités les plus populaires
                
                sortedActivities.forEach(([activity, count], index) => {
                    activitiesLabels.push(activity);
                    activitiesData.push(count);
                    activityColors.push(colorPalette[index % colorPalette.length]);
                });
                
                data.activities.labels = activitiesLabels;
                data.activities.data = activitiesData;
                data.activities.colors = activityColors;
            }
            
            // Détruire et recréer les graphiques
            if (typeof destroyAllCharts === 'function') {
                destroyAllCharts();
            } else {
                console.warn("La fonction destroyAllCharts n'est pas disponible, utilisation d'une méthode alternative");
                // Méthode alternative pour détruire les graphiques
                if (typeof Chart !== 'undefined') {
                    Chart.helpers.each(Chart.instances, function(instance) {
                        instance.destroy();
                    });
                }
            }
            
            // Initialiser les graphiques
            if (typeof initCharts === 'function') {
                initCharts();
            } else {
                console.warn("La fonction initCharts n'est pas disponible");
            }
            
            // Animation pour attirer l'attention sur les changements
            document.querySelectorAll('.card').forEach(function(card) {
                card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
                card.style.transform = 'scale(1.02)';
                card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
                
                setTimeout(function() {
                    card.style.transform = '';
                    card.style.boxShadow = '';
                }, 500);
            });
            
        } catch (error) {
            console.error('Erreur lors de la mise à jour des données:', error);
            showNotification('Erreur', 'Erreur lors de la mise à jour des visualisations: ' + error.message);
        }
    }
});
