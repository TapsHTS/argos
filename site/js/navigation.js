// Gestion de la navigation entre les onglets
document.addEventListener('DOMContentLoaded', function() {
    // Références aux onglets et contenus
    const tabDashboard = document.getElementById('tab-dashboard');
    const tabVisualizations = document.getElementById('tab-visualizations');
    const tabSegments = document.getElementById('tab-segments');
    const tabPhrases = document.getElementById('tab-phrases');
    
    const contentDashboard = document.getElementById('dashboard');
    const contentVisualizations = document.getElementById('visualisations');
    const contentSegments = document.getElementById('segments');
    const contentPhrases = document.getElementById('phrases');
    
    // Fonction pour activer un onglet et afficher son contenu
    function activateTab(tab, content) {
        // Désactiver tous les onglets
        [tabDashboard, tabVisualizations, tabSegments, tabPhrases].forEach(t => {
            t.classList.remove('active');
        });
        
        // Masquer tous les contenus
        [contentDashboard, contentVisualizations, contentSegments, contentPhrases].forEach(c => {
            c.classList.add('d-none');
        });
        
        // Activer l'onglet et afficher le contenu sélectionnés
        tab.classList.add('active');
        content.classList.remove('d-none');
    }
    
    // Gestionnaires d'événements pour les onglets principaux
    tabDashboard.addEventListener('click', function(e) {
        e.preventDefault();
        activateTab(tabDashboard, contentDashboard);
        window.location.hash = 'dashboard';
    });
    
    tabVisualizations.addEventListener('click', function(e) {
        e.preventDefault();
        activateTab(tabVisualizations, contentVisualizations);
        window.location.hash = 'visualisations';
    });
    
    tabSegments.addEventListener('click', function(e) {
        e.preventDefault();
        activateTab(tabSegments, contentSegments);
        window.location.hash = 'segments';
    });
    
    tabPhrases.addEventListener('click', function(e) {
        e.preventDefault();
        activateTab(tabPhrases, contentPhrases);
        window.location.hash = 'phrases';
    });
    
    // Gestion des onglets de visualisations
    const vizTabs = document.querySelectorAll('#viz-tabs .nav-link');
    const vizContents = document.querySelectorAll('.tab-pane');
    
    vizTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Désactiver tous les onglets
            vizTabs.forEach(t => t.classList.remove('active'));
            
            // Masquer tous les contenus
            vizContents.forEach(c => {
                c.classList.remove('show', 'active');
            });
            
            // Activer l'onglet cliqué
            this.classList.add('active');
            
            // Afficher le contenu correspondant
            const target = this.getAttribute('href');
            document.querySelector(target).classList.add('show', 'active');
        });
    });
    
    // Navigation basée sur le hash de l'URL
    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        
        switch(hash) {
            case 'dashboard':
                activateTab(tabDashboard, contentDashboard);
                break;
            case 'visualisations':
                activateTab(tabVisualizations, contentVisualizations);
                break;
            case 'segments':
                activateTab(tabSegments, contentSegments);
                break;
            case 'phrases':
                activateTab(tabPhrases, contentPhrases);
                break;
            default:
                // Par défaut, afficher le tableau de bord
                activateTab(tabDashboard, contentDashboard);
        }
    }
    
    // Gérer le hash initial
    handleHashChange();
    
    // Écouter les changements de hash
    window.addEventListener('hashchange', handleHashChange);
    
    // Animation des cartes de segment au survol
    const segmentCards = document.querySelectorAll('.segment-card');
    segmentCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Gestion du sélecteur de segment
    const segmentSelector = document.getElementById('segment-selector');
    const analyzeSegmentBtn = document.getElementById('analyze-segment');
    
    analyzeSegmentBtn.addEventListener('click', function() {
        const selectedSegment = segmentSelector.value;
        
        // Masquer toutes les cartes de segment
        segmentCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Afficher uniquement la carte du segment sélectionné
        let targetCard;
        
        switch(selectedSegment) {
            case 'sportifs-interesses':
                targetCard = document.querySelector('.segment-sportifs');
                break;
            case 'occasionnels-interesses':
                targetCard = document.querySelector('.segment-occasionnels');
                break;
            case 'debutants-interesses':
                targetCard = document.querySelector('.segment-debutants');
                break;
            case 'sportifs-non-interesses':
                targetCard = document.querySelector('.segment-non-interesses');
                break;
        }
        
        if (targetCard) {
            targetCard.style.display = 'block';
            
            // Animation pour attirer l'attention
            targetCard.style.transform = 'scale(1.05)';
            setTimeout(() => {
                targetCard.style.transform = '';
            }, 500);
        }
    });
});
