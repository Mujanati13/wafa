import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from './models/moduleModel.js';

dotenv.config();

// Color palette for modules
const colors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#ef4444", // Red
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#14b8a6", // Teal
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#a855f7", // Purple
    "#f43f5e", // Rose
];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const modulesData = [
    // S1 Modules
    { name: "Anatomie 1", semester: "S1", infoText: "Étude de la structure du corps humain - Partie 1" },
    { name: "Chimie-biochimie", semester: "S1", infoText: "Étude des processus chimiques et biochimiques" },
    { name: "Biologie et génétique fondamentale", semester: "S1", infoText: "Étude de la biologie cellulaire et des bases de la génétique" },
    { name: "Biostatistique et santé publique", semester: "S1", infoText: "Statistiques appliquées à la santé et notions de santé publique" },
    { name: "Biophysique", semester: "S1", infoText: "Applications de la physique aux systèmes biologiques" },
    { name: "Méthodologie de travail universitaire et terminologie", semester: "S1", infoText: "Méthodes de travail et terminologie médicale" },
    { name: "Langues étrangères S1", semester: "S1", infoText: "Cours de langues étrangères - Semestre 1" },

    // S2 Modules
    { name: "Anatomie 2", semester: "S2", infoText: "Étude de la structure du corps humain - Partie 2" },
    { name: "Histologie-Embryologie", semester: "S2", infoText: "Étude des tissus et du développement embryonnaire" },
    { name: "Bactériologie-virologie", semester: "S2", infoText: "Étude des bactéries et des virus" },
    { name: "Hématologie fondamentale - immunologie fondamentale", semester: "S2", infoText: "Bases de l'hématologie et de l'immunologie" },
    { name: "Physiologie 1", semester: "S2", infoText: "Étude du fonctionnement des organes - Partie 1" },
    { name: "Digital skills et applications en médecine", semester: "S2", infoText: "Compétences numériques appliquées à la médecine" },
    { name: "Langues étrangères S2", semester: "S2", infoText: "Cours de langues étrangères - Semestre 2" },
    { name: "Histologie 1 (ancien réforme)", semester: "S2", infoText: "Histologie - Ancien programme - Partie 1" },
    { name: "Histologie 2 (ancien réforme)", semester: "S2", infoText: "Histologie - Ancien programme - Partie 2" },
    { name: "Hématologie (ancien réforme)", semester: "S2", infoText: "Hématologie - Ancien programme" },
    { name: "Microbiologie (ancien réforme)", semester: "S2", infoText: "Microbiologie - Ancien programme" },

    // S3 Modules
    { name: "Anatomie III", semester: "S3", infoText: "Étude de la structure du corps humain - Partie 3" },
    { name: "Biochimie clinique", semester: "S3", infoText: "Applications cliniques de la biochimie" },
    { name: "Fonctions vitales et Secourisme", semester: "S3", infoText: "Étude des fonctions vitales et techniques de secourisme" },
    { name: "Physiologie 2", semester: "S3", infoText: "Étude du fonctionnement des organes - Partie 2" },
    { name: "Sémiologie (chirurgicale) 1", semester: "S3", infoText: "Sémiologie chirurgicale - Partie 1" },
    { name: "Art, culture et histoire de la médecine", semester: "S3", infoText: "Histoire et aspects culturels de la médecine" },
    { name: "Langues étrangères S3", semester: "S3", infoText: "Cours de langues étrangères - Semestre 3" },
    { name: "Anatomie 3 (ancien réforme)", semester: "S3", infoText: "Anatomie - Ancien programme - Partie 3" },
    { name: "Anatomie 4 (ancien réforme)", semester: "S3", infoText: "Anatomie - Ancien programme - Partie 4" },

    // S4 Modules
    { name: "Sémiologie (Médicale) 2", semester: "S4", infoText: "Sémiologie médicale - Partie 2" },
    { name: "Maladies Infectieuses / Parasitologie - Mycologie S4", semester: "S4", infoText: "Étude des maladies infectieuses, parasitaires et mycologiques" },
    { name: "Imagerie Médicale S4", semester: "S4", infoText: "Techniques d'imagerie médicale" },
    { name: "Anatomie Pathologique S4", semester: "S4", infoText: "Étude des modifications pathologiques des tissus" },
    { name: "Pharmacologie - Toxicologie", semester: "S4", infoText: "Étude des médicaments et de la toxicologie" },
    { name: "Techniques de communication", semester: "S4", infoText: "Techniques de communication en milieu médical" },
    { name: "Langues étrangères S4", semester: "S4", infoText: "Cours de langues étrangères - Semestre 4" },
    { name: "Anatomie Pathologique (ancien réforme)", semester: "S4", infoText: "Anatomie pathologique - Ancien programme" },
    { name: "Anatomie Pathologique I et II (ancien réforme)", semester: "S4", infoText: "Anatomie pathologique I et II - Ancien programme" },

    // S5 Modules
    { name: "Maladies Infectieuses / Parasitologie - Mycologie S5", semester: "S5", infoText: "Maladies infectieuses, parasitologie et mycologie - Niveau avancé" },
    { name: "Imagerie Médicale S5", semester: "S5", infoText: "Imagerie médicale - Niveau avancé" },
    { name: "Anatomie Pathologique S5", semester: "S5", infoText: "Anatomie pathologique - Niveau avancé" },
    { name: "Pharmacologie", semester: "S5", infoText: "Pharmacologie - Étude approfondie des médicaments" },

    // S6 Modules
    { name: "Maladie de l'Appareil Cardio-Vasculaire", semester: "S6", infoText: "Pathologies du système cardiovasculaire" },
    { name: "Maladie de l'Appareil Digestif", semester: "S6", infoText: "Pathologies du système digestif" },
    { name: "Maladie de l'Appareil Respiratoire", semester: "S6", infoText: "Pathologies du système respiratoire" },

    // S7 Modules
    { name: "Maladie de l'enfant", semester: "S7", infoText: "Pédiatrie - Pathologies de l'enfant" },
    { name: "Glandes Endocrines et Revêtements Cutanées", semester: "S7", infoText: "Endocrinologie et dermatologie" },
    { name: "Pathologie du Système nerveux", semester: "S7", infoText: "Neurologie - Pathologies du système nerveux" },
    { name: "Hématologie - Oncologie", semester: "S7", infoText: "Hématologie clinique et oncologie" },

    // S8 Modules
    { name: "Maladie de l'Appareil Locomoteur", semester: "S8", infoText: "Pathologies du système locomoteur - Orthopédie" },
    { name: "Anatomie pathologique I et II", semester: "S8", infoText: "Anatomie pathologique avancée" },
    { name: "Médecine interne-Immunologie-Génétique", semester: "S8", infoText: "Médecine interne, immunologie clinique et génétique médicale" },

    // S9 Modules
    { name: "Urgence Et Réanimation / Douleurs et Soins Palliatifs", semester: "S9", infoText: "Médecine d'urgence, réanimation et soins palliatifs" },
    { name: "Santé Mentale", semester: "S9", infoText: "Psychiatrie et santé mentale" },
    { name: "Santé publique", semester: "S9", infoText: "Santé publique et médecine préventive" },
    { name: "Med Légale - Med de travail - Ethique/Déontologie", semester: "S9", infoText: "Médecine légale, médecine du travail et éthique médicale" },

    // S10 Modules
    { name: "Urologie-Néphrologie", semester: "S10", infoText: "Pathologies urologiques et néphrologiques" },
    { name: "Synthèse Thérapeutique", semester: "S10", infoText: "Synthèse des approches thérapeutiques" },
    { name: "Gynécologie - Obstétrique", semester: "S10", infoText: "Gynécologie et obstétrique" },
    { name: "ORL / Maxillo-Faciale et Ophtalmologie", semester: "S10", infoText: "ORL, chirurgie maxillo-faciale et ophtalmologie" },
];

const seedModules = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✓ Connected to MongoDB');

        // Check for existing modules to avoid duplicates
        const existingModules = await Module.find({});
        const existingNames = existingModules.map(m => m.name);
        
        console.log(`Found ${existingModules.length} existing modules`);

        // Filter out modules that already exist
        const newModules = modulesData.filter(m => !existingNames.includes(m.name));
        
        if (newModules.length === 0) {
            console.log('All modules already exist in the database.');
            process.exit(0);
        }

        // Add color to each new module
        const modulesToInsert = newModules.map(m => ({
            ...m,
            color: getRandomColor(),
        }));

        // Insert new modules
        const insertedModules = await Module.insertMany(modulesToInsert);
        
        console.log(`\n✓ Successfully added ${insertedModules.length} new modules!\n`);

        // Display summary by semester
        const semesters = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"];
        console.log('============================================================');
        console.log('SUMMARY BY SEMESTER:');
        console.log('============================================================');
        
        for (const semester of semesters) {
            const semesterModules = insertedModules.filter(m => m.semester === semester);
            if (semesterModules.length > 0) {
                console.log(`\n${semester} (${semesterModules.length} modules):`);
                semesterModules.forEach(m => console.log(`  • ${m.name}`));
            }
        }

        console.log('\n============================================================');
        console.log(`TOTAL: ${insertedModules.length} modules added`);
        console.log('============================================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding modules:', error);
        process.exit(1);
    }
};

seedModules();
