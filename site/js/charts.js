// Fichier charts.js simplifié
// Variables globales pour les graphiques
let interestChart;
let activitiesChart;

// Fonction pour initialiser tous les graphiques
function initCharts() {
    initBasicCharts();
}

// Fonction pour initialiser les graphiques de base
function initBasicCharts() {
    // Graphique d'intérêt
    const interestCtx = document.getElementById('interest-chart');
    if (interestCtx && data.interest && data.interest.data && data.interest.data.length > 0) {
        interestChart = new Chart(interestCtx, {
            type: 'pie',
            data: {
                labels: data.interest.labels,
                datasets: [{
                    data: data.interest.data,
                    backgroundColor: data.interest.colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${percentage}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Graphique des activités
    const activitiesCtx = document.getElementById('activities-chart');
    if (activitiesCtx && data.activities && data.activities.labels && data.activities.data && data.activities.data.length > 0) {
        activitiesChart = new Chart(activitiesCtx, {
            type: 'bar',
            data: {
                labels: data.activities.labels,
                datasets: [{
                    label: 'Nombre de pratiquants',
                    data: data.activities.data,
                    backgroundColor: data.activities.colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
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
        const uploadInfo = document.getElementById('upload-info');
        if (uploadInfo) {
            uploadInfo.innerHTML += `<div class="alert alert-warning mt-2">Erreur lors de la mise à jour des visualisations: ${error.message}</div>`;
        }
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
    
    // Mettre à jour les données pour les graphiques d'activités
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
}

// Fonction pour détruire tous les graphiques
function destroyAllCharts() {
    if (typeof Chart !== 'undefined') {
        Chart.helpers.each(Chart.instances, function(instance) {
            instance.destroy();
        });
    }
}

// Initialiser les graphiques au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les graphiques si des données sont disponibles
    initCharts();
    
    // Ajouter un bouton de débogage
    const debugBtn = document.createElement('button');
    debugBtn.className = 'btn btn-sm btn-outline-secondary position-fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.textContent = 'Déboguer graphiques';
    debugBtn.onclick = function() {
        console.log('Données disponibles:', data);
        showNotification('Information', 'Regardez la console pour les détails des données');
    };
    document.body.appendChild(debugBtn);
});
