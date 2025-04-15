// Fonctionnalité de recherche intelligente
document.addEventListener('DOMContentLoaded', function() {
    // Référence à l'élément de recherche
    const searchInput = document.getElementById('smart-search-input');
    const searchButton = document.getElementById('smart-search-button');
    const searchResults = document.getElementById('smart-search-results');
    
    // Base de connaissances pour la recherche intelligente
    const knowledgeBase = {
        // Données démographiques
        demographics: {
            total: data.totalRespondents,
            gender: {
                female: data.gender.data[0],
                male: data.gender.data[1],
                nonBinary: data.gender.data[2],
                notSpecified: data.gender.data[3]
            },
            status: {
                bachelor: data.status.data[0],
                master: data.status.data[1],
                phd: data.status.data[2],
                staff: data.status.data[3]
            },
            age: {
                '18-20': data.age.data[0],
                '21-23': data.age.data[1],
                '24-26': data.age.data[2],
                '27-30': data.age.data[3],
                '31+': data.age.data[4]
            }
        },
        
        // Données d'intérêt
        interest: {
            interested: data.interest.data[0],
            neutral: data.interest.data[1],
            notInterested: data.interest.data[2],
            byStatus: {
                bachelor: {
                    interested: data.interestByStatus.interested[0],
                    neutral: data.interestByStatus.neutral[0],
                    notInterested: data.interestByStatus.notInterested[0]
                },
                master: {
                    interested: data.interestByStatus.interested[1],
                    neutral: data.interestByStatus.neutral[1],
                    notInterested: data.interestByStatus.notInterested[1]
                },
                phd: {
                    interested: data.interestByStatus.interested[2],
                    neutral: data.interestByStatus.neutral[2],
                    notInterested: data.interestByStatus.notInterested[2]
                },
                staff: {
                    interested: data.interestByStatus.interested[3],
                    neutral: data.interestByStatus.neutral[3],
                    notInterested: data.interestByStatus.notInterested[3]
                }
            }
        },
        
        // Données de budget
        budget: {
            average: data.averageBudget,
            byInterest: {
                interested: {
                    min: data.budgetByInterest.min[0],
                    median: data.budgetByInterest.median[0],
                    max: data.budgetByInterest.max[0]
                },
                neutral: {
                    min: data.budgetByInterest.min[1],
                    median: data.budgetByInterest.median[1],
                    max: data.budgetByInterest.max[1]
                },
                notInterested: {
                    min: data.budgetByInterest.min[2],
                    median: data.budgetByInterest.median[2],
                    max: data.budgetByInterest.max[2]
                }
            }
        },
        
        // Données d'activités
        activities: {
            weightlifting: data.activities.data[0],
            cardio: data.activities.data[1],
            groupClasses: data.activities.data[2],
            yogaPilates: data.activities.data[3],
            crossfit: data.activities.data[4],
            boxing: data.activities.data[5],
            dance: data.activities.data[6]
        },
        
        // Données de facteurs importants
        factors: {
            price: data.factors.data[0],
            equipment: data.factors.data[1],
            atmosphere: data.factors.data[2],
            location: data.factors.data[3],
            groupClasses: data.factors.data[4]
        },
        
        // Données de participation
        participation: {
            willing: data.participationWillingness.data[0],
            maybe: data.participationWillingness.data[1],
            notWilling: data.participationWillingness.data[2],
            types: {
                reception: data.participationType.data[0],
                animation: data.participationType.data[1],
                maintenance: data.participationType.data[2],
                administration: data.participationType.data[3],
                groupClasses: data.participationType.data[4]
            }
        }
    };
    
    // Mots-clés pour la recherche intelligente
    const keywords = {
        // Démographie
        'nombre': 'demographics.total',
        'total': 'demographics.total',
        'répondants': 'demographics.total',
        'femmes': 'demographics.gender.female',
        'hommes': 'demographics.gender.male',
        'non-binaire': 'demographics.gender.nonBinary',
        'licence': 'demographics.status.bachelor',
        'master': 'demographics.status.master',
        'doctorat': 'demographics.status.phd',
        'personnel': 'demographics.status.staff',
        'âge': 'demographics.age',
        
        // Intérêt
        'intéressés': 'interest.interested',
        'intéressées': 'interest.interested',
        'neutres': 'interest.neutral',
        'pas intéressés': 'interest.notInterested',
        'non intéressés': 'interest.notInterested',
        
        // Budget
        'budget': 'budget.average',
        'budget moyen': 'budget.average',
        'dépenser': 'budget.average',
        
        // Activités
        'musculation': 'activities.weightlifting',
        'cardio': 'activities.cardio',
        'cours collectifs': 'activities.groupClasses',
        'yoga': 'activities.yogaPilates',
        'pilates': 'activities.yogaPilates',
        'crossfit': 'activities.crossfit',
        'boxe': 'activities.boxing',
        'danse': 'activities.dance',
        
        // Facteurs
        'prix': 'factors.price',
        'équipement': 'factors.equipment',
        'ambiance': 'factors.atmosphere',
        'localisation': 'factors.location',
        
        // Participation
        'participation': 'participation.willing',
        'volontaires': 'participation.willing',
        'peut-être': 'participation.maybe',
        'non volontaires': 'participation.notWilling',
        'accueil': 'participation.types.reception',
        'animation': 'participation.types.animation',
        'entretien': 'participation.types.maintenance',
        'administration': 'participation.types.administration'
    };
    
    // Gestionnaire d'événement pour le bouton de recherche
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    // Gestionnaire d'événement pour la touche Entrée dans le champ de recherche
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Fonction pour effectuer la recherche
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (query.length < 3) {
            searchResults.innerHTML = '<div class="alert alert-warning">Veuillez entrer au moins 3 caractères pour la recherche.</div>';
            return;
        }
        
        // Analyser la requête
        const results = analyzeQuery(query);
        
        // Afficher les résultats
        displayResults(results, query);
    }
    
    // Fonction pour analyser la requête
    function analyzeQuery(query) {
        // Résultats de la recherche
        let results = [];
        
        // Vérifier les correspondances directes avec les mots-clés
        for (const [keyword, path] of Object.entries(keywords)) {
            if (query.includes(keyword)) {
                // Récupérer la valeur à partir du chemin
                const value = getValueFromPath(knowledgeBase, path);
                
                if (value !== undefined) {
                    results.push({
                        keyword: keyword,
                        path: path,
                        value: value
                    });
                }
            }
        }
        
        // Analyser les requêtes spécifiques
        if (query.includes('combien') || query.includes('nombre')) {
            // Requêtes de comptage
            if (results.length === 0) {
                // Si aucun mot-clé spécifique n'a été trouvé, utiliser le nombre total de répondants
                results.push({
                    keyword: 'total',
                    path: 'demographics.total',
                    value: knowledgeBase.demographics.total
                });
            }
        } else if (query.includes('pourcentage') || query.includes('%')) {
            // Requêtes de pourcentage
            for (const result of results) {
                if (typeof result.value === 'number') {
                    result.isPercentage = true;
                    result.percentageOf = knowledgeBase.demographics.total;
                }
            }
        } else if (query.includes('moyenne') || query.includes('moyen')) {
            // Requêtes de moyenne
            if (query.includes('budget') || query.includes('prix') || query.includes('€')) {
                results.push({
                    keyword: 'budget moyen',
                    path: 'budget.average',
                    value: knowledgeBase.budget.average
                });
            }
        }
        
        // Requêtes croisées (par exemple, "femmes intéressées par la musculation")
        if (query.includes('femmes') && query.includes('intéressées')) {
            const femaleCount = knowledgeBase.demographics.gender.female;
            const interestedPercentage = knowledgeBase.interest.interested / knowledgeBase.demographics.total;
            
            results.push({
                keyword: 'femmes intéressées',
                description: 'Estimation du nombre de femmes intéressées',
                value: Math.round(femaleCount * interestedPercentage)
            });
        }
        
        if (query.includes('licence') && query.includes('intéressés')) {
            results.push({
                keyword: 'étudiants en licence intéressés',
                description: 'Nombre d\'étudiants en licence intéressés',
                value: knowledgeBase.interest.byStatus.bachelor.interested
            });
        }
        
        // Si aucun résultat n'a été trouvé, suggérer des requêtes populaires
        if (results.length === 0) {
            results.push({
                isNoResult: true,
                suggestions: [
                    'Combien de répondants sont intéressés par la salle de sport ?',
                    'Quel est le budget moyen des personnes intéressées ?',
                    'Quelle est l\'activité la plus demandée ?',
                    'Combien d\'étudiants en licence sont intéressés ?',
                    'Quel est le facteur le plus important pour les répondants ?'
                ]
            });
        }
        
        return results;
    }
    
    // Fonction pour récupérer une valeur à partir d'un chemin
    function getValueFromPath(obj, path) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }
    
    // Fonction pour afficher les résultats
    function displayResults(results, query) {
        // Vider les résultats précédents
        searchResults.innerHTML = '';
        
        // Créer le conteneur des résultats
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'mt-3';
        
        // Titre des résultats
        const resultsTitle = document.createElement('h5');
        resultsTitle.textContent = 'Résultats de la recherche';
        resultsContainer.appendChild(resultsTitle);
        
        // Afficher la requête
        const queryDisplay = document.createElement('p');
        queryDisplay.className = 'text-muted';
        queryDisplay.textContent = `Requête : "${query}"`;
        resultsContainer.appendChild(queryDisplay);
        
        // Vérifier s'il n'y a pas de résultats
        if (results.length === 1 && results[0].isNoResult) {
            const noResultsAlert = document.createElement('div');
            noResultsAlert.className = 'alert alert-info';
            noResultsAlert.textContent = 'Aucun résultat trouvé pour cette requête.';
            resultsContainer.appendChild(noResultsAlert);
            
            // Afficher les suggestions
            const suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'mt-3';
            
            const suggestionsTitle = document.createElement('h6');
            suggestionsTitle.textContent = 'Suggestions de requêtes :';
            suggestionsContainer.appendChild(suggestionsTitle);
            
            const suggestionsList = document.createElement('ul');
            suggestionsList.className = 'list-group';
            
            for (const suggestion of results[0].suggestions) {
                const suggestionItem = document.createElement('li');
                suggestionItem.className = 'list-group-item list-group-item-action';
                suggestionItem.textContent = suggestion;
                suggestionItem.style.cursor = 'pointer';
                
                // Ajouter un gestionnaire d'événement pour cliquer sur une suggestion
                suggestionItem.addEventListener('click', function() {
                    searchInput.value = suggestion;
                    performSearch();
                });
                
                suggestionsList.appendChild(suggestionItem);
            }
            
            suggestionsContainer.appendChild(suggestionsList);
            resultsContainer.appendChild(suggestionsContainer);
        } else {
            // Afficher les résultats
            const resultsTable = document.createElement('table');
            resultsTable.className = 'table table-striped';
            
            // En-tête du tableau
            const tableHeader = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const headerDescription = document.createElement('th');
            headerDescription.textContent = 'Description';
            headerRow.appendChild(headerDescription);
            
            const headerValue = document.createElement('th');
            headerValue.textContent = 'Valeur';
            headerRow.appendChild(headerValue);
            
            tableHeader.appendChild(headerRow);
            resultsTable.appendChild(tableHeader);
            
            // Corps du tableau
            const tableBody = document.createElement('tbody');
            
            for (const result of results) {
                const row = document.createElement('tr');
                
                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = result.description || formatKeyword(result.keyword);
                row.appendChild(descriptionCell);
                
                const valueCell = document.createElement('td');
                
                if (result.isPercentage) {
                    const percentage = (result.value / result.percentageOf * 100).toFixed(1);
                    valueCell.textContent = `${percentage}% (${result.value} sur ${result.percentageOf})`;
                } else if (typeof result.value === 'number') {
                    valueCell.textContent = result.value;
                } else {
                    valueCell.textContent = result.value || 'N/A';
                }
                
                row.appendChild(valueCell);
                tableBody.appendChild(row);
            }
            
            resultsTable.appendChild(tableBody);
            resultsContainer.appendChild(resultsTable);
            
            // Ajouter un bouton pour générer un graphique
            if (results.length > 0 && !results[0].isNoResult) {
                const generateChartButton = document.createElement('button');
                generateChartButton.className = 'btn btn-primary mt-3';
                generateChartButton.textContent = 'Générer un graphique';
                generateChartButton.addEventListener('click', function() {
                    generateChartFromResults(results, query);
                });
                
                resultsContainer.appendChild(generateChartButton);
            }
        }
        
        // Ajouter les résultats au conteneur
        searchResults.appendChild(resultsContainer);
        
        // Animation pour attirer l'attention
        searchResults.style.opacity = '0';
        searchResults.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            searchResults.style.opacity = '1';
        }, 100);
    }
    
    // Fonction pour formater un mot-clé en description lisible
    function formatKeyword(keyword) {
        // Première lettre en majuscule
        let formatted = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        
        // Ajouter des descriptions spécifiques
        switch (keyword) {
            case 'total':
            case 'nombre':
            case 'répondants':
                return 'Nombre total de répondants';
            case 'femmes':
                return 'Nombre de femmes';
            case 'hommes':
                return 'Nombre d\'hommes';
            case 'licence':
                return 'Nombre d\'étudiants en licence';
            case 'master':
                return 'Nombre d\'étudiants en master';
            case 'doctorat':
                return 'Nombre de doctorants';
            case 'personnel':
                return 'Nombre de membres du personnel';
            case 'intéressés':
            case 'intéressées':
                return 'Nombre de personnes intéressées';
            case 'budget':
            case 'budget moyen':
                return 'Budget moyen';
            case 'musculation':
                return 'Nombre de personnes intéressées par la musculation';
            case 'cardio':
                return 'Nombre de personnes intéressées par le cardio';
            default:
                return formatted;
        }
    }
    
    // Fonction pour générer un graphique à partir des résultats
    function generateChartFromResults(results, query) {
        // Créer un conteneur pour le graphique
        const chartContainer = document.createElement('div');
        chartContainer.className = 'mt-4';
        chartContainer.style.height = '400px';
        
        // Créer un canvas pour le graphique
        const canvas = document.createElement('canvas');
        canvas.id = 'search-results-chart';
        chartContainer.appendChild(canvas);
        
        // Ajouter le conteneur au conteneur de résultats
        searchResults.appendChild(chartContainer);
        
        // Déterminer le type de graphique approprié
        let chartType = 'bar';
        let chartTitle = 'Résultats de la recherche : ' + query;
        
        // Préparer les données pour le graphique
        const labels = results.map(result => result.description || formatKeyword(result.keyword));
        const values = results.map(result => {
            if (result.isPercentage) {
                return (result.value / result.percentageOf * 100).toFixed(1);
            } else {
                return result.value;
            }
        });
        
        // Si un seul résultat, utiliser un graphique en donut
        if (results.length === 1) {
            chartType = 'doughnut';
            
            // Pour un graphique en donut, nous avons besoin de deux valeurs
            if (results[0].isPercentage) {
                labels.push('Autres');
                const percentage = (results[0].value / results[0].percentageOf * 100).toFixed(1);
                values[0] = parseFloat(percentage);
                values.push(100 - values[0]);
            } else if (typeof results[0].value === 'number') {
                // Si c'est un nombre sur un total, créer un graphique en donut
                if (results[0].path && results[0].path.includes('demographics')) {
                    labels.push('Autres');
                    values.push(knowledgeBase.demographics.total - results[0].value);
                }
            }
        }
        
        // Créer le graphique
        new Chart(canvas.getContext('2d'), {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valeur',
                    data: values,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: chartTitle
                    },
                    legend: {
                        position: 'right'
                    }
                },
                scales: chartType === 'bar' ? {
                    y: {
                        beginAtZero: true
                    }
                } : {}
            }
        });
        
        // Faire défiler jusqu'au graphique
        chartContainer.scrollIntoView({ behavior: 'smooth' });
    }
});
