// main.js - Script principal pour le site de visualisation du questionnaire Uni'Fit

// Variables globales
let rawData = null;
let processedData = null;
let charts = {};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Masquer le spinner de chargement de données (celui pour l'import)
    document.getElementById('loading').style.display = 'none';
    
    // Initialiser les écouteurs d'événements
    initEventListeners();
    
    // Masquer l'animation de chargement de la page après un court délai
    // Utilisation de window.onload pour s'assurer que tout (y compris les images) est chargé
    window.onload = () => {
        setTimeout(() => { // Ajout d'un petit délai supplémentaire pour l'effet visuel si nécessaire
             document.body.classList.add('loaded');
        }, 200); // Délai en millisecondes (ajustez si besoin)
    };
});

// Initialisation des écouteurs d'événements
function initEventListeners() {
    // Bouton d'importation des données
    document.getElementById('importBtn').addEventListener('click', importGoogleSheet);
    
    // Bouton de génération d'analyse croisée
    document.getElementById('generateCrossAnalysisBtn').addEventListener('click', generateCrossAnalysis);
    
    // Bouton de génération de rapport
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    
    // Bouton de copie du rapport
    document.getElementById('copyReportBtn').addEventListener('click', copyReport);
    
    // Navigation dans la sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Boutons de basculement de pourcentage (utilisation de la délégation d'événements)
    document.body.addEventListener('click', function(event) {
        if (event.target.closest('.toggle-percentage')) {
            const button = event.target.closest('.toggle-percentage');
            const chartId = button.dataset.chartId;
            if (chartId && charts[chartId]) {
                toggleChartPercentage(chartId);
            }
        }
    });
}

// Fonction pour importer les données depuis Google Sheet
function importGoogleSheet() {
    // Afficher le spinner de chargement
    document.getElementById('loading').style.display = 'flex';
    
    // Récupérer l'URL du Google Sheet
    const googleSheetUrl = document.getElementById('googleSheetUrl').value.trim();
    
    // Vérifier que l'URL est valide
    if (!googleSheetUrl || !googleSheetUrl.includes('docs.google.com/spreadsheets')) {
        document.getElementById('importStatus').innerHTML = '<div class="alert alert-danger">URL invalide. Veuillez entrer une URL Google Sheet valide.</div>';
        document.getElementById('loading').style.display = 'none';
        return;
    }
    
    // Extraire l'ID du Google Sheet
    const sheetId = extractSheetId(googleSheetUrl);
    if (!sheetId) {
        document.getElementById('importStatus').innerHTML = '<div class="alert alert-danger">Impossible d\'extraire l\'ID du Google Sheet. Vérifiez l\'URL.</div>';
        document.getElementById('loading').style.display = 'none';
        return;
    }
    
    // Construire l'URL d'export CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    // Récupérer les données CSV
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données. Vérifiez que le Google Sheet est accessible publiquement.');
            }
            return response.text();
        })
        .then(csvData => {
            // Analyser les données CSV
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    rawData = results.data;
                    processData(rawData);
                    document.getElementById('importStatus').innerHTML = '<div class="alert alert-success">Données importées avec succès ! ' + rawData.length + ' réponses analysées.</div>';
                    document.getElementById('loading').style.display = 'none';
                },
                error: function(error) {
                    document.getElementById('importStatus').innerHTML = '<div class="alert alert-danger">Erreur lors de l\'analyse des données : ' + error.message + '</div>';
                    document.getElementById('loading').style.display = 'none';
                }
            });
        })
        .catch(error => {
            document.getElementById('importStatus').innerHTML = '<div class="alert alert-danger">' + error.message + '</div>';
            document.getElementById('loading').style.display = 'none';
        });
}

// Fonction pour extraire l'ID du Google Sheet à partir de l'URL
function extractSheetId(url) {
    // Format typique: https://docs.google.com/spreadsheets/d/SHEET_ID/edit?usp=sharing
    const regex = /\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Fonction pour compter les occurrences des valeurs dans une colonne
function countValues(data, columnName) {
    const counts = {};
    data.forEach(row => {
        const value = row[columnName];
        if (value && value.trim() !== '') {
            counts[value] = (counts[value] || 0) + 1;
        }
    });
    return counts;
}

// Supprimer la fonction mapSportToCategory car elle n'est plus nécessaire
/* 
// Fonction pour mapper les sports à des catégories plus larges (SUPPRIMÉE)
function mapSportToCategory(sport) { 
    // ... code supprimé ...
} 
*/

// Fonction pour compter les occurrences des valeurs multiples (séparées par des virgules)
function countMultipleValues(data, columnName) {
    const counts = {};
    const respondentSet = new Set(); // Pour compter les répondants uniques

    // Vérifier si la colonne existe
    if (!data.length || !data[0].hasOwnProperty(columnName)) {
        console.warn(`La colonne "${columnName}" n'existe pas dans les données.`);
        return { counts: counts, respondentCount: 0 };
    }

    data.forEach((row, index) => { // Ajouter l'index pour identifier les répondants
        const valueStr = row[columnName];
        if (valueStr && valueStr.trim() !== '') {
            respondentSet.add(index); // Ajouter l'index du répondant à l'ensemble
            
            // Google Sheets sépare généralement les réponses multiples par ", "
            const values = valueStr.split(', ').map(v => v.trim()).filter(v => v !== ''); 

            values.forEach(value => {
                // Utiliser directement la valeur (qui correspond à une option cochée)
                // On peut ajouter une condition pour ignorer "Aucun" si on ne veut pas le voir dans le graphique
                // if (value.toLowerCase() === 'aucun') {
                //     return; 
                // }
                counts[value] = (counts[value] || 0) + 1;
            });
        }
    });

    // Retourner les comptes et le nombre de répondants uniques
    return { counts: counts, respondentCount: respondentSet.size };
}

// Fonction pour traiter les données brutes
function processData(data) {
    // Stocker les résultats de countMultipleValues
    const sourcesRevenuResult = countMultipleValues(data, 'Quelle(s) est/sont ta/tes source(s) de revenu(s) ?');
    const sportsPratiquesResult = countMultipleValues(data, 'Quel(s) sport(s) pratiques-tu ? ');
    const raisonsPratiqueResult = countMultipleValues(data, 'Pour quelle(s) raison(s) pratiques-tu ?');
    const raisonsNonFrequentationResult = countMultipleValues(data, 'Si tu ne vas pas à la salle de sport, quelles sont les principales raisons ?');
    const horairesPreferesResult = countMultipleValues(data, 'Quels horaires te conviendraient le mieux pour venir pratiquer ?');
    const momentsDisponiblesResult = countMultipleValues(data, 'A quels moments serais-tu le plus disponible pour participer à la gestion de la salle ?');
    const servicesAnnexesResult = countMultipleValues(data, 'Quels services annexes te plairaient dans la salle ?');
    const servicesAccompagnementResult = countMultipleValues(data, 'Quels services d’accompagnement t’intéresseraient le plus dans la salle de sport ?');

    processedData = {
        // Données démographiques
        sexe: countValues(data, 'Quel est ton sexe ? '),
        age: countValues(data, 'Quelle âge as-tu ?'),
        niveau_etude: countValues(data, 'Quel est ton niveau d\'étude ? '),
        filiere: countValues(data, 'Quelle est ta filière ?'),
        revenu: countValues(data, 'As-tu un revenu ?'),
        sources_revenu: sourcesRevenuResult.counts,
        sources_revenu_respondents: sourcesRevenuResult.respondentCount,
        
        // Pratiques sportives
        pratique_sportive: countValues(data, 'Pratiques-tu une activité sportive ? '),
        sports_pratiques: sportsPratiquesResult.counts,
        sports_pratiques_respondents: sportsPratiquesResult.respondentCount,
        raisons_pratique: raisonsPratiqueResult.counts,
        raisons_pratique_respondents: raisonsPratiqueResult.respondentCount,
        sport_chez_soi: countValues(data, 'Fais-tu du sport chez toi ?'),
        frequentation_salle: countValues(data, 'Fréquentes-tu une salle de sport ?'),
        raisons_non_frequentation: raisonsNonFrequentationResult.counts,
        raisons_non_frequentation_respondents: raisonsNonFrequentationResult.respondentCount,
        type_salle: countValues(data, 'Quel type de salle ?'),
        prix_paye: countValues(data, 'Quel prix payes-tu chaque mois ?'),
        
        // Préférences pour la salle
        interet_salle_etudiante: countValues(data, 'Sur une échelle de 1 à 5, quel est votre intérêt pour une salle de sport étudiante et participative à prix réduit ?'),
        participation_vie_active: countValues(data, 'Serais-tu prêt à donner de ton temps pour participer à la vie active de la salle contre certains avantages ?'),
        temps_participation: countValues(data, 'Si oui, combien de temps par semaine ?'),
        prix_raisonnable: countValues(data, 'Quel prix par mois te paraît raisonnable pour la salle de sport ?'),
        horaires_preferes: horairesPreferesResult.counts,
        horaires_preferes_respondents: horairesPreferesResult.respondentCount,
        moments_disponibles: momentsDisponiblesResult.counts, // Non charté actuellement
        moments_disponibles_respondents: momentsDisponiblesResult.respondentCount, // Non charté actuellement
        services_annexes: servicesAnnexesResult.counts,
        services_annexes_respondents: servicesAnnexesResult.respondentCount,
        services_accompagnement: servicesAccompagnementResult.counts,
        services_accompagnement_respondents: servicesAccompagnementResult.respondentCount,
        evenements_inedits: countValues(data, 'Serais-tu intéressé par des événements inédits ?'), // Ajouté
        conseils_pairs: countValues(data, 'Serais-tu plus à l\'aise à l\'idée de demander des conseils à des gens de ton âge ?'), // Ajouté
        ambiance_souhaitee: countValues(data, 'Quelle ambiance souhaiterais-tu retrouver dans la salle ?'), // Ajouté
        
        // Équipements prioritaires
        equipements_prioritaires: calculateEquipmentPriorities(data)
    };
    
    // Calculer les statistiques globales
    calculateGlobalStats();
    
    // Générer tous les graphiques
    generateAllCharts();
}

// Fonction pour calculer les priorités d'équipements
function calculateEquipmentPriorities(data) {
    const priorities = {};
    
    // Parcourir les 10 colonnes de priorité d'équipements
    for (let i = 1; i <= 10; i++) {
        const columnName = `Quels équipements souhaiterais-tu voir en priorité dans la salle ? (top 10) [${i}${i === 1 ? 'er' : 'e'}]`;
        
        data.forEach(row => {
            const equipment = row[columnName];
            if (equipment && equipment.trim() !== '') {
                // Pondération inversée: 10 points pour le 1er choix, 1 point pour le 10e choix
                const weight = 11 - i;
                priorities[equipment] = (priorities[equipment] || 0) + weight;
            }
        });
    }
    
    return priorities;
}

// Fonction pour calculer les statistiques globales
function calculateGlobalStats() {
    if (!processedData || !rawData) return;
    
    // Nombre total de répondants
    const totalRespondents = rawData.length;
    document.getElementById('total-respondents').textContent = totalRespondents;
    
    // Intérêt moyen pour la salle de sport étudiante
    let totalInterest = 0;
    let interestCount = 0;
    
    Object.entries(processedData.interet_salle_etudiante).forEach(([level, count]) => {
        totalInterest += parseInt(level) * count;
        interestCount += count;
    });
    
    const averageInterest = interestCount > 0 ? (totalInterest / interestCount).toFixed(1) : '-';
    document.getElementById('average-interest').textContent = averageInterest;
    
    // Prix moyen souhaité
    let totalPrice = 0;
    let priceCount = 0;
    
    Object.entries(processedData.prix_raisonnable).forEach(([priceRange, count]) => {
        let avgPrice;
        
        if (priceRange === '<10€') {
            avgPrice = 5;
        } else if (priceRange === '10€ à 14,99€') {
            avgPrice = 12.5;
        } else if (priceRange === '15€ à 19,99€') {
            avgPrice = 17.5;
        } else if (priceRange === '20€ à 24,99€') {
            avgPrice = 22.5;
        } else if (priceRange === '>25€') {
            avgPrice = 30;
        } else {
            return; // Ignorer les valeurs non reconnues
        }
        
        totalPrice += avgPrice * count;
        priceCount += count;
    });
    
    const averagePrice = priceCount > 0 ? (totalPrice / priceCount).toFixed(2) + '€' : '-';
    document.getElementById('average-price').textContent = averagePrice;
    
    // Taux de participation active
    let participationYes = processedData.participation_vie_active['Oui'] || 0;
    const participationRate = totalRespondents > 0 ? Math.round((participationYes / totalRespondents) * 100) + '%' : '-';
    document.getElementById('participation-rate').textContent = participationRate;
}

// Fonction pour générer tous les graphiques
function generateAllCharts() {
    if (!processedData) return;

    // Détruire les graphiques existants
    Object.keys(charts).forEach(key => {
        if (charts[key]) {
            charts[key].destroy();
            delete charts[key]; // Supprimer la référence
        }
    });
    charts = {}; // Réinitialiser l'objet charts

    // --- Graphiques du tableau de bord ---
    charts.interestChart = createBarChart('interestChart',
        'Intérêt pour une salle de sport étudiante participative',
        Object.keys(processedData.interet_salle_etudiante),
        Object.values(processedData.interet_salle_etudiante),
        'rgb(78, 115, 223)'
    );

    charts.priceChart = createBarChart('priceChart',
        'Prix mensuel raisonnable selon les étudiants',
        Object.keys(processedData.prix_raisonnable),
        Object.values(processedData.prix_raisonnable),
        'rgb(28, 200, 138)'
    );

    // --- Graphiques du profil des répondants ---
    charts.genderChart = createPieChart('genderChart',
        'Répartition par sexe',
        Object.keys(processedData.sexe),
        Object.values(processedData.sexe)
    );

    charts.ageChart = createPieChart('ageChart',
        'Répartition par âge',
        Object.keys(processedData.age),
        Object.values(processedData.age)
    );

    charts.educationChart = createPieChart('educationChart',
        'Niveau d\'études',
        Object.keys(processedData.niveau_etude),
        Object.values(processedData.niveau_etude)
    );

    charts.fieldOfStudyChart = createHorizontalBarChart('fieldOfStudyChart',
        'Filières d\'études',
        Object.keys(processedData.filiere),
        Object.values(processedData.filiere),
        'rgb(54, 185, 204)'
    );

    // !! GRAPHIQUE POSANT PROBLÈME POTENTIEL !!
    charts.incomeSourceChart = createHorizontalBarChart('incomeSourceChart',
        'Sources de revenus (% des répondants)',
        Object.keys(processedData.sources_revenu),
        Object.values(processedData.sources_revenu),
        'rgb(246, 194, 62)',
        processedData.sources_revenu_respondents
    );

    // --- Graphiques des pratiques sportives ---
    charts.sportFrequencyChart = createPieChart('sportFrequencyChart',
        'Fréquence de pratique sportive',
        Object.keys(processedData.pratique_sportive),
        Object.values(processedData.pratique_sportive)
    );

    // !! GRAPHIQUE POSANT PROBLÈME POTENTIEL !!
    charts.sportTypesChart = createHorizontalBarChart('sportTypesChart',
        'Types de sports pratiqués (% des répondants)',
        Object.keys(processedData.sports_pratiques),
        Object.values(processedData.sports_pratiques),
        'rgb(78, 115, 223)',
        processedData.sports_pratiques_respondents
    );

    // !! GRAPHIQUE POSANT PROBLÈME POTENTIEL !!
    charts.sportReasonsChart = createHorizontalBarChart('sportReasonsChart',
        'Raisons de la pratique sportive (% des répondants)',
        Object.keys(processedData.raisons_pratique),
        Object.values(processedData.raisons_pratique),
        'rgb(28, 200, 138)',
        processedData.raisons_pratique_respondents
    );

    charts.gymAttendanceChart = createPieChart('gymAttendanceChart',
        'Fréquentation des salles de sport',
        Object.keys(processedData.frequentation_salle),
        Object.values(processedData.frequentation_salle)
    );

    // !! GRAPHIQUE POSANT PROBLÈME POTENTIEL !!
    charts.nonAttendanceReasonsChart = createHorizontalBarChart('nonAttendanceReasonsChart',
        'Raisons de non-fréquentation (% des répondants)',
        Object.keys(processedData.raisons_non_frequentation),
        Object.values(processedData.raisons_non_frequentation),
        'rgb(246, 194, 62)',
        processedData.raisons_non_frequentation_respondents
    );

    charts.gymTypeChart = createPieChart('gymTypeChart',
        'Types de salles fréquentées',
        Object.keys(processedData.type_salle),
        Object.values(processedData.type_salle),
        'rgb(54, 185, 204)'
    );

    charts.currentPriceChart = createBarChart('currentPriceChart',
        'Prix actuellement payé par mois',
        Object.keys(processedData.prix_paye),
        Object.values(processedData.prix_paye),
        'rgb(246, 194, 62)'
    );

    charts.participationTimeChart = createBarChart('participationTimeChart',
        'Temps hebdomadaire que les étudiants seraient prêts à donner',
        Object.keys(processedData.temps_participation),
        Object.values(processedData.temps_participation),
        'rgb(78, 115, 223)'
    );

    // --- Graphiques des préférences ---
    charts.preferredHoursChart = createHorizontalBarChart('preferredHoursChart',
        'Horaires préférés (% des répondants)', // Titre mis à jour
        Object.keys(processedData.horaires_preferes),
        Object.values(processedData.horaires_preferes),
        'rgb(78, 115, 223)',
        processedData.horaires_preferes_respondents // Passer le compte des répondants
    );

    charts.additionalServicesChart = createHorizontalBarChart('additionalServicesChart',
        'Services annexes souhaités (% des répondants)', // Titre mis à jour
        Object.keys(processedData.services_annexes),
        Object.values(processedData.services_annexes),
        'rgb(28, 200, 138)',
        processedData.services_annexes_respondents // Passer le compte des répondants
    );

    charts.supportServicesChart = createHorizontalBarChart('supportServicesChart',
        'Services d\'accompagnement (% des répondants)', // Titre mis à jour
        Object.keys(processedData.services_accompagnement),
        Object.values(processedData.services_accompagnement),
        'rgb(54, 185, 204)',
        processedData.services_accompagnement_respondents // Passer le compte des répondants
    );

    charts.atmosphereChart = createPieChart('atmosphereChart',
        'Ambiance souhaitée',
        Object.keys(processedData.ambiance_souhaitee),
        Object.values(processedData.ambiance_souhaitee)
    );

    // --- Graphique des équipements prioritaires ---
    const sortedEquipment = Object.entries(processedData.equipements_prioritaires)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    charts.equipmentPriorityChart = createHorizontalBarChart('equipmentPriorityChart',
        'Équipements prioritaires (score pondéré)',
        sortedEquipment.map(item => item[0]),
        sortedEquipment.map(item => item[1]),
        'rgb(246, 194, 62)' // Ne pas passer respondentCount ici
    );

    // Vérifier si des graphiques n'ont pas pu être créés
    const chartIds = Object.keys(charts);
    document.querySelectorAll('canvas').forEach(canvas => {
        if (!chartIds.includes(canvas.id) && canvas.id !== 'crossAnalysisChart') { // Exclure l'analyse croisée qui est générée séparément
            console.warn(`Le graphique pour le canvas '${canvas.id}' n'a pas été généré.`);
            // Optionnel: Afficher un message sur le canvas
            const ctx = canvas.getContext('2d');
            if (ctx) {
                 ctx.clearRect(0, 0, canvas.width, canvas.height); // Nettoyer au cas où
                 ctx.font = "14px Arial";
                 ctx.fillStyle = "#ccc";
                 ctx.textAlign = "center";
                 ctx.fillText("Graphique non disponible", canvas.width / 2, canvas.height / 2);
            }
        }
    });
}

// Fonction pour créer un graphique en barres
function createBarChart(canvasId, title, labels, data, backgroundColor) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: backgroundColor || 'rgba(78, 115, 223, 0.8)',
                borderColor: backgroundColor || 'rgba(78, 115, 223, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        // Sera mis à jour lors du basculement
                        callback: function(value) { return value; } 
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                tooltip: {
                    callbacks: {
                        // Sera mis à jour lors du basculement
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    
    // Stocker les données originales et l'état initial
    chart.originalData = data.slice(); // Copie des données
    chart.isPercentage = false;
    
    return chart;
}

// Fonction pour créer un graphique en barres horizontales
function createHorizontalBarChart(canvasId, title, labels, data, backgroundColor, respondentCount = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element with ID '${canvasId}' not found.`);
        return null;
    }
    const ctx = canvas.getContext('2d');

    // Vérifier si les données sont valides
    if (!labels || !data || labels.length === 0 || data.length === 0 || labels.length !== data.length) {
        console.error(`Données invalides ou vides pour le graphique '${canvasId}'. Labels:`, labels, "Data:", data);
        // Afficher un message d'erreur sur le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Nettoyer au cas où
        ctx.font = "14px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("Erreur: Données invalides ou vides", canvas.width / 2, canvas.height / 2);
        return null; // Indiquer l'échec de la création
    }

    // Trier les données par ordre décroissant
    const combined = labels.map((label, i) => ({ label, value: data[i] }));
    combined.sort((a, b) => b.value - a.value);

    const sortedLabels = combined.map(item => item.label);
    const sortedData = combined.map(item => item.value);

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: [{
                label: title,
                data: sortedData,
                backgroundColor: backgroundColor || 'rgba(78, 115, 223, 0.8)',
                borderColor: backgroundColor || 'rgba(78, 115, 223, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                     ticks: {
                        // Sera mis à jour lors du basculement
                        callback: function(value) { return value; } 
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                 tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            let value = context.parsed.x;
                            if (value !== null) {
                                // Le formatage sera géré par toggleChartPercentage
                                label += value;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Stocker les données originales, l'état initial, et si c'est multiple choice
    chart.originalData = sortedData.slice();
    chart.originalLabels = sortedLabels.slice();
    chart.isPercentage = false;
    if (respondentCount !== null && respondentCount > 0) {
        chart.isMultipleChoice = true;
        chart.respondentCount = respondentCount;
    } else {
        chart.isMultipleChoice = false;
        chart.respondentCount = null;
    }

    return chart;
}

// Fonction pour créer un graphique en camembert
function createPieChart(canvasId, title, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Générer des couleurs aléatoires
    const backgroundColors = labels.map(() => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
    });
    
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    position: 'right'
                },
                tooltip: {
                     callbacks: {
                        // Sera mis à jour lors du basculement
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            let value = context.parsed;
                             if (context.chart.isPercentage) {
                                label += value.toFixed(1) + '%';
                            } else {
                                label += value;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Stocker les données originales et l'état initial
    chart.originalData = data.slice(); // Copie des données
    chart.isPercentage = false;

    return chart;
}

// Fonction pour basculer l'affichage d'un graphique en pourcentage
function toggleChartPercentage(chartId) {
    const chart = charts[chartId];
    // Ajouter une vérification pour respondentCount si isMultipleChoice est vrai
    if (!chart || !chart.originalData || (chart.isMultipleChoice && typeof chart.respondentCount !== 'number')) return;

    const button = document.querySelector(`.toggle-percentage[data-chart-id="${chartId}"]`);

    if (chart.isPercentage) {
        // Revenir aux données originales
        chart.data.datasets[0].data = chart.originalData.slice();
        chart.isPercentage = false;
        if (button) button.title = "Afficher en pourcentage";

        // Mettre à jour les options des axes et tooltips pour les valeurs absolues
        // (La logique existante pour les tooltips et ticks est correcte pour afficher la valeur brute)
        if (chart.config.type === 'bar' || chart.config.type === 'horizontalBar') { // Correction: 'bar' au lieu de 'horizontalBar' pour le type
            const axis = chart.config.options.indexAxis === 'y' ? 'x' : 'y';
            chart.config.options.scales[axis].ticks.callback = function(value) { return value; }; // Afficher la valeur brute
            chart.config.options.plugins.tooltip.callbacks.label = function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                const value = chart.config.options.indexAxis === 'y' ? context.parsed.x : context.parsed.y;
                if (value !== null) label += value; // Afficher la valeur brute
                return label;
            };
        } else if (chart.config.type === 'pie') {
             chart.config.options.plugins.tooltip.callbacks.label = function(context) {
                let label = context.label || '';
                if (label) label += ': ';
                let value = context.parsed;
                label += value; // Afficher la valeur brute
                return label;
            };
        }


    } else {
        // Calculer les pourcentages
        let percentageData;
        // Utiliser respondentCount si c'est un graphique à choix multiples
        if (chart.isMultipleChoice && chart.respondentCount > 0) {
            const totalRespondentsForQuestion = chart.respondentCount;
            percentageData = chart.originalData.map(value => (value / totalRespondentsForQuestion) * 100);
        } else {
            // Logique originale pour les graphiques à choix unique ou non basés sur les répondants
            const total = chart.originalData.reduce((sum, value) => sum + value, 0);
            if (total === 0) {
                 percentageData = chart.originalData.map(() => 0); // Gérer la division par zéro
            } else {
                 percentageData = chart.originalData.map(value => (value / total) * 100);
            }
        }

        chart.data.datasets[0].data = percentageData;
        chart.isPercentage = true;
        if (button) button.title = "Afficher en valeurs absolues";

         // Mettre à jour les options des axes et tooltips pour les pourcentages
        if (chart.config.type === 'bar' || chart.config.type === 'horizontalBar') { // Correction: 'bar' au lieu de 'horizontalBar' pour le type
            const axis = chart.config.options.indexAxis === 'y' ? 'x' : 'y';
            // Afficher le pourcentage sur l'axe
            chart.config.options.scales[axis].ticks.callback = function(value) { return value.toFixed(1) + '%'; };
             // Afficher le pourcentage dans le tooltip
             chart.config.options.plugins.tooltip.callbacks.label = function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                const value = chart.config.options.indexAxis === 'y' ? context.parsed.x : context.parsed.y;
                if (value !== null) label += value.toFixed(1) + '%';
                return label;
            };
        } else if (chart.config.type === 'pie') {
             // Afficher le pourcentage dans le tooltip
             chart.config.options.plugins.tooltip.callbacks.label = function(context) {
                let label = context.label || '';
                if (label) label += ': ';
                let value = context.parsed;
                label += value.toFixed(1) + '%';
                return label;
            };
        }
    }

    chart.update();
}

// Fonction pour générer une analyse croisée
function generateCrossAnalysis() {
    if (!processedData) {
        alert('Veuillez d\'abord importer des données.');
        return;
    }
    
    const variable1 = document.getElementById('variable1').value;
    const variable2 = document.getElementById('variable2').value;
    
    if (!variable1 || !variable2) {
        alert('Veuillez sélectionner deux variables pour l\'analyse croisée.');
        return;
    }
    
    if (variable1 === variable2) {
        alert('Veuillez sélectionner deux variables différentes.');
        return;
    }
    
    // Afficher le spinner de chargement
    document.getElementById('loading').style.display = 'flex';
    
    // Créer l'analyse croisée
    setTimeout(() => {
        createCrossAnalysis(variable1, variable2);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('crossAnalysisResult').classList.remove('d-none');
    }, 500);
}

// Fonction pour créer une analyse croisée
function createCrossAnalysis(variable1, variable2) {
    // Détruire le graphique existant s'il existe
    if (charts.crossAnalysisChart) {
        charts.crossAnalysisChart.destroy();
    }
    
    // Obtenir les données pour les variables sélectionnées
    const data1 = processedData[variable1];
    const data2 = processedData[variable2];
    
    if (!data1 || !data2) {
        document.getElementById('crossAnalysisText').innerHTML = '<div class="alert alert-danger">Données non disponibles pour l\'une des variables sélectionnées.</div>';
        return;
    }
    
    // Créer un tableau croisé
    const crossTable = {};
    const labels1 = Object.keys(data1);
    const labels2 = Object.keys(data2);
    
    // Initialiser le tableau croisé
    labels1.forEach(label1 => {
        crossTable[label1] = {};
        labels2.forEach(label2 => {
            crossTable[label1][label2] = 0;
        });
    });
    
    // Remplir le tableau croisé
    rawData.forEach(row => {
        const value1 = row[getColumnNameFromVariable(variable1)];
        const value2 = row[getColumnNameFromVariable(variable2)];
        
        if (value1 && value2 && crossTable[value1] && crossTable[value1][value2] !== undefined) {
            crossTable[value1][value2]++;
        }
    });
    
    // Créer les datasets pour le graphique
    const datasets = labels1.map((label1, index) => {
        const color = getRandomColor(index);
        return {
            label: label1,
            data: labels2.map(label2 => crossTable[label1][label2]),
            backgroundColor: color,
            borderColor: color.replace('0.7', '1'),
            borderWidth: 1
        };
    });
    
    // Créer le graphique
    const ctx = document.getElementById('crossAnalysisChart').getContext('2d');
    charts.crossAnalysisChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels2,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Analyse croisée: ${getVariableLabel(variable1)} vs ${getVariableLabel(variable2)}`
                }
            }
        }
    });
    
    // Générer des insights sur l'analyse croisée
    generateCrossAnalysisInsights(variable1, variable2, crossTable, labels1, labels2);
}

// Fonction pour obtenir le nom de colonne à partir du nom de variable
function getColumnNameFromVariable(variable) {
    const columnMap = {
        'sexe': 'Quel est ton sexe ? ',
        'age': 'Quelle âge as-tu ?',
        'niveau_etude': 'Quel est ton niveau d\'étude ? ',
        'filiere': 'Quelle est ta filière ?',
        'pratique_sportive': 'Pratiques-tu une activité sportive ? ',
        'sports_pratiques': 'Quel(s) sport(s) pratiques-tu ? ',
        'frequentation_salle': 'Fréquentes-tu une salle de sport ?',
        'type_salle': 'Quel type de salle ?',
        'prix_paye': 'Quel prix payes-tu chaque mois ?',
        'interet_salle_etudiante': 'Sur une échelle de 1 à 5, quel est votre intérêt pour une salle de sport étudiante et participative à prix réduit ?',
        'participation_vie_active': 'Serais-tu prêt à donner de ton temps pour participer à la vie active de la salle contre certains avantages ?',
        'temps_participation': 'Si oui, combien de temps par semaine ?',
        'prix_raisonnable': 'Quel prix par mois te paraît raisonnable pour la salle de sport ?',
        'ambiance_souhaitee': 'Quelle ambiance souhaiterais-tu retrouver dans la salle ?'
    };
    
    return columnMap[variable] || '';
}

// Fonction pour obtenir le libellé d'une variable
function getVariableLabel(variable) {
    const labelMap = {
        'sexe': 'Sexe',
        'age': 'Âge',
        'niveau_etude': 'Niveau d\'étude',
        'filiere': 'Filière',
        'pratique_sportive': 'Pratique sportive',
        'sports_pratiques': 'Types de sports pratiqués',
        'frequentation_salle': 'Fréquentation salle de sport',
        'type_salle': 'Type de salle',
        'prix_paye': 'Prix payé actuellement',
        'interet_salle_etudiante': 'Intérêt salle étudiante',
        'participation_vie_active': 'Participation vie active',
        'temps_participation': 'Temps de participation hebdomadaire',
        'prix_raisonnable': 'Prix raisonnable',
        'ambiance_souhaitee': 'Ambiance souhaitée'
    };
    
    return labelMap[variable] || variable;
}

// Fonction pour générer des insights sur l'analyse croisée
function generateCrossAnalysisInsights(variable1, variable2, crossTable, labels1, labels2) {
    let insights = '';
    
    // Trouver les valeurs maximales pour chaque catégorie
    const maxValues = {};
    labels1.forEach(label1 => {
        let maxLabel = '';
        let maxValue = 0;
        
        labels2.forEach(label2 => {
            if (crossTable[label1][label2] > maxValue) {
                maxValue = crossTable[label1][label2];
                maxLabel = label2;
            }
        });
        
        if (maxValue > 0) {
            maxValues[label1] = { label: maxLabel, value: maxValue };
        }
    });
    
    // Générer des insights textuels
    insights += `<p>Cette analyse croisée montre la relation entre <strong>${getVariableLabel(variable1)}</strong> et <strong>${getVariableLabel(variable2)}</strong>.</p>`;
    
    insights += '<p>Points clés :</p><ul>';
    
    Object.entries(maxValues).forEach(([label1, data]) => {
        insights += `<li>Parmi les répondants "${label1}", la réponse la plus fréquente pour ${getVariableLabel(variable2)} est "${data.label}" (${data.value} répondants).</li>`;
    });
    
    insights += '</ul>';
    
    // Ajouter des recommandations basées sur l'analyse
    insights += '<p><strong>Recommandations :</strong></p>';
    
    if (variable1 === 'sexe' && variable2 === 'interet_salle_etudiante') {
        insights += '<p>Considérez d\'adapter votre communication en fonction de l\'intérêt exprimé par chaque sexe pour maximiser l\'engagement.</p>';
    } else if (variable1 === 'age' && variable2 === 'prix_raisonnable') {
        insights += '<p>Envisagez des tarifs différenciés selon les tranches d\'âge pour répondre aux attentes de chaque segment.</p>';
    } else if (variable2 === 'participation_vie_active') {
        insights += '<p>Identifiez les groupes les plus enclins à participer à la vie active de la salle pour cibler vos efforts de recrutement.</p>';
    } else {
        insights += '<p>Utilisez ces données pour adapter votre offre et votre communication en fonction des préférences spécifiques de chaque segment.</p>';
    }
    
    document.getElementById('crossAnalysisText').innerHTML = insights;
}

// Fonction pour générer un rapport
function generateReport() {
    if (!processedData) {
        alert('Veuillez d\'abord importer des données.');
        return;
    }
    
    // Récupérer les paramètres du rapport
    const focus = document.getElementById('reportFocus').value;
    const length = document.getElementById('reportLength').value;
    const style = document.getElementById('reportStyle').value;
    
    // Afficher le spinner de chargement
    document.getElementById('loading').style.display = 'flex';
    
    // Générer le rapport
    setTimeout(() => {
        const report = createReport(focus, length, style);
        document.getElementById('generatedReport').innerHTML = report;
        document.getElementById('loading').style.display = 'none';
    }, 800);
}

// Fonction pour créer un rapport
function createReport(focus, length, style) {
    let report = '';
    
    // Introduction
    if (style === 'academic') {
        report += '<h4>Analyse des données du questionnaire sur la salle de sport étudiante participative</h4>';
    } else if (style === 'business') {
        report += '<h4>Rapport d\'analyse - Projet Uni\'Fit</h4>';
    } else {
        report += '<h4>Ce que nous apprend le questionnaire sur la salle de sport étudiante</h4>';
    }
    
    // Contenu principal selon le focus
    if (focus === 'general') {
        report += generateGeneralReport(length, style);
    } else if (focus === 'profile') {
        report += generateProfileReport(length, style);
    } else if (focus === 'sport') {
        report += generateSportPracticesReport(length, style);
    } else if (focus === 'preferences') {
        report += generatePreferencesReport(length, style);
    } else if (focus === 'pricing') {
        report += generatePricingReport(length, style);
    } else if (focus === 'equipment') {
        report += generateEquipmentReport(length, style);
    }
    
    // Conclusion
    if (length !== 'short') {
        if (style === 'academic') {
            report += '<p>En conclusion, cette analyse fournit des données précieuses pour orienter le développement d\'une salle de sport étudiante participative qui répond aux besoins et attentes de la population cible.</p>';
        } else if (style === 'business') {
            report += '<p>Ces insights permettront d\'optimiser l\'offre Uni\'Fit pour maximiser l\'adhésion et la satisfaction des étudiants, tout en assurant la viabilité économique du projet.</p>';
        } else {
            report += '<p>Pour résumer, on voit bien que les étudiants sont intéressés par une salle de sport qui leur ressemble, avec des prix adaptés et une ambiance conviviale !</p>';
        }
    }
    
    return report;
}

// Fonction pour générer un rapport général
function generateGeneralReport(length, style) {
    let report = '';
    
    // Calculer quelques statistiques clés
    const totalRespondents = rawData.length;
    
    let interestCount = 0;
    let highInterestCount = 0;
    Object.entries(processedData.interet_salle_etudiante).forEach(([level, count]) => {
        interestCount += count;
        if (parseInt(level) >= 4) {
            highInterestCount += count;
        }
    });
    
    const highInterestPercentage = Math.round((highInterestCount / interestCount) * 100);
    
    // Paragraphe 1 - Introduction et intérêt général
    if (style === 'academic') {
        report += `<p>L'étude menée auprès de ${totalRespondents} étudiants révèle un intérêt significatif pour le concept de salle de sport étudiante participative à prix réduit. En effet, ${highInterestPercentage}% des répondants ont exprimé un niveau d'intérêt élevé (4 ou 5 sur une échelle de 5), ce qui suggère un potentiel de marché substantiel pour ce type d'établissement.</p>`;
    } else if (style === 'business') {
        report += `<p>Notre enquête auprès de ${totalRespondents} étudiants démontre un fort potentiel pour le projet Argos, avec ${highInterestPercentage}% des répondants manifestant un intérêt élevé pour notre concept. Cette adhésion initiale constitue une base solide pour le lancement du projet.</p>`;
    } else {
        report += `<p>On a interrogé ${totalRespondents} étudiants et bonne nouvelle : ${highInterestPercentage}% sont vraiment intéressés par notre idée de salle de sport étudiante à prix réduit ! C'est un super début pour notre projet Argos.</p>`;
    }
    
    if (length === 'short') return report;
    
    // Paragraphe 2 - Prix et participation
    let avgPrice = 0;
    let priceCount = 0;
    
    Object.entries(processedData.prix_raisonnable).forEach(([priceRange, count]) => {
        let price;
        if (priceRange === '<10€') price = 5;
        else if (priceRange === '10€ à 14,99€') price = 12.5;
        else if (priceRange === '15€ à 19,99€') price = 17.5;
        else if (priceRange === '20€ à 24,99€') price = 22.5;
        else if (priceRange === '>25€') price = 30;
        else return;
        
        avgPrice += price * count;
        priceCount += count;
    });
    
    const averagePrice = (avgPrice / priceCount).toFixed(2);
    
    const participationYes = processedData.participation_vie_active['Oui'] || 0;
    const participationRate = Math.round((participationYes / totalRespondents) * 100);
    
    if (style === 'academic') {
        report += `<p>L'analyse des données économiques indique que le prix mensuel moyen considéré comme raisonnable par les étudiants est de ${averagePrice}€. Par ailleurs, ${participationRate}% des répondants se déclarent prêts à participer activement à la gestion de la salle, ce qui valide l'approche participative envisagée et pourrait contribuer à la réduction des coûts opérationnels.</p>`;
    } else if (style === 'business') {
        report += `<p>Côté tarification, les étudiants estiment qu'un prix mensuel moyen de ${averagePrice}€ serait acceptable, ce qui nous donne une indication précieuse pour notre politique tarifaire. Le modèle participatif semble également viable, avec ${participationRate}% des répondants prêts à s'impliquer dans la gestion, offrant ainsi un levier pour optimiser nos coûts d'exploitation.</p>`;
    } else {
        report += `<p>Question prix, les étudiants seraient prêts à payer environ ${averagePrice}€ par mois, ce qui reste raisonnable. Et bonne surprise : ${participationRate}% des personnes interrogées sont partantes pour donner un coup de main dans la gestion de la salle ! Ça va nous aider à garder des prix bas.</p>`;
    }
    
    if (length === 'medium') return report;
    
    // Paragraphe 3 - Profil des répondants
    const mainGender = Object.entries(processedData.sexe).sort((a, b) => b[1] - a[1])[0][0];
    const mainGenderPercentage = Math.round((processedData.sexe[mainGender] / totalRespondents) * 100);
    
    const mainAge = Object.entries(processedData.age).sort((a, b) => b[1] - a[1])[0][0];
    const mainAgePercentage = Math.round((processedData.age[mainAge] / totalRespondents) * 100);
    
    if (style === 'academic') {
        report += `<p>Le profil démographique des répondants est majoritairement composé de ${mainGender.toLowerCase()}s (${mainGenderPercentage}%), avec une prédominance de la tranche d'âge ${mainAge.toLowerCase()} (${mainAgePercentage}%). Cette composition reflète la population cible du projet et permet d'adapter l'offre en conséquence.</p>`;
    } else if (style === 'business') {
        report += `<p>Notre cible principale se compose à ${mainGenderPercentage}% de ${mainGender.toLowerCase()}s, principalement âgés de ${mainAge.toLowerCase()} (${mainAgePercentage}%). Cette connaissance précise de notre audience nous permettra d'affiner notre proposition de valeur et notre communication.</p>`;
    } else {
        report += `<p>Qui a répondu à notre questionnaire ? Surtout des ${mainGender.toLowerCase()}s (${mainGenderPercentage}%) et principalement des ${mainAge.toLowerCase()} (${mainAgePercentage}%). C'est important de le savoir pour créer une salle qui leur plaira vraiment !</p>`;
    }
    
    if (length === 'short') return report;
    
    // Paragraphe 4 - Préférences et équipements
    const mainAtmosphere = Object.entries(processedData.ambiance_souhaitee).sort((a, b) => b[1] - a[1])[0][0];
    
    const sortedEquipment = Object.entries(processedData.equipements_prioritaires)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(item => item[0]);
    
    if (style === 'academic') {
        report += `<p>En termes de préférences, l'ambiance "${mainAtmosphere}" est plébiscitée par la majorité des répondants. Concernant les équipements, les priorités identifiées sont : ${sortedEquipment.join(', ')}. Ces données permettront d'orienter les investissements matériels et l'aménagement des espaces de manière optimale.</p>`;
    } else if (style === 'business') {
        report += `<p>L'expérience client sera centrée sur une ambiance "${mainAtmosphere}", conformément aux attentes exprimées. Nos investissements en équipements se concentreront prioritairement sur : ${sortedEquipment.join(', ')}, pour garantir la satisfaction des utilisateurs dès l'ouverture.</p>`;
    } else {
        report += `<p>L'ambiance préférée ? "${mainAtmosphere}" ! Et côté matos, les étudiants veulent surtout : ${sortedEquipment.join(', ')}. On sait maintenant quoi acheter en priorité pour que tout le monde soit content.</p>`;
    }
    
    // Paragraphe 5 - Recommandations (uniquement pour les rapports longs)
    if (length !== 'short') {
        if (style === 'academic') {
            report += `<p>À la lumière de ces résultats, il est recommandé de développer une offre tarifaire autour de ${averagePrice}€ mensuel, avec possibilité de réduction pour les étudiants participant activement à la gestion. L'aménagement devrait privilégier une ambiance "${mainAtmosphere}" et les investissements matériels devraient se concentrer sur les équipements prioritaires identifiés. Une stratégie de communication ciblant principalement les ${mainGender.toLowerCase()}s de ${mainAge.toLowerCase()} serait également pertinente pour maximiser l'impact du lancement.</p>`;
        } else if (style === 'business') {
            report += `<p>Recommandations stratégiques : positionner notre offre tarifaire autour de ${averagePrice}€/mois avec un système d'avantages pour les membres actifs ; créer un environnement "${mainAtmosphere}" distinctif ; investir prioritairement dans les équipements plébiscités ; et déployer une campagne marketing ciblant spécifiquement les ${mainGender.toLowerCase()}s de ${mainAge.toLowerCase()}. Ces actions nous permettront de maximiser notre taux de conversion et d'établir rapidement une base d'adhérents fidèles.</p>`;
        } else {
            report += `<p>Alors, on fait quoi maintenant ? On fixe un prix autour de ${averagePrice}€ par mois, avec des réducs pour ceux qui donnent un coup de main. On crée une ambiance "${mainAtmosphere}" qui donne envie de venir, on achète d'abord les équipements les plus demandés, et on communique surtout auprès des ${mainGender.toLowerCase()}s de ${mainAge.toLowerCase()} qui sont notre public principal. Comme ça, on est sûrs de démarrer sur les chapeaux de roues !</p>`;
        }
    }
    
    return report;
}

// Fonction pour générer un rapport sur le profil des répondants
function generateProfileReport(length, style) {
    let report = '';
    
    // Calculer quelques statistiques
    const totalRespondents = rawData.length;
    
    const genderDistribution = Object.entries(processedData.sexe)
        .map(([gender, count]) => ({ 
            gender, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const ageDistribution = Object.entries(processedData.age)
        .map(([age, count]) => ({ 
            age, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const educationDistribution = Object.entries(processedData.niveau_etude)
        .map(([level, count]) => ({ 
            level, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const fieldDistribution = Object.entries(processedData.filiere)
        .map(([field, count]) => ({ 
            field, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    // Paragraphe 1 - Répartition par sexe et âge
    if (style === 'academic') {
        report += `<p>L'analyse démographique des ${totalRespondents} répondants révèle une répartition par sexe de ${genderDistribution.map(g => `${g.percentage}% de ${g.gender.toLowerCase()}s`).join(' et ')}. La distribution par âge montre une prédominance de la tranche ${ageDistribution[0].age.toLowerCase()} (${ageDistribution[0].percentage}%), suivie par ${ageDistribution.length > 1 ? ageDistribution[1].age.toLowerCase() + ' (' + ageDistribution[1].percentage + '%)' : 'aucune autre tranche significative'}.</p>`;
    } else if (style === 'business') {
        report += `<p>Le profil type de notre clientèle cible se compose à ${genderDistribution[0].percentage}% de ${genderDistribution[0].gender.toLowerCase()}s, principalement dans la tranche d'âge ${ageDistribution[0].age.toLowerCase()} (${ageDistribution[0].percentage}%). Cette connaissance précise de notre audience nous permettra d'affiner notre proposition de valeur et notre communication.</p>`;
    } else {
        report += `<p>Qui sont les personnes intéressées par notre salle de sport ? Surtout des ${genderDistribution[0].gender.toLowerCase()}s (${genderDistribution[0].percentage}%) et principalement des ${ageDistribution[0].age.toLowerCase()} (${ageDistribution[0].percentage}%). C'est notre public principal !</p>`;
    }
    
    if (length === 'short') return report;
    
    // Paragraphe 2 - Niveau d'études et filières
    if (style === 'academic') {
        report += `<p>En termes de niveau d'études, ${educationDistribution[0].percentage}% des répondants sont en ${educationDistribution[0].level}. Les filières les plus représentées sont ${fieldDistribution.map(f => f.field).join(', ')}, ce qui reflète la diversité des parcours académiques au sein de la population étudiante ciblée.</p>`;
    } else if (style === 'business') {
        report += `<p>Notre cible se compose majoritairement d'étudiants en ${educationDistribution[0].level} (${educationDistribution[0].percentage}%), issus principalement des filières ${fieldDistribution.map(f => f.field).join(', ')}. Cette information nous guidera dans le développement de partenariats stratégiques avec les établissements d'enseignement correspondants.</p>`;
    } else {
        report += `<p>Niveau études, on a surtout des étudiants en ${educationDistribution[0].level} (${educationDistribution[0].percentage}%). Les filières les plus représentées ? ${fieldDistribution.map(f => f.field).join(', ')}. Ça nous donne une bonne idée de qui on va retrouver dans notre salle !</p>`;
    }
    
    if (length === 'short') return report;
    
    // Paragraphe 3 - Situation financière
    const hasIncome = processedData.revenu['Oui'] || 0;
    const hasIncomePercentage = Math.round((hasIncome / totalRespondents) * 100);
    
    const incomeSourcesDistribution = Object.entries(processedData.sources_revenu)
        .map(([source, count]) => ({ 
            source, 
            count, 
            percentage: Math.round((count / hasIncome) * 100) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    if (style === 'academic') {
        report += `<p>L'analyse de la situation financière indique que ${hasIncomePercentage}% des répondants disposent d'un revenu. Parmi ceux-ci, les principales sources de revenus sont ${incomeSourcesDistribution.map(s => `${s.source} (${s.percentage}%)`).join(', ')}. Ces données sont essentielles pour évaluer la capacité financière de la population cible et adapter l'offre tarifaire en conséquence.</p>`;
    } else if (style === 'business') {
        report += `<p>Sur le plan financier, ${hasIncomePercentage}% de notre cible dispose d'un revenu, principalement issu de ${incomeSourcesDistribution.map(s => s.source.toLowerCase()).join(', ')}. Cette information est cruciale pour notre politique tarifaire et nos offres promotionnelles, qui devront tenir compte de cette réalité économique.</p>`;
    } else {
        report += `<p>${hasIncomePercentage}% des étudiants interrogés ont un revenu, qui vient surtout de ${incomeSourcesDistribution.map(s => s.source.toLowerCase()).join(', ')}. C'est important de le savoir pour fixer des prix qui leur correspondent vraiment !</p>`;
    }
    
    // Paragraphe 4 - Lieu de résidence et transport
    const residenceDistribution = Object.entries(processedData.residence)
        .map(([residence, count]) => ({ 
            residence, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const transportDistribution = Object.entries(processedData.transport)
        .map(([transport, count]) => ({ 
            transport, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    if (style === 'academic') {
        report += `<p>Concernant le lieu de résidence, ${residenceDistribution[0].percentage}% des répondants vivent en ${residenceDistribution[0].residence.toLowerCase()}. Le mode de transport principal est ${transportDistribution[0].transport} pour ${transportDistribution[0].percentage}% d'entre eux. Ces éléments logistiques sont à prendre en compte dans le choix de l'emplacement de la salle de sport pour maximiser l'accessibilité.</p>`;
    } else if (style === 'business') {
        report += `<p>L'analyse géographique révèle que ${residenceDistribution[0].percentage}% de notre cible réside en ${residenceDistribution[0].residence.toLowerCase()}, avec une préférence pour ${transportDistribution[0].transport} comme moyen de transport (${transportDistribution[0].percentage}%). Ces données orienteront notre stratégie d'implantation pour garantir une accessibilité optimale.</p>`;
    } else {
        report += `<p>Où habitent nos futurs clients ? Surtout en ${residenceDistribution[0].residence.toLowerCase()} (${residenceDistribution[0].percentage}%). Et ils se déplacent principalement en ${transportDistribution[0].transport} (${transportDistribution[0].percentage}%). On devra choisir un emplacement qui tient compte de ça !</p>`;
    }
    
    // Paragraphe 5 - Implications pour le projet
    if (style === 'academic') {
        report += `<p>Ces données démographiques et socio-économiques permettent d'établir un profil précis de la population cible du projet de salle de sport étudiante participative. La prédominance de ${genderDistribution[0].gender.toLowerCase()}s de ${ageDistribution[0].age.toLowerCase()}, principalement en ${educationDistribution[0].level} et issus de filières variées, avec une proportion significative disposant de revenus limités, oriente la conception de l'offre vers un modèle accessible financièrement et adapté aux contraintes et préférences de ce public spécifique.</p>`;
    } else if (style === 'business') {
        report += `<p>En synthèse, le profil de notre clientèle cible nous oriente vers une proposition de valeur centrée sur l'accessibilité financière, avec une communication ciblée vers les ${genderDistribution[0].gender.toLowerCase()}s de ${ageDistribution[0].age.toLowerCase()} en ${educationDistribution[0].level}. Notre stratégie d'implantation devra privilégier la proximité avec les zones de résidence étudiante et l'accessibilité par ${transportDistribution[0].transport}, tandis que notre politique tarifaire devra tenir compte des contraintes budgétaires de cette population.</p>`;
    } else {
        report += `<p>En résumé, notre salle de sport doit être pensée pour des ${genderDistribution[0].gender.toLowerCase()}s jeunes, principalement en ${educationDistribution[0].level}, avec un budget limité. On doit choisir un emplacement accessible facilement en ${transportDistribution[0].transport}, proposer des prix adaptés à leur budget, et créer une ambiance qui leur plaît. Comme ça, on sera sûrs de les attirer !</p>`;
    }
    
    return report;
}

// Fonction pour générer un rapport sur les pratiques sportives
function generateSportPracticesReport(length, style) {
    // Fonctions similaires pour les autres types de rapports
    let report = '';
    
    // Calculer quelques statistiques
    const totalRespondents = rawData.length;
    
    const sportFrequency = Object.entries(processedData.pratique_sportive)
        .map(([frequency, count]) => ({ 
            frequency, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const sportTypes = Object.entries(processedData.sports_pratiques)
        .map(([type, count]) => ({ 
            type, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    const sportReasons = Object.entries(processedData.raisons_pratique)
        .map(([reason, count]) => ({ 
            reason, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    // Paragraphe 1 - Fréquence et types de sports pratiqués
    if (style === 'academic') {
        report += `<p>L'analyse des pratiques sportives des répondants révèle que ${sportFrequency[0].percentage}% d'entre eux ${sportFrequency[0].frequency.toLowerCase()}. Les activités les plus pratiquées sont ${sportTypes.map(t => t.type).join(', ')}, ce qui reflète une préférence marquée pour les sports individuels et de renforcement musculaire.</p>`;
    } else if (style === 'business') {
        report += `<p>Notre étude montre que ${sportFrequency[0].percentage}% de notre cible ${sportFrequency[0].frequency.toLowerCase()}, avec une préférence pour ${sportTypes.map(t => t.type).join(', ')}. Ces données orienteront notre offre d'équipements et de services pour répondre précisément aux besoins identifiés.</p>`;
    } else {
        report += `<p>Que font les étudiants comme sport ? ${sportFrequency[0].percentage}% ${sportFrequency[0].frequency.toLowerCase()}, et ils préfèrent surtout ${sportTypes.map(t => t.type).join(', ')}. C'est super important de le savoir pour équiper notre salle !</p>`;
    }
    
    if (length === 'short') return report;
    
    // Paragraphe 2 - Motivations et pratique en salle
    const gymAttendance = Object.entries(processedData.frequentation_salle)
        .map(([attendance, count]) => ({ 
            attendance, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    if (style === 'academic') {
        report += `<p>Les principales motivations pour la pratique sportive sont ${sportReasons.map(r => r.reason).join(', ')}, ce qui souligne l'importance des bénéfices pour la santé et l'apparence physique. Concernant la fréquentation des salles de sport, ${gymAttendance[0].percentage}% des répondants déclarent ${gymAttendance[0].attendance.toLowerCase()}, ce qui indique un potentiel significatif pour le projet de salle de sport étudiante.</p>`;
    } else if (style === 'business') {
        report += `<p>Les motivations principales de notre cible sont ${sportReasons.map(r => r.reason).join(', ')}. Notre communication devra mettre en avant ces bénéfices pour maximiser l'engagement. Actuellement, ${gymAttendance[0].percentage}% ${gymAttendance[0].attendance.toLowerCase()}, ce qui représente à la fois un défi et une opportunité pour notre projet.</p>`;
    } else {
        report += `<p>Pourquoi font-ils du sport ? Surtout pour ${sportReasons.map(r => r.reason).join(', ')}. Et question salle de sport, ${gymAttendance[0].percentage}% ${gymAttendance[0].attendance.toLowerCase()}. On a donc une vraie opportunité à saisir !</p>`;
    }
    
    if (length === 'medium') return report;
    
    // Paragraphe 3 - Raisons de non-fréquentation
    const nonAttendanceReasons = Object.entries(processedData.raisons_non_frequentation)
        .map(([reason, count]) => ({ 
            reason, 
            count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    if (style === 'academic') {
        report += `<p>Parmi les répondants ne fréquentant pas de salle de sport, les principales raisons invoquées sont ${nonAttendanceReasons.map(r => r.reason).join(', ')}. Ces obstacles identifiés constituent des points d'attention majeurs pour le développement d'une offre adaptée qui pourrait convertir ces non-pratiquants en utilisateurs réguliers.</p>`;
    } else if (style === 'business') {
        report += `<p>L'analyse des freins à la fréquentation des salles de sport révèle que ${nonAttendanceReasons.map(r => r.reason).join(', ')} sont les principaux obstacles. Notre proposition de valeur devra spécifiquement adresser ces points pour convertir les non-utilisateurs et élargir notre base de clients potentiels.</p>`;
    } else {
        report += `<p>Pourquoi certains ne vont pas en salle ? Principalement à cause de ${nonAttendanceReasons.map(r => r.reason).join(', ')}. Si on résout ces problèmes, on pourra attirer beaucoup plus de monde !</p>`;
    }
    
    // Paragraphe 4 - Pratique à domicile
    const homeWorkout = processedData.sport_chez_soi['Oui'] || 0;
    const homeWorkoutPercentage = Math.round((homeWorkout / totalRespondents) * 100);
    
    if (style === 'academic') {
        report += `<p>Il est intéressant de noter que ${homeWorkoutPercentage}% des répondants pratiquent une activité sportive à domicile. Cette tendance, potentiellement accentuée par les récentes périodes de confinement, suggère une familiarité avec la pratique autonome qui pourrait être valorisée dans un modèle participatif où les utilisateurs sont également acteurs de leur expérience sportive.</p>`;
    } else if (style === 'business') {
        report += `<p>La pratique sportive à domicile concerne ${homeWorkoutPercentage}% de notre cible, ce qui indique une certaine autonomie et discipline. Notre modèle participatif pourra capitaliser sur cette caractéristique en proposant des programmes hybrides combinant pratique en salle et à domicile, ainsi qu'en valorisant l'implication active des membres.</p>`;
    } else {
        report += `<p>${homeWorkoutPercentage}% font déjà du sport chez eux, ce qui est plutôt cool ! Ça montre qu'ils sont motivés et autonomes. On pourrait proposer des programmes qui combinent entraînements en salle et à la maison, pour s'adapter à leurs habitudes.</p>`;
    }
    
    // Paragraphe 5 - Implications pour le projet
    if (style === 'academic') {
        report += `<p>En synthèse, l'analyse des pratiques sportives nous permet de conclure qu'il existe un potentiel significatif pour une salle de sport étudiante participative, à condition d'adresser spécifiquement les obstacles identifiés (notamment le coût et l'accessibilité) et de valoriser les motivations principales liées à la santé et à l'apparence physique. L'offre devra être centrée sur les activités de musculation/fitness, tout en proposant une approche inclusive qui permette aux non-pratiquants de s'initier dans un environnement bienveillant. Le modèle participatif pourrait également capitaliser sur l'autonomie déjà démontrée par une proportion significative de répondants pratiquant à domicile.</p>`;
    } else if (style === 'business') {
        report += `<p>Ces données sur les pratiques sportives nous permettent d'affiner notre proposition de valeur : une salle centrée sur la musculation/fitness, avec une tarification accessible pour lever le frein financier, une localisation stratégique pour maximiser l'accessibilité, et un environnement inclusif qui démystifie l'utilisation des équipements. Notre communication mettra en avant les bénéfices pour la santé et l'apparence physique, tandis que notre modèle participatif valorisera l'autonomie et l'engagement des membres, créant ainsi une offre différenciante sur le marché des salles de sport.</p>`;
    } else {
        report += `<p>En résumé, notre salle doit proposer surtout de la musculation et du fitness, avec des prix abordables (c'est le principal frein !), être bien placée, et offrir un environnement où on se sent à l'aise même quand on débute. On doit mettre en avant les bienfaits pour la santé et l'apparence dans notre communication, et valoriser la participation de chacun. Comme ça, on se démarquera vraiment des salles classiques !</p>`;
    }
    
    return report;
}

// Fonction pour générer un rapport sur le profil des répondants
function generateProfileReport(length, style) {
    let report = '';
    
    // Calculer quelques statistiques
    const totalRespondents = rawData.length;
    
    const genderDistribution = Object.entries(processedData.sexe)
        .map(([gender, count]) => ({ 
            gender, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const ageDistribution = Object.entries(processedData.age)
        .map(([age, count]) => ({ 
            age, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const educationDistribution = Object.entries(processedData.niveau_etude)
        .map(([level, count]) => ({ 
            level, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const fieldDistribution = Object.entries(processedData.filiere)
        .map(([field, count]) => ({ 
            field,            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    // Paragraphe 1 - Répartition par sexe et âge
    if (style === 'academic') {
        report += `<p>L'analyse démographique des ${totalRespondents} répondants révèle une répartition par sexe de ${genderDistribution.map(g => `${g.percentage}% de ${g.gender.toLowerCase()}s`).join(' et ')}. La distribution par âge montre une prédominance de la tranche ${ageDistribution[0].age.toLowerCase()} (${ageDistribution[0].percentage}%), suivie par ${ageDistribution.length > 1 ? ageDistribution[1].age.toLowerCase() + ' (' + ageDistribution[1].percentage + '%)' : 'aucune autre tranche significative'}.</p>`;
    } else if (style === 'business') {
        report += `<p>Le profil type de notre clientèle cible se compose à ${genderDistribution[0].percentage}% de ${genderDistribution[0].gender.toLowerCase()}s, principalement dans la tranche d'âge ${ageDistribution[0].age.toLowerCase()} (${ageDistribution[0].percentage}%). Cette connaissance précise de notre audience nous permettra d'affiner notre proposition de valeur et notre communication.</p>`;
    } else {
        report += `<p>Qui sont les personnes intéressées par notre salle de sport ? Surtout des ${genderDistribution[0].gender.toLowerCase()}s (${genderDistribution[0].percentage}%) et principalement des ${ageDistribution[0].age.toLowerCase()} (${ageDistribution[0].percentage}%). C'est notre public principal !</p>`;
    }
    
    if (length === 'short') return report;
    
    // Paragraphe 2 - Niveau d'études et filières
    if (style === 'academic') {
        report += `<p>En termes de niveau d'études, ${educationDistribution[0].percentage}% des répondants sont en ${educationDistribution[0].level}. Les filières les plus représentées sont ${fieldDistribution.map(f => f.field).join(', ')}, ce qui reflète la diversité des parcours académiques au sein de la population étudiante ciblée.</p>`;
    } else if (style === 'business') {
        report += `<p>Notre cible se compose majoritairement d'étudiants en ${educationDistribution[0].level} (${educationDistribution[0].percentage}%), issus principalement des filières ${fieldDistribution.map(f => f.field).join(', ')}. Cette information nous guidera dans le développement de partenariats stratégiques avec les établissements d'enseignement correspondants.</p>`;
    } else {
        report += `<p>Niveau études, on a surtout des étudiants en ${educationDistribution[0].level} (${educationDistribution[0].percentage}%). Les filières les plus représentées ? ${fieldDistribution.map(f => f.field).join(', ')}. Ça nous donne une bonne idée de qui on va retrouver dans notre salle !</p>`;
    }
    
    if (length === 'short') return report;
    
    // Paragraphe 3 - Situation financière
    const hasIncome = processedData.revenu['Oui'] || 0;
    const hasIncomePercentage = Math.round((hasIncome / totalRespondents) * 100);
    
    const incomeSourcesDistribution = Object.entries(processedData.sources_revenu)
        .map(([source, count]) => ({ 
            source, 
            count, 
            percentage: Math.round((count / hasIncome) * 100) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    if (style === 'academic') {
        report += `<p>L'analyse de la situation financière indique que ${hasIncomePercentage}% des répondants disposent d'un revenu. Parmi ceux-ci, les principales sources de revenus sont ${incomeSourcesDistribution.map(s => `${s.source} (${s.percentage}%)`).join(', ')}. Ces données sont essentielles pour évaluer la capacité financière de la population cible et adapter l'offre tarifaire en conséquence.</p>`;
    } else if (style === 'business') {
        report += `<p>Sur le plan financier, ${hasIncomePercentage}% de notre cible dispose d'un revenu, principalement issu de ${incomeSourcesDistribution.map(s => s.source.toLowerCase()).join(', ')}. Cette information est cruciale pour notre politique tarifaire et nos offres promotionnelles, qui devront tenir compte de cette réalité économique.</p>`;
    } else {
        report += `<p>${hasIncomePercentage}% des étudiants interrogés ont un revenu, qui vient surtout de ${incomeSourcesDistribution.map(s => s.source.toLowerCase()).join(', ')}. C'est important de le savoir pour fixer des prix qui leur correspondent vraiment !</p>`;
    }
    
    // Paragraphe 4 - Lieu de résidence et transport
    const residenceDistribution = Object.entries(processedData.residence)
        .map(([residence, count]) => ({ 
            residence, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const transportDistribution = Object.entries(processedData.transport)
        .map(([transport, count]) => ({ 
            transport, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    if (style === 'academic') {
        report += `<p>Concernant le lieu de résidence, ${residenceDistribution[0].percentage}% des répondants vivent en ${residenceDistribution[0].residence.toLowerCase()}. Le mode de transport principal est ${transportDistribution[0].transport} pour ${transportDistribution[0].percentage}% d'entre eux. Ces éléments logistiques sont à prendre en compte dans le choix de l'emplacement de la salle de sport pour maximiser l'accessibilité.</p>`;
    } else if (style === 'business') {
        report += `<p>L'analyse géographique révèle que ${residenceDistribution[0].percentage}% de notre cible réside en ${residenceDistribution[0].residence.toLowerCase()}, avec une préférence pour ${transportDistribution[0].transport} comme moyen de transport (${transportDistribution[0].percentage}%). Ces données orienteront notre stratégie d'implantation pour garantir une accessibilité optimale.</p>`;
    } else {
        report += `<p>Où habitent nos futurs clients ? Surtout en ${residenceDistribution[0].residence.toLowerCase()} (${residenceDistribution[0].percentage}%). Et ils se déplacent principalement en ${transportDistribution[0].transport} (${transportDistribution[0].percentage}%). On devra choisir un emplacement qui tient compte de ça !</p>`;
    }
    
    // Paragraphe 5 - Implications pour le projet
    if (style === 'academic') {
        report += `<p>Ces données démographiques et socio-économiques permettent d'établir un profil précis de la population cible du projet de salle de sport étudiante participative. La prédominance de ${genderDistribution[0].gender.toLowerCase()}s de ${ageDistribution[0].age.toLowerCase()}, principalement en ${educationDistribution[0].level} et issus de filières variées, avec une proportion significative disposant de revenus limités, oriente la conception de l'offre vers un modèle accessible financièrement et adapté aux contraintes et préférences de ce public spécifique.</p>`;
    } else if (style === 'business') {
        report += `<p>En synthèse, le profil de notre clientèle cible nous oriente vers une proposition de valeur centrée sur l'accessibilité financière, avec une communication ciblée vers les ${genderDistribution[0].gender.toLowerCase()}s de ${ageDistribution[0].age.toLowerCase()} en ${educationDistribution[0].level}. Notre stratégie d'implantation devra privilégier la proximité avec les zones de résidence étudiante et l'accessibilité par ${transportDistribution[0].transport}, tandis que notre politique tarifaire devra tenir compte des contraintes budgétaires de cette population.</p>`;
    } else {
        report += `<p>En résumé, notre salle de sport doit être pensée pour des ${genderDistribution[0].gender.toLowerCase()}s jeunes, principalement en ${educationDistribution[0].level}, avec un budget limité. On doit choisir un emplacement accessible facilement en ${transportDistribution[0].transport}, proposer des prix adaptés à leur budget, et créer une ambiance qui leur plaît. Comme ça, on sera sûrs de les attirer !</p>`;
    }
    
    return report;
}

// Fonction pour générer un rapport sur les pratiques sportives
function generateSportPracticesReport(length, style) {
    // Fonctions similaires pour les autres types de rapports
    let report = '';
    
    // Calculer quelques statistiques
    const totalRespondents = rawData.length;
    
    const sportFrequency = Object.entries(processedData.pratique_sportive)
        .map(([frequency, count]) => ({ 
            frequency, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    const sportTypes = Object.entries(processedData.sports_pratiques)
        .map(([type, count]) => ({ 
            type, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    const sportReasons = Object.entries(processedData.raisons_pratique)
        .map(([reason, count]) => ({ 
            reason, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    // Paragraphe 1 - Fréquence et types de sports pratiqués
    if (style === 'academic') {
        report += `<p>L'analyse des pratiques sportives des répondants révèle que ${sportFrequency[0].percentage}% d'entre eux ${sportFrequency[0].frequency.toLowerCase()}. Les activités les plus pratiquées sont ${sportTypes.map(t => t.type).join(', ')}, ce qui reflète une préférence marquée pour les sports individuels et de renforcement musculaire.</p>`;
    } else if (style === 'business') {
        report += `<p>Notre étude montre que ${sportFrequency[0].percentage}% de notre cible ${sportFrequency[0].frequency.toLowerCase()}, avec une préférence pour ${sportTypes.map(t => t.type).join(', ')}. Ces données orienteront notre offre d'équipements et de services pour répondre précisément aux besoins identifiés.</p>`;
    } else {
        report += `<p>Que font les étudiants comme sport ? ${sportFrequency[0].percentage}% ${sportFrequency[0].frequency.toLowerCase()}, et ils préfèrent surtout ${sportTypes.map(t => t.type).join(', ')}. C'est super important de le savoir pour équiper notre salle !</p>`;
    }
    
    if (length === 'short') return report;
    
    // Paragraphe 2 - Motivations et pratique en salle
    const gymAttendance = Object.entries(processedData.frequentation_salle)
        .map(([attendance, count]) => ({ 
            attendance, 
            count, 
            percentage: Math.round((count / totalRespondents) * 100) 
        }))
        .sort((a, b) => b.count - a.count);
    
    if (style === 'academic') {
        report += `<p>Les principales motivations pour la pratique sportive sont ${sportReasons.map(r => r.reason).join(', ')}, ce qui souligne l'importance des bénéfices pour la santé et l'apparence physique. Concernant la fréquentation des salles de sport, ${gymAttendance[0].percentage}% des répondants déclarent ${gymAttendance[0].attendance.toLowerCase()}, ce qui indique un potentiel significatif pour le projet de salle de sport étudiante.</p>`;
    } else if (style === 'business') {
        report += `<p>Les motivations principales de notre cible sont ${sportReasons.map(r => r.reason).join(', ')}. Notre communication devra mettre en avant ces bénéfices pour maximiser l'engagement. Actuellement, ${gymAttendance[0].percentage}% ${gymAttendance[0].attendance.toLowerCase()}, ce qui représente à la fois un défi et une opportunité pour notre projet.</p>`;
    } else {
        report += `<p>Pourquoi font-ils du sport ? Surtout pour ${sportReasons.map(r => r.reason).join(', ')}. Et question salle de sport, ${gymAttendance[0].percentage}% ${gymAttendance[0].attendance.toLowerCase()}. On a donc une vraie opportunité à saisir !</p>`;
    }
    
    if (length === 'medium') return report;
    
    // Paragraphe 3 - Raisons de non-fréquentation
    const nonAttendanceReasons = Object.entries(processedData.raisons_non_frequentation)
        .map(([reason, count]) => ({ 
            reason, 
            count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    
    if (style === 'academic') {
        report += `<p>Parmi les répondants ne fréquentant pas de salle de sport, les principales raisons invoquées sont ${nonAttendanceReasons.map(r => r.reason).join(', ')}. Ces obstacles identifiés constituent des points d'attention majeurs pour le développement d'une offre adaptée qui pourrait convertir ces non-pratiquants en utilisateurs réguliers.</p>`;
    } else if (style === 'business') {
        report += `<p>L'analyse des freins à la fréquentation des salles de sport révèle que ${nonAttendanceReasons.map(r => r.reason).join(', ')} sont les principaux obstacles. Notre proposition de valeur devra spécifiquement adresser ces points pour convertir les non-utilisateurs et élargir notre base de clients potentiels.</p>`;
    } else {
        report += `<p>Pourquoi certains ne vont pas en salle ? Principalement à cause de ${nonAttendanceReasons.map(r => r.reason).join(', ')}. Si on résout ces problèmes, on pourra attirer beaucoup plus de monde !</p>`;
    }
    
    // Paragraphe 4 - Pratique à domicile
    const homeWorkout = processedData.sport_chez_soi['Oui'] || 0;
    const homeWorkoutPercentage = Math.round((homeWorkout / totalRespondents) * 100);
    
    if (style === 'academic') {
        report += `<p>Il est intéressant de noter que ${homeWorkoutPercentage}% des répondants pratiquent une activité sportive à domicile. Cette tendance, potentiellement accentuée par les récentes périodes de confinement, suggère une familiarité avec la pratique autonome qui pourrait être valorisée dans un modèle participatif où les utilisateurs sont également acteurs de leur expérience sportive.</p>`;
    } else if (style === 'business') {
        report += `<p>La pratique sportive à domicile concerne ${homeWorkoutPercentage}% de notre cible, ce qui indique une certaine autonomie et discipline. Notre modèle participatif pourra capitaliser sur cette caractéristique en proposant des programmes hybrides combinant pratique en salle et à domicile, ainsi qu'en valorisant l'implication active des membres.</p>`;
    } else {
        report += `<p>${homeWorkoutPercentage}% font déjà du sport chez eux, ce qui est plutôt cool ! Ça montre qu'ils sont motivés et autonomes. On pourrait proposer des programmes qui combinent entraînements en salle et à la maison, pour s'adapter à leurs habitudes.</p>`;
    }
    
    // Paragraphe 5 - Implications pour le projet
    if (style === 'academic') {
        report += `<p>En synthèse, l'analyse des pratiques sportives nous permet de conclure qu'il existe un potentiel significatif pour une salle de sport étudiante participative, à condition d'adresser spécifiquement les obstacles identifiés (notamment le coût et l'accessibilité) et de valoriser les motivations principales liées à la santé et à l'apparence physique. L'offre devra être centrée sur les activités de musculation/fitness, tout en proposant une approche inclusive qui permette aux non-pratiquants de s'initier dans un environnement bienveillant. Le modèle participatif pourrait également capitaliser sur l'autonomie déjà démontrée par une proportion significative de répondants pratiquant à domicile.</p>`;
    } else if (style === 'business') {
        report += `<p>Ces données sur les pratiques sportives nous permettent d'affiner notre proposition de valeur : une salle centrée sur la musculation/fitness, avec une tarification accessible pour lever le frein financier, une localisation stratégique pour maximiser l'accessibilité, et un environnement inclusif qui démystifie l'utilisation des équipements. Notre communication mettra en avant les bénéfices pour la santé et l'apparence physique, tandis que notre modèle participatif valorisera l'autonomie et l'engagement des membres, créant ainsi une offre différenciante sur le marché des salles de sport.</p>`;
    } else {
        report += `<p>En résumé, notre salle doit proposer surtout de la musculation et du fitness, avec des prix abordables (c'est le principal frein !), être bien placée, et offrir un environnement où on se sent à l'aise même quand on débute. On doit mettre en avant les bienfaits pour la santé et l'apparence dans notre communication, et valoriser la participation de chacun. Comme ça, on se démarquera vraiment des salles classiques !</p>`;
    }
    
    return report;
}

// Fonction pour générer un rapport sur les préférences
function generatePreferencesReport(length, style) {
    // Implémentation similaire aux fonctions précédentes
    return '<p>Rapport sur les préférences à implémenter...</p>';
}

// Fonction pour générer un rapport sur les prix
function generatePricingReport(length, style) {
    // Implémentation similaire aux fonctions précédentes
    return '<p>Rapport sur les prix à implémenter...</p>';
}

// Fonction pour générer un rapport sur les équipements
function generateEquipmentReport(length, style) {
    // Implémentation similaire aux fonctions précédentes
    return '<p>Rapport sur les équipements à implémenter...</p>';
}

// Fonction pour copier le rapport généré
function copyReport() {
    const reportText = document.getElementById('generatedReport').innerText;
    
    // Utiliser l'API Clipboard
    navigator.clipboard.writeText(reportText)
        .then(() => {
            alert('Rapport copié dans le presse-papiers !');
        })
        .catch(err => {
            console.error('Erreur lors de la copie : ', err);
            alert('Impossible de copier le rapport. Veuillez le sélectionner manuellement.');
        });
}

// Fonction pour obtenir une couleur aléatoire
function getRandomColor(index) {
    const predefinedColors = [
        'rgba(78, 115, 223, 0.7)',
        'rgba(28, 200, 138, 0.7)',
        'rgba(54, 185, 204, 0.7)',
        'rgba(246, 194, 62, 0.7)',
        'rgba(231, 74, 59, 0.7)',
        'rgba(90, 92, 105, 0.7)',
        'rgba(133, 135, 150, 0.7)',
        'rgba(105, 70, 180, 0.7)',
        'rgba(0, 123, 255, 0.7)',
        'rgba(40, 167, 69, 0.7)'
    ];
    
    if (index < predefinedColors.length) {
        return predefinedColors[index];
    }
    
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
}
