// Fonctionnalité de traitement des données de fichier Excel
document.addEventListener('DOMContentLoaded', function() {
    // Référence à l'élément de téléchargement de fichier
    const fileUpload = document.getElementById('file-upload');
    const uploadInfo = document.getElementById('upload-info');
    const lastUploadInfo = document.getElementById('last-upload-info');
    const dropZone = document.getElementById('drop-zone');
    const mainContent = document.querySelector('.container.py-4');
    
    // Vérifier si le navigateur prend en charge l'API File et localStorage
    if (window.File && window.FileReader && window.FileList && window.Blob && window.localStorage) {
        // Gestionnaire d'événement pour le changement de fichier
        fileUpload.addEventListener('change', handleFileSelect, false);
        
        // Vérifier si des données sont déjà stockées
        checkForStoredData();
    } else {
        uploadInfo.innerHTML = '<div class="alert alert-danger">Votre navigateur ne prend pas en charge toutes les fonctionnalités nécessaires. Veuillez utiliser un navigateur plus récent.</div>';
    }
    
    // Fonction pour vérifier si des données sont déjà stockées
    function checkForStoredData() {
        try {
            // Vérifier si des données sont disponibles
            const jsonData = localStorage.getItem('questionnaireData');
            const currentFile = localStorage.getItem('currentFile');
            
            if (jsonData && currentFile) {
                // Charger les données
                const parsedData = JSON.parse(jsonData);
                const fileInfo = JSON.parse(currentFile);
                
                // Mettre à jour l'interface utilisateur
                lastUploadInfo.innerHTML = `<div class="card-text"><strong>Dernier fichier chargé:</strong> ${fileInfo.name}<br><strong>Date:</strong> ${fileInfo.date} à ${fileInfo.time}</div>`;
                
                // Mettre à jour les données et les graphiques
                updateAllData(parsedData);
                
                // Afficher une notification
                showNotification('Données chargées', 'Les données précédemment chargées ont été restaurées depuis le stockage local.');
            } else {
                // Aucune donnée stockée, afficher le popup d'invitation
                showFileUploadPopup();
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement depuis localStorage:', error);
            // En cas d'erreur, afficher le popup d'invitation
            showFileUploadPopup();
        }
    }
    
    // Fonction pour afficher le popup d'invitation à déposer un fichier
    function showFileUploadPopup() {
        // Créer l'overlay flouté
        const overlay = document.createElement('div');
        overlay.id = 'file-upload-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.backdropFilter = 'blur(5px)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        
        // Créer la boîte de dialogue
        const dialog = document.createElement('div');
        dialog.className = 'card';
        dialog.style.maxWidth = '500px';
        dialog.style.width = '90%';
        dialog.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
        dialog.style.animation = 'fadeIn 0.3s ease-out';
        
        // Ajouter du CSS pour l'animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        // Contenu de la boîte de dialogue
        dialog.innerHTML = `
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Bienvenue dans l'outil d'analyse de questionnaire</h5>
            </div>
            <div class="card-body">
                <p class="card-text">Aucune donnée n'a été chargée. Pour commencer l'analyse, veuillez déposer votre fichier Excel contenant les réponses au questionnaire.</p>
                
                <div class="drop-zone mb-3" id="popup-drop-zone" style="border: 2px dashed #ccc; border-radius: 5px; padding: 25px; text-align: center; cursor: pointer; transition: all 0.3s;">
                    <p><i class="bi bi-cloud-upload fs-1"></i></p>
                    <p>Glissez-déposez votre fichier Excel ici ou cliquez pour sélectionner</p>
                    <input type="file" id="popup-file-upload" class="d-none" accept=".xlsx, .xls">
                </div>
                
                <div class="text-center">
                    <button id="later-button" class="btn btn-outline-secondary">Je le ferai plus tard</button>
                </div>
            </div>
        `;
        
        // Ajouter la boîte de dialogue à l'overlay
        overlay.appendChild(dialog);
        
        // Ajouter l'overlay au document
        document.body.appendChild(overlay);
        
        // Référence aux éléments du popup
        const popupDropZone = document.getElementById('popup-drop-zone');
        const popupFileUpload = document.getElementById('popup-file-upload');
        const laterButton = document.getElementById('later-button');
        
        // Gestionnaire d'événement pour le bouton "Je le ferai plus tard"
        laterButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        // Gestionnaire d'événement pour le clic sur la zone de dépôt
        popupDropZone.addEventListener('click', function() {
            popupFileUpload.click();
        });
        
        // Gestionnaire d'événement pour le changement de fichier dans le popup
        popupFileUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            
            if (file) {
                // Copier le fichier sélectionné vers l'input file principal
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileUpload.files = dataTransfer.files;
                
                // Déclencher l'événement change pour traiter le fichier
                const changeEvent = new Event('change', { bubbles: true });
                fileUpload.dispatchEvent(changeEvent);
                
                // Fermer le popup
                document.body.removeChild(overlay);
            }
        });
        
        // Événements de glisser-déposer pour le popup
        popupDropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            popupDropZone.style.borderColor = '#007bff';
            popupDropZone.style.backgroundColor = '#f1f8ff';
        });
        
        popupDropZone.addEventListener('dragleave', function() {
            popupDropZone.style.borderColor = '#ccc';
            popupDropZone.style.backgroundColor = '';
        });
        
        popupDropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            popupDropZone.style.borderColor = '#ccc';
            popupDropZone.style.backgroundColor = '';
            
            if (e.dataTransfer.files.length) {
                const file = e.dataTransfer.files[0];
                
                // Copier le fichier déposé vers l'input file principal
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileUpload.files = dataTransfer.files;
                
                // Déclencher l'événement change pour traiter le fichier
                const changeEvent = new Event('change', { bubbles: true });
                fileUpload.dispatchEvent(changeEvent);
                
                // Fermer le popup
                document.body.removeChild(overlay);
            }
        });
    }
    
    // Fonction pour gérer la sélection de fichier
    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) {
            return;
        }
        
        // Vérifier le type de fichier
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            uploadInfo.innerHTML = '<div class="alert alert-danger">Veuillez sélectionner un fichier Excel (.xlsx ou .xls).</div>';
            return;
        }
        
        uploadInfo.innerHTML = '<div class="alert alert-info">Chargement du fichier en cours...</div>';
        
        // Charger le script SheetJS si nécessaire
        if (typeof XLSX === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
            script.onload = function() {
                processExcelFile(file);
            };
            document.head.appendChild(script);
        } else {
            processExcelFile(file);
        }
    }
    
    // Fonction pour traiter le fichier Excel
    function processExcelFile(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                
                // Extraire les données de la première feuille
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                console.log("Données extraites du fichier Excel:", jsonData);
                
                // Enregistrer les données dans localStorage
                saveDataToLocalStorage(file.name, jsonData);
                
                // Mettre à jour l'interface utilisateur
                updateUIAfterFileLoad(file.name);
                
                // Analyser et mettre à jour les données et les graphiques
                const analyzedData = analyzeQuestionnaireData(jsonData);
                updateAllData(analyzedData);
                
            } catch (error) {
                console.error("Erreur lors du traitement du fichier:", error);
                uploadInfo.innerHTML = `<div class="alert alert-danger">Erreur lors du traitement du fichier: ${error.message}</div>`;
            }
        };
        
        reader.onerror = function() {
            uploadInfo.innerHTML = '<div class="alert alert-danger">Erreur lors de la lecture du fichier.</div>';
        };
        
        // Lire le fichier comme un tableau binaire
        reader.readAsBinaryString(file);
    }
    
    // Fonction pour sauvegarder les données dans localStorage
    function saveDataToLocalStorage(fileName, jsonData) {
        try {
            // Enregistrer les données
            localStorage.setItem('questionnaireData', JSON.stringify(jsonData));
            
            // Enregistrer les informations sur le fichier
            const now = new Date();
            const fileInfo = {
                name: fileName,
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
                timestamp: now.getTime()
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
            uploadInfo.innerHTML += `<div class="alert alert-warning">Les données ont été chargées mais n'ont pas pu être sauvegardées localement: ${error.message}</div>`;
        }
    }
    
    // Fonction pour mettre à jour l'interface utilisateur après le chargement d'un fichier
    function updateUIAfterFileLoad(fileName) {
        // Récupérer les informations sur le fichier actuel
        const currentFile = JSON.parse(localStorage.getItem('currentFile'));
        
        // Mettre à jour l'interface utilisateur
        uploadInfo.innerHTML = `<div class="alert alert-success">Fichier "${fileName}" chargé avec succès!</div>`;
        lastUploadInfo.innerHTML = `<div class="card-text"><strong>Dernier fichier chargé:</strong> ${fileName}<br><strong>Date:</strong> ${currentFile.date} à ${currentFile.time}</div>`;
        
        // Ajouter un bouton pour afficher l'historique des fichiers
        uploadInfo.innerHTML += `
            <button class="btn btn-outline-primary mt-2" id="show-history-btn">
                <i class="bi bi-clock-history"></i> Afficher l'historique des fichiers
            </button>
        `;
        
        // Ajouter un gestionnaire d'événement pour le bouton d'historique
        document.getElementById('show-history-btn').addEventListener('click', showFileHistory);
        
        // Afficher une notification
        showNotification('Données mises à jour', 'Toutes les visualisations ont été mises à jour avec les nouvelles données.');
    }
    
    // Fonction pour afficher l'historique des fichiers
    function showFileHistory() {
        try {
            // Récupérer l'historique des fichiers
            const fileHistory = JSON.parse(localStorage.getItem('fileHistory') || '[]');
            
            if (fileHistory.length === 0) {
                uploadInfo.innerHTML += '<div class="alert alert-info mt-2">Aucun historique de fichier disponible.</div>';
                return;
            }
            
            // Créer un tableau pour afficher l'historique
            let historyHTML = `
                <div class="mt-3">
                    <h6>Historique des fichiers chargés</h6>
                    <table class="table table-striped table-sm">
                        <thead>
                            <tr>
                                <th>Nom du fichier</th>
                                <th>Date</th>
                                <th>Heure</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            // Trier l'historique par date (du plus récent au plus ancien)
            fileHistory.sort((a, b) => b.timestamp - a.timestamp);
            
            // Ajouter chaque fichier à l'historique
            fileHistory.forEach((file, index) => {
                historyHTML += `
                    <tr>
                        <td>${file.name}</td>
                        <td>${file.date}</td>
                        <td>${file.time}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary load-history-file" data-index="${index}">
                                Charger
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            historyHTML += `
                        </tbody>
                    </table>
                </div>
            `;
            
            // Afficher l'historique
            const historyContainer = document.createElement('div');
            historyContainer.id = 'file-history-container';
            historyContainer.innerHTML = historyHTML;
            
            // Remplacer l'historique existant s'il existe
            const existingHistory = document.getElementById('file-history-container');
            if (existingHistory) {
                existingHistory.remove();
            }
            
            // Ajouter l'historique à l'interface
            uploadInfo.appendChild(historyContainer);
            
            // Ajouter des gestionnaires d'événements pour les boutons de chargement
            document.querySelectorAll('.load-history-file').forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    loadFileFromHistory(index);
                });
            });
            
        } catch (error) {
            console.error('Erreur lors de l\'affichage de l\'historique:', error);
            uploadInfo.innerHTML += `<div class="alert alert-danger mt-2">Erreur lors de l'affichage de l'historique: ${error.message}</div>`;
        }
    }
    
    // Fonction pour charger un fichier depuis l'historique
    function loadFileFromHistory(index) {
        try {
            // Récupérer l'historique des fichiers
            const fileHistory = JSON.parse(localStorage.getItem('fileHistory') || '[]');
            
            if (index >= 0 && index < fileHistory.length) {
                const fileInfo = fileHistory[index];
                
                // Récupérer les données
                const jsonData = JSON.parse(localStorage.getItem('questionnaireData'));
                
                if (jsonData) {
                    // Mettre à jour le fichier actuel
                    localStorage.setItem('currentFile', JSON.stringify(fileInfo));
                    
                    // Mettre à jour l'interface utilisateur
                    lastUploadInfo.innerHTML = `<div class="card-text"><strong>Dernier fichier chargé:</strong> ${fileInfo.name}<br><strong>Date:</strong> ${fileInfo.date} à ${fileInfo.time}</div>`;
                    
                    // Analyser et mettre à jour les données et les graphiques
                    const analyzedData = analyzeQuestionnaireData(jsonData);
                    updateAllData(analyzedData);
                    
                    // Afficher une notification
                    showNotification('Fichier chargé depuis l\'historique', `Le fichier "${fileInfo.name}" a été chargé avec succès.`);
                    
                    // Masquer l'historique
                    const historyContainer = document.getElementById('file-history-container');
                    if (historyContainer) {
                        historyContainer.remove();
                    }
                    
                    // Mettre à jour l'info de chargement
                    uploadInfo.innerHTML = `<div class="alert alert-success">Fichier "${fileInfo.name}" chargé depuis l'historique avec succès!</div>
                        <button class="btn btn-outline-primary mt-2" id="show-history-btn">
                            <i class="bi bi-clock-history"></i> Afficher l'historique des fichiers
                        </button>`;
                    
                    // Ajouter un gestionnaire d'événement pour le bouton d'historique
                    document.getElementById('show-history-btn').addEventListener('click', showFileHistory);
                }
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement depuis l\'historique:', error);
            uploadInfo.innerHTML += `<div class="alert alert-danger mt-2">Erreur lors du chargement depuis l'historique: ${error.message}</div>`;
        }
    }
    
    // Fonction pour analyser les données du questionnaire
    function analyzeQuestionnaireData(jsonData) {
        // Extraction dynamique des statistiques à partir des vraies colonnes du questionnaire
        try {
            if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
                throw new Error("Les données du questionnaire sont vides ou invalides");
            }

            const totalRespondents = jsonData.length;
            let interestedCount = 0;
            let budgetSum = 0;
            let budgetCount = 0;
            let interestLevels = [0, 0, 0, 0, 0, 0]; // Pour l'échelle 1 à 5
            let genderCounts = { 'Femme': 0, 'Homme': 0, 'Non-binaire': 0, 'Autre': 0 };
            let statusCounts = {};
            let frequencyCounts = {
                "Oui, au moins 3 fois par semaine": 0,
                "Oui, entre 1 et 2 fois par semaine": 0,
                "Moins d'une fois par semaine": 0,
                "Non, mais j'aimerais.": 0,
                "Non, jamais.": 0
            };
            let activitiesCounts = {};
            let locationCounts = {};
            let financialSituationCounts = {};
            let practiceLocationCounts = {};
            let motivationsCounts = {};
            let barriersCounts = {};
            let budgetByInterest = [0, 0, 0, 0, 0];
            let budgetByInterestCount = [0, 0, 0, 0, 0];

            jsonData.forEach(response => {
                // Intérêt pour la salle (échelle 1 à 5)
                const interest = parseInt(response["Sur une échelle de 1 à 5, quel est votre intérêt pour une salle de sport étudiante et participative à prix réduit ?"]);
                if (!isNaN(interest) && interest >= 1 && interest <= 5) {
                    interestLevels[interest - 1]++;
                }

                // Budget (extraction du champ prix raisonnable)
                let budgetStr = response["Quel prix par mois te paraît raisonnable pour la salle de sport ?"] || '';
                let budgetVal = null;
                if (budgetStr.match(/\d+/g)) {
                    // Prend la moyenne si intervalle, sinon la valeur unique
                    let nums = budgetStr.match(/\d+[,.]?\d*/g).map(s => parseFloat(s.replace(',', '.')));
                    if (nums.length === 2) budgetVal = (nums[0] + nums[1]) / 2;
                    else if (nums.length === 1) budgetVal = nums[0];
                } else if (budgetStr.includes('<10')) {
                    budgetVal = 8;
                } else if (budgetStr.includes('>25')) {
                    budgetVal = 27;
                }
                if (budgetVal) {
                    budgetSum += budgetVal;
                    budgetCount++;
                    if (!isNaN(interest) && interest >= 1 && interest <= 5) {
                        budgetByInterest[interest - 1] += budgetVal;
                        budgetByInterestCount[interest - 1]++;
                    }
                }

                // Genre
                let genre = (response["Quel est ton sexe ? "] || '').trim();
                if (genre && genderCounts[genre] !== undefined) genderCounts[genre]++;
                else if (genre) genderCounts['Autre']++;

                // Statut (niveau d'étude)
                let status = (response["Quel est ton niveau d'étude ? "] || '').trim();
                if (status) statusCounts[status] = (statusCounts[status] || 0) + 1;

                // Fréquence de pratique sportive
                let freq = (response["Pratiques-tu une activité sportive ? "] || '').trim();
                if (freq && frequencyCounts[freq] !== undefined) frequencyCounts[freq]++;

                // Activités pratiquées
                let acts = (response["Quel(s) sport(s) pratiques-tu ? "] || '').split(',');
                acts.forEach(a => {
                    let act = a.trim();
                    if (act) activitiesCounts[act] = (activitiesCounts[act] || 0) + 1;
                });

                // Lieu d'habitation
                let loc = (response["Quel est ton lieu de résidence ?"] || '').trim();
                if (loc) locationCounts[loc] = (locationCounts[loc] || 0) + 1;

                // Situation financière
                let fin = (response["As-tu un revenu ?"] || '').trim();
                if (fin) financialSituationCounts[fin] = (financialSituationCounts[fin] || 0) + 1;

                // Lieux de pratique actuels
                let salle = (response["Quel type de salle ?"] || '').trim();
                if (salle) practiceLocationCounts[salle] = (practiceLocationCounts[salle] || 0) + 1;

                // Motivations
                let motivs = (response["Pour quelle(s) raison(s) pratiques-tu ?"] || '').split(',');
                motivs.forEach(m => {
                    let mot = m.trim();
                    if (mot) motivationsCounts[mot] = (motivationsCounts[mot] || 0) + 1;
                });

                // Freins
                let freins = (response["Si tu ne vas pas à la salle de sport, quelles sont les principales raisons ?"] || '').split(',');
                freins.forEach(f => {
                    let fr = f.trim();
                    if (fr) barriersCounts[fr] = (barriersCounts[fr] || 0) + 1;
                });

                // Intéressé = intérêt >= 4
                if (!isNaN(interest) && interest >= 4) interestedCount++;
            });

            // --- Équipements souhaités (top 10) ---
            let equipmentCounts = {};
            for (let i = 1; i <= 10; i++) {
                const col = `Quels équipements souhaiterais-tu voir en priorité dans la salle ? (top 10) [${i}e]`;
                jsonData.forEach(response => {
                    let eq = (response[col] || '').trim();
                    if (eq) equipmentCounts[eq] = (equipmentCounts[eq] || 0) + 1;
                });
            }
            const equipmentLabels = Object.keys(equipmentCounts);
            const equipmentData = equipmentLabels.map(l => equipmentCounts[l]);

            // --- Raisons de pratique sportive ---
            let reasonsCounts = {};
            jsonData.forEach(response => {
                let reasons = (response["Pour quelle(s) raison(s) pratiques-tu ?"] || '').split(',');
                reasons.forEach(r => {
                    let reason = r.trim();
                    if (reason) reasonsCounts[reason] = (reasonsCounts[reason] || 0) + 1;
                });
            });
            const reasonsLabels = Object.keys(reasonsCounts);
            const reasonsData = reasonsLabels.map(l => reasonsCounts[l]);

            // --- Facteurs importants (ambiance, matériel, etc.) ---
            let factorsCounts = {};
            jsonData.forEach(response => {
                let ambiance = (response["Quelle ambiance souhaiterais-tu retrouver dans la salle ?"] || '').trim();
                if (ambiance) factorsCounts[ambiance] = (factorsCounts[ambiance] || 0) + 1;
            });
            const factorsLabels = Object.keys(factorsCounts);
            const factorsData = factorsLabels.map(l => factorsCounts[l]);

            // --- Bénéfices attendus (à partir de la question sur l'envie d'inscription) ---
            let benefitsCounts = {};
            jsonData.forEach(response => {
                let benefits = (response["Qu’est-ce qui te donnerait le plus envie de t’inscrire à Uni’Fit ?"] || '').split(',');
                benefits.forEach(b => {
                    let benefit = b.trim();
                    if (benefit) benefitsCounts[benefit] = (benefitsCounts[benefit] || 0) + 1;
                });
            });
            const benefitsLabels = Object.keys(benefitsCounts);
            const benefitsData = benefitsLabels.map(l => benefitsCounts[l]);

            // --- Facteurs de satisfaction (matériel, ambiance, etc.) ---
            let satisfactionCounts = {};
            jsonData.forEach(response => {
                let mat = ((response["Le matériel est-il satisfaisant ?"] || '').toString()).trim();
                if (mat) satisfactionCounts[mat] = (satisfactionCounts[mat] || 0) + 1;
            });
            const satisfactionLabels = Object.keys(satisfactionCounts);
            const satisfactionData = satisfactionLabels.map(l => satisfactionCounts[l]);

            // --- Participation (volonté et type) ---
            let participationCounts = {};
            jsonData.forEach(response => {
                let part = (response["Serais-tu prêt à donner de ton temps pour participer à la vie active de la salle contre certains avantages ?"] || '').trim();
                if (part) participationCounts[part] = (participationCounts[part] || 0) + 1;
            });
            const participationLabels = Object.keys(participationCounts);
            const participationData = participationLabels.map(l => participationCounts[l]);

            // --- Temps de participation ---
            let timeCommitmentCounts = {};
            jsonData.forEach(response => {
                let t = (response["Si oui, combien de temps par semaine ?"] || '').trim();
                if (t) timeCommitmentCounts[t] = (timeCommitmentCounts[t] || 0) + 1;
            });
            const timeCommitmentLabels = Object.keys(timeCommitmentCounts);
            const timeCommitmentData = timeCommitmentLabels.map(l => timeCommitmentCounts[l]);

            // --- Horaires préférés ---
            let preferredTimesCounts = {};
            jsonData.forEach(response => {
                let times = (response["Quels horaires te conviendraient le mieux pour venir pratiquer ?"] || '').split(',');
                times.forEach(t => {
                    let time = t.trim();
                    if (time) preferredTimesCounts[time] = (preferredTimesCounts[time] || 0) + 1;
                });
            });
            const preferredTimesLabels = Object.keys(preferredTimesCounts);
            const preferredTimesData = preferredTimesLabels.map(l => preferredTimesCounts[l]);

            // --- Activités par genre ---
            let activitiesByGender = {};
            jsonData.forEach(response => {
                let genre = (response["Quel est ton sexe ? "] || '').trim();
                let acts = (response["Quel(s) sport(s) pratiques-tu ? "] || '').split(',');
                acts.forEach(a => {
                    let act = a.trim();
                    if (act && genre) {
                        if (!activitiesByGender[act]) activitiesByGender[act] = {};
                        activitiesByGender[act][genre] = (activitiesByGender[act][genre] || 0) + 1;
                    }
                });
            });
            // Format pour Chart.js : labels = activités, datasets = genres
            const abgLabels = Object.keys(activitiesByGender);
            const abgGenres = Array.from(new Set([].concat(...Object.values(activitiesByGender).map(obj => Object.keys(obj)))));
            const abgDatasets = abgGenres.map(genre => ({
                label: genre,
                data: abgLabels.map(act => activitiesByGender[act][genre] || 0)
            }));

            // Calculs finaux
            const interestedPercentage = (interestedCount / totalRespondents * 100).toFixed(1);
            const averageBudget = budgetCount ? (budgetSum / budgetCount).toFixed(2) : 0;
            const mostPopularActivity = Object.entries(activitiesCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
            const statusLabels = Object.keys(statusCounts);
            const statusData = statusLabels.map(l => statusCounts[l]);
            const genderLabels = Object.keys(genderCounts);
            const genderData = genderLabels.map(l => genderCounts[l]);
            const locationLabels = Object.keys(locationCounts);
            const locationData = locationLabels.map(l => locationCounts[l]);
            const financialLabels = Object.keys(financialSituationCounts);
            const financialData = financialLabels.map(l => financialSituationCounts[l]);
            const freqLabels = Object.keys(frequencyCounts);
            const freqData = freqLabels.map(l => frequencyCounts[l]);
            const activitiesLabels = Object.keys(activitiesCounts);
            const activitiesData = activitiesLabels.map(l => activitiesCounts[l]);
            const practiceLocationLabels = Object.keys(practiceLocationCounts);
            const practiceLocationData = practiceLocationLabels.map(l => practiceLocationCounts[l]);
            const motivationsLabels = Object.keys(motivationsCounts);
            const motivationsData = motivationsLabels.map(l => motivationsCounts[l]);
            const barriersLabels = Object.keys(barriersCounts);
            const barriersData = barriersLabels.map(l => barriersCounts[l]);
            const budgetByInterestAvg = budgetByInterest.map((sum, i) => budgetByInterestCount[i] ? (sum / budgetByInterestCount[i]).toFixed(2) : 0);

            return {
                totalRespondents,
                interestedPercentage: parseFloat(interestedPercentage),
                averageBudget: parseFloat(averageBudget),
                mostPopularActivity,
                activitiesCounts,
                status: { labels: statusLabels, data: statusData },
                gender: { labels: genderLabels, data: genderData },
                location: { labels: locationLabels, data: locationData },
                financialSituation: { labels: financialLabels, data: financialData },
                frequency: { labels: freqLabels, data: freqData },
                activities: { labels: activitiesLabels, data: activitiesData },
                practiceLocation: { labels: practiceLocationLabels, data: practiceLocationData },
                motivations: { labels: motivationsLabels, data: motivationsData },
                barriers: { labels: barriersLabels, data: barriersData },
                interestLevels,
                budgetByInterest: budgetByInterestAvg,
                equipment: { labels: equipmentLabels, data: equipmentData },
                reasons: { labels: reasonsLabels, data: reasonsData },
                factors: { labels: factorsLabels, data: factorsData },
                expectedBenefits: { labels: benefitsLabels, data: benefitsData },
                satisfaction: { labels: satisfactionLabels, data: satisfactionData },
                participation: { labels: participationLabels, data: participationData },
                timeCommitment: { labels: timeCommitmentLabels, data: timeCommitmentData },
                preferredTimes: { labels: preferredTimesLabels, data: preferredTimesData },
                activitiesByGender: { labels: abgLabels, genres: abgGenres, datasets: abgDatasets },
                rawData: jsonData
            };
        } catch (error) {
            console.error("Erreur lors de l'analyse des données:", error);
            return {
                totalRespondents: 0,
                interestedPercentage: 0,
                averageBudget: 0,
                mostPopularActivity: "Aucune donnée",
                activitiesCounts: {},
                error: error.message
            };
        }
    }
    
    // Fonction pour mettre à jour toutes les données et graphiques
    function updateAllData(analyzedData) {
        try {
            console.log("Mise à jour des données avec:", analyzedData);
            
            // Vérifier si les données sont valides
            if (!analyzedData || analyzedData.error) {
                throw new Error(analyzedData.error || "Données d'analyse invalides");
            }
            
            // Mettre à jour les données globales
            updateGlobalData(analyzedData);
            
            // Détruire et recréer tous les graphiques
            destroyAllCharts();
            initCharts();
            
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
            uploadInfo.innerHTML += `<div class="alert alert-warning mt-2">Erreur lors de la mise à jour des visualisations: ${error.message}</div>`;
        }
    }
    
    // Fonction pour mettre à jour les données globales
    function updateGlobalData(analyzedData) {
        // Mettre à jour les variables globales
        data.totalRespondents = analyzedData.totalRespondents;
        data.interestedPercentage = analyzedData.interestedPercentage;
        data.averageBudget = analyzedData.averageBudget;
        
        // Mettre à jour les statistiques affichées
        document.querySelectorAll('.stat-card .value').forEach(function(element, index) {
            if (index === 0) {
                element.textContent = data.totalRespondents;
            } else if (index === 1) {
                element.textContent = data.interestedPercentage + '%';
            } else if (index === 2) {
                element.textContent = data.averageBudget + '€';
            } else if (index === 3) {
                element.textContent = analyzedData.mostPopularActivity;
            }
        });
        
        // Mettre à jour d'autres données si nécessaire
        // Mettre à jour les données pour les graphiques
        if (analyzedData.activitiesCounts) {
            const activitiesData = [];
            const activitiesLabels = [];
            
            for (const [activity, count] of Object.entries(analyzedData.activitiesCounts)) {
                if (activity !== "Aucun") {
                    activitiesLabels.push(activity);
                    activitiesData.push(count);
                }
            }
            
            data.activities.labels = activitiesLabels;
            data.activities.data = activitiesData;
        }
        
        // Mettre à jour les données d'intérêt
        data.interest.data = [
            analyzedData.interestedPercentage,
            (100 - analyzedData.interestedPercentage) * 0.6,
            (100 - analyzedData.interestedPercentage) * 0.4
        ];
        
        // Mettre à jour d'autres données en fonction des informations disponibles
        // ...
    }
    
    // Fonction pour détruire tous les graphiques
    function destroyAllCharts() {
        // Détruire tous les graphiques existants
        Chart.helpers.each(Chart.instances, function(instance) {
            instance.destroy();
        });
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
    
    // Initialisation de la zone de glisser-déposer
    if (dropZone && fileUpload) {
        // Cliquer sur la zone pour sélectionner un fichier
        dropZone.addEventListener('click', function() {
            fileUpload.click();
        });
        
        // Événements de glisser-déposer
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('active');
        });
        
        dropZone.addEventListener('dragleave', function() {
            dropZone.classList.remove('active');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('active');
            
            if (e.dataTransfer.files.length) {
                fileUpload.files = e.dataTransfer.files;
                // Déclencher l'événement change pour traiter le fichier
                const event = new Event('change', { bubbles: true });
                fileUpload.dispatchEvent(event);
            }
        });
    }
});
