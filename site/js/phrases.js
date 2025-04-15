// Données pour les exemples de phrases
const phrasesData = {
    // Profil des répondants
    profile: {
        synthetic: `Notre enquête a recueilli les réponses de 124 étudiants et membres du personnel universitaire. L'âge moyen des répondants est de 22,7 ans.`,
        
        standard: `Notre enquête a recueilli les réponses de 124 étudiants et membres du personnel universitaire, avec une répartition variée en termes de statut académique et de genre.
        
L'âge moyen des répondants est de 22,7 ans, avec une majorité de répondants âgés de 18 à 28 ans.

Concernant la pratique sportive actuelle, 42,7% des répondants pratiquent régulièrement (2-3 fois par semaine), tandis que 18,5% ne pratiquent jamais de sport.`,
        
        detailed: `Notre enquête a recueilli les réponses de 124 étudiants et membres du personnel universitaire, avec la répartition suivante : 65 étudiants en licence (52,4%), 38 étudiants en master (30,6%), 12 doctorants (9,7%) et 9 membres du personnel (7,3%). Cette diversité nous permet d'avoir une vision représentative des besoins de la communauté universitaire.

L'âge moyen des répondants est de 22,7 ans (écart-type de 3,8 ans), avec une majorité de répondants âgés de 18 à 28 ans. Cette tranche d'âge correspond bien à notre public cible pour la salle de sport étudiante.

Concernant la pratique sportive actuelle, nous observons que 42,7% des répondants pratiquent régulièrement (2-3 fois par semaine), tandis que 18,5% ne pratiquent jamais de sport. Ces données nous permettent d'adapter notre offre à différents niveaux de pratique sportive, en proposant des programmes adaptés tant aux sportifs réguliers qu'aux débutants souhaitant s'initier à une activité physique.`
    },
    
    // Intérêt pour la salle de sport
    interest: {
        synthetic: `68,5% des répondants se déclarent intéressés par une salle de sport étudiante participative à prix réduit.`,
        
        standard: `68,5% des répondants se déclarent intéressés par une salle de sport étudiante participative à prix réduit, ce qui représente un potentiel de 85 utilisateurs.

L'intérêt est particulièrement marqué chez les étudiants en licence, dont 75,3% se disent intéressés.`,
        
        detailed: `Notre enquête révèle un intérêt significatif pour le projet de salle de sport étudiante participative à prix réduit, avec 68,5% des répondants qui se déclarent intéressés. Ce pourcentage représente un potentiel de 85 utilisateurs réguliers, ce qui confirme la viabilité du projet.

L'analyse par statut montre que l'intérêt est particulièrement marqué chez les étudiants en licence, dont 75,3% se disent intéressés. À l'inverse, les membres du personnel montrent un intérêt plus modéré avec 44,4% d'intéressés.

Il est également intéressant de noter que parmi les personnes qui pratiquent déjà du sport régulièrement, 71,2% sont intéressées par notre projet, ce qui suggère que notre offre pourrait attirer des sportifs déjà actifs qui cherchent une alternative plus économique et participative. Plus surprenant encore, 56,5% des personnes qui ne pratiquent jamais de sport se disent intéressées, ce qui indique que notre concept pourrait motiver des personnes actuellement sédentaires à commencer une activité physique.`
    },
    
    // Budget et tarification
    budget: {
        synthetic: `Le budget moyen que les personnes intéressées sont prêtes à consacrer est de 22,75€ par mois.`,
        
        standard: `Le budget moyen que les personnes intéressées sont prêtes à consacrer est de 22,75€ par mois, avec une majorité optant pour la tranche 20-30€.

Ce budget varie selon le statut, les doctorants étant prêts à dépenser en moyenne 28,40€ par mois, tandis que les étudiants en licence ont un budget moyen plus limité de 18,90€.`,
        
        detailed: `Notre analyse des données budgétaires révèle que les personnes intéressées par le projet sont prêtes à consacrer en moyenne 22,75€ par mois à leur abonnement, avec une majorité (42,3%) optant pour la tranche 20-30€.

Cette donnée est cruciale pour établir une tarification adaptée qui reste accessible tout en assurant la viabilité financière du projet. Il est intéressant de noter que ce budget varie significativement selon le statut des répondants : les doctorants sont prêts à dépenser en moyenne 28,40€ par mois, tandis que les étudiants en licence ont un budget moyen plus limité de 18,90€.

Ces différences justifient la mise en place d'une tarification modulée selon le statut, avec des tarifs préférentiels pour les étudiants en licence et master. De plus, le modèle participatif pourrait permettre de réduire les coûts d'abonnement pour ceux qui s'impliquent dans la gestion de la salle, rendant l'offre encore plus attractive pour les budgets les plus serrés.

Notre analyse montre également une corrélation entre le niveau d'intérêt et le budget : les personnes très intéressées sont prêtes à consacrer en moyenne 24,30€ par mois, contre 19,80€ pour celles qui se déclarent simplement intéressées, ce qui suggère qu'une offre de qualité pourrait justifier un tarif légèrement supérieur pour certains segments.`
    },
    
    // Activités souhaitées
    activities: {
        synthetic: `Les activités les plus demandées sont la musculation, le cardio et les cours collectifs.`,
        
        standard: `Les activités les plus demandées sont la musculation, le cardio et les cours collectifs, avec respectivement 85, 72 et 58 mentions.

Les préférences varient selon les segments, avec des différences notables entre sportifs réguliers et débutants.`,
        
        detailed: `Notre analyse des préférences d'activités révèle que les plus demandées sont la musculation, le cardio et les cours collectifs, avec respectivement 85 mentions (68,5% des répondants), 72 mentions (58,1% des répondants) et 58 mentions (46,8% des répondants).

Ces préférences varient significativement selon les segments de notre population. Les sportifs réguliers privilégient la musculation (82,3%) et le CrossFit (54,5%), tandis que les débutants montrent une préférence marquée pour les cours collectifs (73,9%) et le yoga/pilates (60,9%).

Ces données nous permettent d'envisager une répartition optimale des espaces et des équipements dans notre future salle de sport. Nous recommandons de consacrer environ 35% de l'espace aux activités de musculation, 25% au cardio et 20% aux cours collectifs. Cette répartition pourra être ajustée en fonction de l'évolution des besoins et des retours des utilisateurs.

Il est également intéressant de noter que 72,6% des répondants préfèrent s'entraîner en soirée (18h-22h), ce qui nous incite à prévoir une amplitude horaire étendue et potentiellement des créneaux spécifiques pour certaines activités très demandées pendant ces heures de forte affluence.`
    },
    
    // Facteurs importants
    factors: {
        synthetic: `Les facteurs les plus importants pour les personnes intéressées sont le prix et l'équipement.`,
        
        standard: `Les facteurs les plus importants pour les personnes intéressées sont le prix et l'équipement, avec des scores moyens de 4,6/5 et 4,3/5.

Ces priorités varient selon les segments, avec des différences notables entre sportifs réguliers et débutants.`,
        
        detailed: `Notre analyse des facteurs d'importance révèle que les personnes intéressées par le projet accordent une priorité particulière au prix et à l'équipement, avec des scores moyens respectifs de 4,6/5 et 4,3/5 sur une échelle de 1 à 5.

Ces priorités varient significativement selon les segments. Les sportifs réguliers accordent une importance primordiale à la qualité de l'équipement (4,7/5) et à l'ambiance (4,2/5), tandis que les débutants privilégient l'ambiance (4,9/5) et le prix (4,7/5).

Ces données sont essentielles pour orienter notre stratégie de développement. Elles suggèrent que nous devrions mettre l'accent sur une politique tarifaire attractive et une sélection d'équipements de qualité, tout en veillant à créer une ambiance accueillante. La localisation, bien que légèrement moins prioritaire (3,9/5 en moyenne), reste un facteur important à considérer, avec une préférence marquée pour une proximité avec les lieux d'études et de résidence des étudiants.

De plus, nous constatons que l'importance accordée à l'ambiance (4,1/5 en moyenne) souligne la nécessité de créer un environnement convivial et inclusif, particulièrement important pour fidéliser les débutants et les pratiquants occasionnels. Cette dimension communautaire pourrait être renforcée par le modèle participatif que nous proposons.`
    },
    
    // Participation à la gestion
    participation: {
        synthetic: `28,2% des répondants sont prêts à participer à la gestion de la salle de sport.`,
        
        standard: `28,2% des répondants sont prêts à participer à la gestion de la salle de sport, et 33,9% supplémentaires pourraient l'envisager.

Les types de participation les plus populaires incluent l'animation, l'accueil et les cours collectifs.`,
        
        detailed: `L'aspect participatif de notre projet suscite un intérêt notable, avec 28,2% des répondants qui se déclarent prêts à s'impliquer dans la gestion de la salle de sport, et 33,9% supplémentaires qui pourraient l'envisager sous certaines conditions.

Parmi les personnes intéressées par le projet, la proportion de volontaires monte à 41,2%, ce qui représente un vivier significatif pour assurer le fonctionnement participatif de la structure. Cette volonté d'implication est particulièrement marquée chez les étudiants en master (47,8% des intéressés) et les doctorants (57,1% des intéressés).

Les types de participation les plus populaires sont l'animation (28,2% des répondants), les cours collectifs (24,2%) et l'accueil (22,6%). Cette diversité d'intérêts nous permettra de couvrir les différents besoins de gestion de la salle, de l'accueil à l'animation en passant par l'entretien et l'administration.

Notre analyse révèle également une corrélation positive entre la volonté de participation et le niveau d'intérêt pour le projet : 60,3% des personnes très intéressées sont prêtes à s'impliquer, contre seulement 22,1% des personnes simplement intéressées. Cela suggère qu'un noyau dur de membres très motivés pourrait constituer la base de notre modèle participatif.

Un système de réduction tarifaire proportionnelle à l'implication pourrait être mis en place pour encourager et valoriser cette participation, avec par exemple une réduction de 5€ par mois pour une heure de participation hebdomadaire, permettant aux plus impliqués de bénéficier d'un tarif très avantageux tout en contribuant au fonctionnement de la structure.`
    },
    
    // Recommandations générales
    recommendations: {
        synthetic: `Nous recommandons de développer une salle de sport étudiante participative avec un tarif mensuel autour de 22,75€, proposant principalement musculation et cardio.`,
        
        standard: `Nous recommandons de développer une salle de sport étudiante participative avec un tarif mensuel autour de 22,75€, proposant principalement musculation et cardio.

La salle devrait être située à proximité des lieux d'études et proposer des horaires flexibles, avec une attention particulière portée au prix et à la qualité des équipements.

Un système de participation à la gestion permettrait de réduire les coûts et d'impliquer les 35 personnes intéressées par cette démarche.`,
        
        detailed: `Sur la base de notre analyse approfondie des données du questionnaire, nous recommandons le développement d'une salle de sport étudiante participative avec les caractéristiques suivantes :

1. Tarification : Un abonnement mensuel de base à 22,75€, avec des réductions pour les étudiants en licence et pour ceux qui participent à la gestion. Cette tarification répond aux attentes budgétaires de notre public cible tout en assurant la viabilité financière du projet.

2. Activités : Un espace principalement dédié à la musculation, au cardio et aux cours collectifs, avec une répartition proportionnelle à la demande. Des créneaux spécifiques pourraient être réservés pour les débutants afin de favoriser leur intégration.

3. Localisation : La salle devrait être située à proximité des campus et des résidences universitaires, l'accessibilité étant un facteur déterminant pour 68,5% des répondants intéressés.

4. Horaires : Une amplitude horaire large avec des ouvertures tôt le matin et en soirée pour accommoder les 15 adeptes du matin et les 72 préférant s'entraîner en soirée.

5. Modèle participatif : Mise en place d'un système où les membres peuvent réduire leur cotisation en participant à la gestion (accueil, animation, entretien, administration). Ce modèle permettrait d'impliquer les 35 personnes déjà volontaires et potentiellement une partie des 42 indécis.

6. Ambiance : Créer un environnement inclusif et convivial, particulièrement important pour les débutants et les pratiquants occasionnels qui représentent 37% de nos répondants intéressés.

7. Équipement : Investir dans des équipements de qualité pour la musculation et le cardio, tout en maintenant un budget raisonnable grâce au modèle participatif qui permet de réduire les coûts de personnel.

8. Programmes spécifiques : Développer des programmes adaptés aux différents segments identifiés, avec par exemple des séances d'initiation pour les débutants, des créneaux réservés aux sportifs confirmés, et des formules flexibles pour les pratiquants occasionnels.

La mise en œuvre de ces recommandations permettrait de créer une salle de sport qui répond précisément aux attentes de notre public cible, avec un potentiel de 85 utilisateurs réguliers. Le modèle participatif constitue un élément différenciant fort qui pourrait attirer même des personnes actuellement inscrites dans d'autres salles de sport, tout en créant une communauté étudiante engagée autour de ce projet.`
    }
};

// Fonction pour générer des phrases selon la thématique et le niveau de détail
function generatePhrases() {
    const theme = document.getElementById('phrase-theme').value;
    const detailLevel = parseInt(document.getElementById('phrase-detail').value);
    const generatedPhrasesContainer = document.getElementById('generated-phrases');
    
    let content = '';
    let detailType = '';
    
    // Déterminer le niveau de détail
    switch(detailLevel) {
        case 1:
            detailType = 'synthetic';
            break;
        case 2:
            detailType = 'standard';
            break;
        case 3:
            detailType = 'detailed';
            break;
        default:
            detailType = 'standard';
    }
    
    // Récupérer les phrases correspondantes
    const phrases = phrasesData[theme][detailType];
    
    // Déterminer le titre de la thématique
    let themeTitle = '';
    switch(theme) {
        case 'profile':
            themeTitle = 'Profil des répondants';
            break;
        case 'interest':
            themeTitle = 'Intérêt pour la salle de sport';
            break;
        case 'budget':
            themeTitle = 'Budget et tarification';
            break;
        case 'activities':
            themeTitle = 'Activités souhaitées';
            break;
        case 'factors':
            themeTitle = 'Facteurs importants';
            break;
        case 'participation':
            themeTitle = 'Participation à la gestion';
            break;
        case 'recommendations':
            themeTitle = 'Recommandations générales';
            break;
    }
    
    // Déterminer le niveau de détail en texte
    let detailText = '';
    switch(detailLevel) {
        case 1:
            detailText = 'synthétique';
            break;
        case 2:
            detailText = 'standard';
            break;
        case 3:
            detailText = 'détaillé';
            break;
    }
    
    // Créer le contenu HTML
    content = `
        <div class="phrase-example">
            <h6>${themeTitle} (niveau ${detailText})</h6>
            <div>${phrases.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
        </div>
    `;
    
    // Mettre à jour le conteneur
    generatedPhrasesContainer.innerHTML = content;
    
    // Animation pour attirer l'attention
    generatedPhrasesContainer.style.opacity = '0';
    generatedPhrasesContainer.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        generatedPhrasesContainer.style.opacity = '1';
    }, 100);
}

// Initialiser le générateur de phrases
document.addEventListener('DOMContentLoaded', function() {
    const generateButton = document.getElementById('generate-phrases');
    if (generateButton) {
        generateButton.addEventListener('click', generatePhrases);
    }
    
    // Afficher un exemple par défaut
    setTimeout(() => {
        if (document.getElementById('generated-phrases')) {
            generatePhrases();
        }
    }, 500);
});
