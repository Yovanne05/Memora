"""Contenu des notes de Sophie (Phytothérapie)."""

from .helpers import _text, _paragraph, _heading, _bullet_list, _ordered_list, _code_block, _doc

SOPHIE_NOTES_CONTENT = {
    "Phytothérapie - Introduction": _doc(
        _heading(1, "Introduction à la Phytothérapie"),
        _paragraph(_text("La phytothérapie est l'art de soigner par les plantes. Cette discipline ancestrale utilise les propriétés médicinales des végétaux pour prévenir et traiter diverses affections.")),
        _heading(2, "Principes fondamentaux"),
        _bullet_list(
            [_text("Totum", bold=True), _text(" : L'ensemble des constituants de la plante agit en synergie")],
            [_text("Terrain", bold=True), _text(" : Adaptation du traitement à chaque individu")],
            [_text("Prévention", bold=True), _text(" : Renforcer l'organisme avant la maladie")]
        ),
        _heading(2, "Formes galéniques principales"),
        _ordered_list(
            "Tisanes (infusions, décoctions)",
            "Teintures mères",
            "Extraits secs standardisés",
            "Huiles essentielles",
            "Gélules et comprimés"
        ),
        _heading(2, "Précautions importantes"),
        _paragraph(_text("Naturel ne signifie pas sans danger. Certaines plantes peuvent être toxiques ou interagir avec des médicaments."))
    ),

    "Camomille romaine": _doc(
        _heading(1, "Camomille romaine (Chamaemelum nobile)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Asteraceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Capitules floraux")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Huile essentielle (chamazulène, bisabolol)",
            "Flavonoïdes (apigénine)",
            "Lactones sesquiterpéniques"
        ),
        _heading(2, "Propriétés thérapeutiques"),
        _bullet_list(
            [_text("Digestive", bold=True), _text(" : Antispasmodique, carminative")],
            [_text("Nerveuse", bold=True), _text(" : Sédative légère, anxiolytique")],
            [_text("Anti-inflammatoire", bold=True), _text(" : Usage externe (peau, yeux)")]
        ),
        _heading(2, "Indications"),
        _bullet_list(
            "Troubles digestifs fonctionnels",
            "Nervosité, troubles du sommeil",
            "Inflammations cutanées"
        ),
        _heading(2, "Posologie"),
        _paragraph(_text("Infusion", bold=True), _text(" : 5-10g de fleurs séchées pour 1L d'eau, 2-3 tasses/jour"))
    ),

    "Lavande officinale": _doc(
        _heading(1, "Lavande officinale (Lavandula angustifolia)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Lamiaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Sommités fleuries")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Huile essentielle (linalol, acétate de linalyle)",
            "Tanins",
            "Coumarines"
        ),
        _heading(2, "Propriétés thérapeutiques"),
        _bullet_list(
            [_text("Système nerveux", bold=True), _text(" : Anxiolytique, sédative")],
            [_text("Antiseptique", bold=True), _text(" : Antibactérienne, antifongique")],
            [_text("Cicatrisante", bold=True), _text(" : Brûlures, plaies")]
        ),
        _heading(2, "Modes d'utilisation"),
        _ordered_list(
            [_text("Infusion", bold=True), _text(" : 20g/L, 3 tasses/jour")],
            [_text("HE en diffusion", bold=True), _text(" : Relaxation atmosphérique")],
            [_text("HE locale", bold=True), _text(" : 2 gouttes sur les tempes (migraines)")]
        )
    ),

    "Valériane": _doc(
        _heading(1, "Valériane (Valeriana officinalis)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Caprifoliaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Racines et rhizomes")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Acide valérénique",
            "Valépotriates",
            "GABA",
            "Huile essentielle"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Sédative", bold=True), _text(" : Action sur les récepteurs GABA")],
            [_text("Anxiolytique", bold=True), _text(" : Réduction du stress")],
            [_text("Myorelaxante", bold=True), _text(" : Décontraction musculaire")]
        ),
        _heading(2, "Indications principales"),
        _bullet_list(
            "Insomnie d'endormissement",
            "Anxiété, nervosité",
            "Sevrage des benzodiazépines (accompagnement)"
        ),
        _heading(2, "Précautions"),
        _paragraph(_text("Ne pas associer avec alcool ou autres sédatifs. Effet progressif (2-4 semaines)."))
    ),

    "Troubles digestifs - Approche": _doc(
        _heading(1, "Approche phytothérapeutique des troubles digestifs"),
        _heading(2, "Étiologies fréquentes"),
        _bullet_list(
            "Stress et émotions",
            "Alimentation inadaptée",
            "Dysbiose intestinale",
            "Insuffisance hépatobiliaire"
        ),
        _heading(2, "Stratégie thérapeutique"),
        _heading(3, "1. Soutien hépatique"),
        _paragraph(_text("Artichaut, chardon-marie, romarin")),
        _heading(3, "2. Stimulation digestive"),
        _paragraph(_text("Gentiane, fenouil, menthe poivrée")),
        _heading(3, "3. Apaisement"),
        _paragraph(_text("Camomille, mélisse, réglisse")),
        _heading(2, "Protocole type - Dyspepsie"),
        _ordered_list(
            "Avant repas : EPS gentiane (5ml)",
            "Après repas : Tisane digestive (menthe + fenouil)",
            "Cure de fond : Chardon-marie 3 semaines"
        )
    ),

    "Stress et anxiété": _doc(
        _heading(1, "Phytothérapie du stress et de l'anxiété"),
        _heading(2, "Mécanismes en jeu"),
        _paragraph(_text("Le stress chronique perturbe l'axe hypothalamo-hypophyso-surrénalien (HHS) et épuise les réserves de neurotransmetteurs.")),
        _heading(2, "Plantes adaptogènes"),
        _bullet_list(
            [_text("Rhodiola rosea", bold=True), _text(" : Fatigue, stress")],
            [_text("Ashwagandha", bold=True), _text(" : Anxiété, sommeil")],
            [_text("Éleuthérocoque", bold=True), _text(" : Fatigue intellectuelle")]
        ),
        _heading(2, "Plantes anxiolytiques"),
        _bullet_list(
            [_text("Passiflore", bold=True), _text(" : Anxiété avec composante somatique")],
            [_text("Valériane", bold=True), _text(" : Tension nerveuse, insomnie")],
            [_text("Aubépine", bold=True), _text(" : Anxiété avec palpitations")]
        ),
        _heading(2, "Synergie recommandée"),
        _paragraph(_text("Association passiflore + aubépine + valériane en EPS ou gélules."))
    ),

    "Millepertuis": _doc(
        _heading(1, "Millepertuis (Hypericum perforatum)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Hypericaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Sommités fleuries")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Hypéricine (naphthodianthrone)",
            "Hyperforine",
            "Flavonoïdes"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Antidépresseur", bold=True), _text(" : Inhibition recapture sérotonine/noradrénaline")],
            [_text("Anxiolytique", bold=True)],
            [_text("Antiviral", bold=True), _text(" (usage externe)")]
        ),
        _heading(2, "⚠️ INTERACTIONS MAJEURES"),
        _paragraph(_text("Le millepertuis est un ", italic=False), _text("inducteur enzymatique puissant", bold=True), _text(" (CYP3A4). Il diminue l'efficacité de nombreux médicaments :")),
        _bullet_list(
            "Contraceptifs oraux",
            "Anticoagulants",
            "Immunosuppresseurs",
            "Antirétroviraux"
        )
    ),

    "Échinacée - Immunité": _doc(
        _heading(1, "Échinacée (Echinacea purpurea)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Asteraceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Racines, parties aériennes")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Alkylamides",
            "Polysaccharides immunostimulants",
            "Acide cichorique"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Immunostimulante", bold=True), _text(" : Activation des macrophages")],
            [_text("Anti-infectieuse", bold=True), _text(" : Voies respiratoires")],
            [_text("Anti-inflammatoire", bold=True)]
        ),
        _heading(2, "Indications"),
        _bullet_list(
            "Prévention des infections hivernales",
            "Traitement précoce du rhume",
            "Infections urinaires récidivantes"
        ),
        _heading(2, "Posologie"),
        _paragraph(_text("Cure de 10 jours maximum, pause de 3 semaines. Ne pas utiliser en continu."))
    ),

    "Aromathérapie - Bases": _doc(
        _heading(1, "Bases de l'aromathérapie"),
        _heading(2, "Définition"),
        _paragraph(_text("L'aromathérapie utilise les huiles essentielles (HE) extraites de plantes aromatiques à des fins thérapeutiques.")),
        _heading(2, "Modes d'extraction"),
        _bullet_list(
            [_text("Distillation", bold=True), _text(" : Vapeur d'eau (la plus courante)")],
            [_text("Expression", bold=True), _text(" : Agrumes (zestes)")],
            [_text("Extraction CO2", bold=True), _text(" : Supercritique")]
        ),
        _heading(2, "Voies d'administration"),
        _ordered_list(
            [_text("Cutanée", bold=True), _text(" : Diluée dans huile végétale")],
            [_text("Olfactive", bold=True), _text(" : Diffusion, inhalation")],
            [_text("Orale", bold=True), _text(" : Sur support, avec précaution")]
        ),
        _heading(2, "Règles de sécurité"),
        _bullet_list(
            "Jamais pure sur la peau (sauf exceptions)",
            "Test cutané préalable",
            "Contre-indiquées grossesse/enfants (sauf avis)",
            "Conservation à l'abri de la lumière"
        )
    ),

    "Tea tree - Antiseptique": _doc(
        _heading(1, "Tea tree (Melaleuca alternifolia)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Myrtaceae")),
        _paragraph(_text("Origine", bold=True), _text(" : Australie")),
        _heading(2, "Composition"),
        _bullet_list(
            "Terpinène-4-ol (30-40%)",
            "Gamma-terpinène",
            "Alpha-terpinène"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Antibactérien", bold=True), _text(" : Large spectre")],
            [_text("Antifongique", bold=True), _text(" : Candida, dermatophytes")],
            [_text("Antiviral", bold=True)],
            [_text("Immunostimulant", bold=True)]
        ),
        _heading(2, "Applications pratiques"),
        _bullet_list(
            "Acné : 1 goutte locale",
            "Mycoses : Diluée à 10% dans huile végétale",
            "Infections ORL : Inhalation",
            "Assainissement : Diffusion atmosphérique"
        )
    ),

    "Pathologies hivernales": _doc(
        _heading(1, "Prévention et traitement des pathologies hivernales"),
        _heading(2, "Stratégie préventive"),
        _heading(3, "Renforcement immunitaire (octobre-novembre)"),
        _bullet_list(
            "Échinacée : Cure de 3 semaines",
            "Vitamine D : Supplémentation",
            "Propolis : Spray gorge quotidien"
        ),
        _heading(2, "En cas d'infection"),
        _heading(3, "Début de rhume"),
        _bullet_list(
            "HE Ravintsara : 2 gouttes sur poignets, 3x/jour",
            "Tisane thym-citron-miel",
            "Échinacée : Dose d'attaque"
        ),
        _heading(3, "Toux grasse"),
        _bullet_list(
            "Thym : Expectorant",
            "Lierre grimpant : Bronchodilatateur",
            "Eucalyptus globulus : Mucolytique"
        ),
        _heading(3, "Toux sèche"),
        _bullet_list(
            "Mauve : Émolliente",
            "Guimauve : Adoucissante",
            "Miel de thym"
        )
    ),

    "Gestion du sommeil": _doc(
        _heading(1, "Phytothérapie des troubles du sommeil"),
        _heading(2, "Types d'insomnie"),
        _bullet_list(
            [_text("Endormissement", bold=True), _text(" : Difficulté à s'endormir")],
            [_text("Maintien", bold=True), _text(" : Réveils nocturnes")],
            [_text("Terminal", bold=True), _text(" : Réveil précoce")]
        ),
        _heading(2, "Plantes sédatives"),
        _bullet_list(
            [_text("Valériane", bold=True), _text(" → Endormissement")],
            [_text("Passiflore", bold=True), _text(" → Réveils anxieux")],
            [_text("Houblon", bold=True), _text(" → Agitation")],
            [_text("Eschscholtzia", bold=True), _text(" → Sommeil profond")]
        ),
        _heading(2, "Protocole type"),
        _ordered_list(
            "18h : Tisane mélisse-tilleul",
            "20h : Dîner léger, pas d'écrans",
            "21h : EPS passiflore-valériane (5ml)",
            "22h : HE lavande sur oreiller"
        )
    ),

    "Douleurs articulaires": _doc(
        _heading(1, "Approche des douleurs articulaires"),
        _heading(2, "Étiologies"),
        _bullet_list(
            "Arthrose (dégénératif)",
            "Arthrite (inflammatoire)",
            "Traumatique"
        ),
        _heading(2, "Plantes anti-inflammatoires"),
        _bullet_list(
            [_text("Harpagophytum", bold=True), _text(" : Arthrose, tendinite")],
            [_text("Curcuma", bold=True), _text(" : Anti-inflammatoire général")],
            [_text("Reine-des-prés", bold=True), _text(" : Salicylés naturels")],
            [_text("Saule blanc", bold=True), _text(" : Douleurs aiguës")]
        ),
        _heading(2, "Usage externe"),
        _bullet_list(
            "HE Gaulthérie : Massage (diluée)",
            "HE Eucalyptus citronné : Anti-inflammatoire",
            "Arnica : Traumatismes"
        ),
        _heading(2, "Compléments"),
        _bullet_list(
            "Glucosamine-chondroïtine",
            "Collagène type II",
            "Silicium organique"
        )
    ),

    "Détox hépatique": _doc(
        _heading(1, "Cure détox hépatique"),
        _heading(2, "Indications"),
        _bullet_list(
            "Fatigue chronique",
            "Digestion lourde",
            "Teint brouillé",
            "Changement de saison"
        ),
        _heading(2, "Plantes hépatoprotectrices"),
        _bullet_list(
            [_text("Chardon-marie", bold=True), _text(" : Silymarine, régénération hépatocytes")],
            [_text("Desmodium", bold=True), _text(" : Protection, régénération")],
            [_text("Artichaut", bold=True), _text(" : Cholagogue, cholérétique")],
            [_text("Radis noir", bold=True), _text(" : Drainage biliaire")]
        ),
        _heading(2, "Protocole 3 semaines"),
        _ordered_list(
            [_text("Semaine 1", bold=True), _text(" : Artichaut + radis noir (drainage)")],
            [_text("Semaine 2", bold=True), _text(" : Chardon-marie (protection)")],
            [_text("Semaine 3", bold=True), _text(" : Desmodium (régénération)")]
        ),
        _heading(2, "Accompagnement"),
        _bullet_list(
            "Hydratation ++ (2L/jour)",
            "Alimentation légère",
            "Éviter alcool et graisses"
        )
    ),

    "Circulation veineuse": _doc(
        _heading(1, "Insuffisance veineuse - Approche naturelle"),
        _heading(2, "Symptômes"),
        _bullet_list(
            "Jambes lourdes",
            "Œdèmes",
            "Varices",
            "Impatiences"
        ),
        _heading(2, "Plantes veinotoniques"),
        _bullet_list(
            [_text("Vigne rouge", bold=True), _text(" : Anthocyanes, protection vasculaire")],
            [_text("Marronnier d'Inde", bold=True), _text(" : Escine, anti-œdémateux")],
            [_text("Hamamélis", bold=True), _text(" : Astringent veineux")],
            [_text("Petit houx", bold=True), _text(" : Ruscogénines")]
        ),
        _heading(2, "Usage externe"),
        _bullet_list(
            "HE Cyprès : Massage ascendant",
            "HE Lentisque pistachier : Décongestionnant",
            "Gel jambes légères (vigne rouge + menthol)"
        ),
        _heading(2, "Hygiène de vie"),
        _bullet_list(
            "Surélever les jambes",
            "Éviter chaleur et station debout prolongée",
            "Bas de contention si nécessaire"
        )
    ),

    # Nouvelles notes Sophie - Phytothérapie
    "Menthe poivrée": _doc(
        _heading(1, "Menthe poivrée (Mentha x piperita)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Lamiaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Feuilles, huile essentielle")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Menthol (40-50%)",
            "Menthone",
            "Flavonoïdes",
            "Tanins"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Digestive", bold=True), _text(" : Antispasmodique, carminative")],
            [_text("Analgésique", bold=True), _text(" : Céphalées (usage local)")],
            [_text("Rafraîchissante", bold=True), _text(" : Sensation de fraîcheur")],
            [_text("Antiseptique", bold=True), _text(" : Respiratoire")]
        ),
        _heading(2, "Précautions"),
        _paragraph(_text("HE contre-indiquée chez enfants < 6 ans et femmes enceintes. Ne pas appliquer près des yeux."))
    ),

    "Gingembre": _doc(
        _heading(1, "Gingembre (Zingiber officinale)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Zingiberaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Rhizome")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Gingérols (anti-inflammatoire)",
            "Shogaols",
            "Huile essentielle (zingibérène)"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Anti-nauséeux", bold=True), _text(" : Mal des transports, grossesse")],
            [_text("Digestif", bold=True), _text(" : Stimule la digestion")],
            [_text("Anti-inflammatoire", bold=True), _text(" : Douleurs articulaires")],
            [_text("Réchauffant", bold=True), _text(" : Stimule la circulation")]
        ),
        _heading(2, "Utilisation"),
        _bullet_list(
            "Infusion : 1g de poudre ou 5g frais",
            "Gélules : 250-500mg, 2-3x/jour",
            "Frais râpé dans l'alimentation"
        )
    ),

    "Passiflore": _doc(
        _heading(1, "Passiflore (Passiflora incarnata)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Passifloraceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Parties aériennes")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Flavonoïdes (chrysine, vitexine)",
            "Alcaloïdes (harmane)",
            "Maltol"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Anxiolytique", bold=True), _text(" : Sans dépendance ni accoutumance")],
            [_text("Sédative légère", bold=True), _text(" : Facilite l'endormissement")],
            [_text("Antispasmodique", bold=True), _text(" : Crampes, tension musculaire")],
            [_text("Hypotensive légère", bold=True)]
        ),
        _heading(2, "Indications"),
        _bullet_list(
            "Anxiété avec composante somatique (palpitations, oppression)",
            "Troubles du sommeil liés au stress",
            "Sevrage benzodiazépines (accompagnement)"
        ),
        _heading(2, "Synergie"),
        _paragraph(_text("Souvent associée à valériane et/ou aubépine pour effet synergique."))
    ),

    "Aubépine": _doc(
        _heading(1, "Aubépine (Crataegus monogyna)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Rosaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Sommités fleuries, baies")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Flavonoïdes (hypéroside, vitexine)",
            "Procyanidines",
            "Acides phénoliques"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Cardiotonique", bold=True), _text(" : Renforce le muscle cardiaque")],
            [_text("Hypotensive légère", bold=True), _text(" : Régule la tension")],
            [_text("Anxiolytique", bold=True), _text(" : Palpitations émotionnelles")],
            [_text("Antioxydante", bold=True)]
        ),
        _heading(2, "Indications"),
        _bullet_list(
            "Palpitations fonctionnelles",
            "Anxiété avec manifestations cardiaques",
            "Hypertension légère",
            "Prévention cardiovasculaire"
        ),
        _heading(2, "Précautions"),
        _paragraph(_text("Ne pas associer avec médicaments cardiaques sans avis médical. Effet progressif (plusieurs semaines)."))
    ),

    "Thym": _doc(
        _heading(1, "Thym (Thymus vulgaris)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Lamiaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Sommités fleuries")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Huile essentielle (thymol, carvacrol)",
            "Flavonoïdes",
            "Acide rosmarinique"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Antiseptique puissant", bold=True), _text(" : Respiratoire, digestif")],
            [_text("Expectorant", bold=True), _text(" : Fluidifie les sécrétions")],
            [_text("Antispasmodique", bold=True), _text(" : Toux, bronches")],
            [_text("Immunostimulant", bold=True)]
        ),
        _heading(2, "Indications"),
        _bullet_list(
            "Infections respiratoires (bronchite, rhume)",
            "Toux grasse productive",
            "Fatigue générale, convalescence"
        ),
        _heading(2, "Formes"),
        _bullet_list(
            "Infusion : 1-2g pour une tasse, 3x/jour",
            "Sirop de thym : toux",
            "HE : usage externe dilué ou diffusion"
        )
    ),

    "Romarin": _doc(
        _heading(1, "Romarin (Rosmarinus officinalis)"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Lamiaceae")),
        _paragraph(_text("Parties utilisées", bold=True), _text(" : Sommités fleuries, feuilles")),
        _heading(2, "Principes actifs"),
        _bullet_list(
            "Acide rosmarinique",
            "Diterpènes (carnosol, acide carnosique)",
            "Huile essentielle (1,8-cinéole, camphre)"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Hépatoprotecteur", bold=True), _text(" : Stimule la fonction biliaire")],
            [_text("Antioxydant", bold=True), _text(" : Protection cellulaire")],
            [_text("Tonique général", bold=True), _text(" : Fatigue, convalescence")],
            [_text("Mémoire", bold=True), _text(" : Améliore la concentration")]
        ),
        _heading(2, "Indications"),
        _bullet_list(
            "Troubles hépatobiliaires",
            "Fatigue physique et intellectuelle",
            "Troubles digestifs",
            "Circulation sanguine"
        ),
        _heading(2, "Chimiotypes HE"),
        _bullet_list(
            "CT verbénone : Hépatoprotecteur",
            "CT 1,8-cinéole : Respiratoire",
            "CT camphre : Musculaire"
        )
    ),

    "Ravintsara": _doc(
        _heading(1, "Ravintsara (Cinnamomum camphora ct cinéole)"),
        _heading(2, "Identification"),
        _paragraph(_text("Origine", bold=True), _text(" : Madagascar")),
        _paragraph(_text("Partie utilisée", bold=True), _text(" : Feuilles (HE)")),
        _heading(2, "Composition"),
        _bullet_list(
            "1,8-cinéole (50-60%)",
            "Sabinène",
            "Alpha-terpinéol"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Antiviral majeur", bold=True), _text(" : Grippe, herpès, zona")],
            [_text("Immunostimulant", bold=True), _text(" : Renforce les défenses")],
            [_text("Expectorant", bold=True), _text(" : Dégage les voies respiratoires")],
            [_text("Énergisant", bold=True), _text(" : Sans excitation")]
        ),
        _heading(2, "Utilisation"),
        _bullet_list(
            "Prévention : 2 gouttes sur poignets, matin",
            "Infection : 3-4x/jour + diffusion",
            "Massage : Diluée sur thorax"
        ),
        _heading(2, "Avantage"),
        _paragraph(_text("HE très bien tolérée, utilisable chez l'enfant > 3 ans et la femme enceinte > 3 mois."))
    ),

    "Eucalyptus radiata": _doc(
        _heading(1, "Eucalyptus radiata"),
        _heading(2, "Identification"),
        _paragraph(_text("Famille", bold=True), _text(" : Myrtaceae")),
        _paragraph(_text("Partie utilisée", bold=True), _text(" : Feuilles (HE)")),
        _heading(2, "Composition"),
        _bullet_list(
            "1,8-cinéole (60-70%)",
            "Alpha-terpinéol",
            "Limonène"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Expectorant", bold=True), _text(" : Fluidifie le mucus")],
            [_text("Antiviral", bold=True), _text(" : Infections ORL")],
            [_text("Antibactérien", bold=True)],
            [_text("Immunomodulant", bold=True)]
        ),
        _heading(2, "Différence avec E. globulus"),
        _bullet_list(
            "E. radiata : Plus doux, enfants > 6 ans",
            "E. globulus : Plus puissant, adultes uniquement"
        ),
        _heading(2, "Utilisation"),
        _bullet_list(
            "Inhalation : 5 gouttes dans bol d'eau chaude",
            "Diffusion : Assainissement atmosphérique",
            "Massage : Diluée sur thorax et dos"
        )
    ),

    "Propolis": _doc(
        _heading(1, "Propolis"),
        _heading(2, "Origine"),
        _paragraph(_text("Substance résineuse récoltée par les abeilles sur les bourgeons et écorces d'arbres, transformée par leurs enzymes.")),
        _heading(2, "Composition"),
        _bullet_list(
            "Résines et baumes (50%)",
            "Cires (30%)",
            "Huiles essentielles (10%)",
            "Flavonoïdes (galangine, pinocembrine)"
        ),
        _heading(2, "Propriétés"),
        _bullet_list(
            [_text("Antibactérien", bold=True), _text(" : Large spectre")],
            [_text("Antiviral", bold=True), _text(" : Herpès, grippe")],
            [_text("Antifongique", bold=True)],
            [_text("Cicatrisant", bold=True), _text(" : Aphtes, plaies buccales")],
            [_text("Immunostimulant", bold=True)]
        ),
        _heading(2, "Formes et utilisations"),
        _bullet_list(
            "Spray gorge : Maux de gorge, angines",
            "Gélules : Prévention hivernale",
            "Teinture : Usage local",
            "Gommes à mâcher : Protection buccale"
        ),
        _heading(2, "Précautions"),
        _paragraph(_text("Allergie possible chez les personnes allergiques aux produits de la ruche ou au pollen."))
    ),

    "Système nerveux - Vue globale": _doc(
        _heading(1, "Approche phytothérapeutique du système nerveux"),
        _heading(2, "Classification des plantes"),
        _heading(3, "Plantes sédatives"),
        _bullet_list(
            "Valériane - Endormissement",
            "Passiflore - Anxiété somatique",
            "Houblon - Agitation",
            "Eschscholtzia - Sommeil profond"
        ),
        _heading(3, "Plantes anxiolytiques"),
        _bullet_list(
            "Passiflore - Action rapide",
            "Aubépine - Palpitations",
            "Mélisse - Digestif + nerveux"
        ),
        _heading(3, "Plantes adaptogènes"),
        _bullet_list(
            "Rhodiola - Stress, fatigue",
            "Ashwagandha - Anxiété chronique",
            "Éleuthérocoque - Fatigue intellectuelle"
        ),
        _heading(3, "Plantes antidépressives"),
        _bullet_list(
            "Millepertuis - Dépression légère à modérée",
            "Safran - Alternative au millepertuis"
        ),
        _heading(2, "Stratégie thérapeutique"),
        _paragraph(_text("Associer selon le tableau clinique : fond (adaptogènes) + symptomatique (sédatifs/anxiolytiques)."))
    ),

    "Système digestif - Vue globale": _doc(
        _heading(1, "Approche phytothérapeutique du système digestif"),
        _heading(2, "Anatomie fonctionnelle"),
        _bullet_list(
            "Bouche → Estomac → Intestin grêle → Côlon",
            "Foie et vésicule biliaire",
            "Pancréas"
        ),
        _heading(2, "Plantes par indication"),
        _heading(3, "Stimulation digestive"),
        _bullet_list(
            "Gentiane - Apéritif, tonique amer",
            "Artichaut - Hépatobiliaire",
            "Fenouil - Carminatif"
        ),
        _heading(3, "Antispasmodiques"),
        _bullet_list(
            "Menthe poivrée - Côlon irritable",
            "Camomille - Crampes digestives",
            "Mélisse - Spasmes d'origine nerveuse"
        ),
        _heading(3, "Protection muqueuse"),
        _bullet_list(
            "Réglisse - Gastrite, ulcère",
            "Guimauve - Émollient",
            "Aloe vera - Cicatrisant"
        ),
        _heading(3, "Transit"),
        _bullet_list(
            "Psyllium - Régulateur (constipation/diarrhée)",
            "Lin - Laxatif doux",
            "Séné - Laxatif stimulant (court terme)"
        ),
        _heading(2, "Approche globale"),
        _paragraph(_text("Toujours considérer : alimentation, stress, microbiote."))
    ),

    "Système immunitaire - Vue globale": _doc(
        _heading(1, "Phytothérapie et système immunitaire"),
        _heading(2, "Immunostimulants"),
        _bullet_list(
            [_text("Échinacée", bold=True), _text(" : Stimulation des macrophages")],
            [_text("Astragale", bold=True), _text(" : Tonique immunitaire de fond")],
            [_text("Éleuthérocoque", bold=True), _text(" : Adaptogène immunomodulant")]
        ),
        _heading(2, "Anti-infectieux"),
        _bullet_list(
            [_text("Thym", bold=True), _text(" : Antiseptique respiratoire")],
            [_text("Origan", bold=True), _text(" : Antibactérien puissant (HE)")],
            [_text("Tea tree", bold=True), _text(" : Large spectre")]
        ),
        _heading(2, "Produits de la ruche"),
        _bullet_list(
            "Propolis - Antibactérien, antiviral",
            "Gelée royale - Tonique général",
            "Miel - Antibactérien, cicatrisant"
        ),
        _heading(2, "Stratégie préventive"),
        _ordered_list(
            "Septembre-octobre : Cure échinacée (3 semaines)",
            "Hiver : Propolis quotidien + vitamine D",
            "Dès premiers symptômes : Ravintsara + échinacée dose d'attaque"
        )
    ),
}

SOPHIE_FLASHCARDS = [
    ("Quels sont les 3 principes fondamentaux de la phytothérapie ?",
     [("Totum, Terrain, Prévention", True),
      ("Plante, Dosage, Durée", False),
      ("Infusion, Décoction, Macération", False)]),
    ("Quelle est la famille botanique de la Camomille romaine ?",
     [("Asteraceae", True),
      ("Lamiaceae", False),
      ("Apiaceae", False)]),
    ("Quel est le principal principe actif sédatif de la Valériane ?",
     [("Acide valérénique", True),
      ("Hypéricine", False),
      ("Silymarine", False)]),
    ("Pourquoi le Millepertuis est-il contre-indiqué avec certains médicaments ?",
     [("C'est un inducteur enzymatique puissant (CYP3A4)", True),
      ("Il provoque des allergies", False),
      ("Il augmente la tension artérielle", False)]),
    ("Quelle plante est recommandée pour le soutien hépatique ?",
     [("Chardon-marie", True),
      ("Valériane", False),
      ("Échinacée", False)]),
    ("Quelle est l'indication principale du Tea tree (Melaleuca) ?",
     [("Antiseptique à large spectre", True),
      ("Sédatif", False),
      ("Anti-inflammatoire articulaire", False)]),
    ("Quelle plante adaptogène est recommandée pour la fatigue intellectuelle ?",
     [("Éleuthérocoque", True),
      ("Passiflore", False),
      ("Aubépine", False)]),
    ("Quelle est la durée maximale recommandée pour une cure d'Échinacée ?",
     [("10 jours", True),
      ("1 mois", False),
      ("3 mois", False)]),
    ("Quel type de toux traite-t-on avec la Mauve et la Guimauve ?",
     [("Toux sèche", True),
      ("Toux grasse", False),
      ("Toux allergique", False)]),
    ("Quelle plante veinotonique contient des anthocyanes ?",
     [("Vigne rouge", True),
      ("Hamamélis", False),
      ("Petit houx", False)]),
]
