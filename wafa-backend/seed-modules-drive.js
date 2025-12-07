import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from './models/moduleModel.js';

dotenv.config();

// Google Drive folder structure:
// https://drive.google.com/drive/folders/1XEfz4l78S-JNy98e2RWR6ccuaa6cxlNQ
// Organized by semesters: s1, s2, s3, s4, s5, s6, s7

// Module data based on the Drive images
const modulesData = [
    // Semester S1
    { name: "Anatomie", semester: "S1", color: "#ef4444", infoText: "Étude de la structure du corps humain" },
    { name: "Biologie et Génétique Fondamentale", semester: "S1", color: "#22c55e", infoText: "Bases de la biologie cellulaire et génétique" },
    { name: "Biophysique", semester: "S1", color: "#3b82f6", infoText: "Physique appliquée aux systèmes biologiques" },
    { name: "Biostatistiques et Santé Publique", semester: "S1", color: "#8b5cf6", infoText: "Statistiques médicales et santé publique" },
    { name: "Chimie-Biochimie", semester: "S1", color: "#f59e0b", infoText: "Chimie et biochimie fondamentales" },
    { name: "Langue Étrangère", semester: "S1", color: "#06b6d4", infoText: "Anglais médical" },
    { name: "Méthodologie de Travail Universitaire et Terminologie", semester: "S1", color: "#ec4899", infoText: "Méthodologie et terminologie médicale" },

    // Semester S2
    { name: "Anatomie 2", semester: "S2", color: "#ef4444", infoText: "Anatomie avancée" },
    { name: "Biochimie", semester: "S2", color: "#f59e0b", infoText: "Biochimie structurale et métabolique" },
    { name: "Biophysique 2", semester: "S2", color: "#3b82f6", infoText: "Biophysique avancée" },
    { name: "Embryologie", semester: "S2", color: "#22c55e", infoText: "Développement embryonnaire humain" },
    { name: "Histologie", semester: "S2", color: "#8b5cf6", infoText: "Étude des tissus" },
    { name: "Physiologie", semester: "S2", color: "#06b6d4", infoText: "Fonctionnement des organes et systèmes" },

    // Semester S3
    { name: "Anatomie 3", semester: "S3", color: "#ef4444", infoText: "Anatomie systémique" },
    { name: "Biochimie Clinique", semester: "S3", color: "#f59e0b", infoText: "Applications cliniques de la biochimie" },
    { name: "Histologie 2", semester: "S3", color: "#8b5cf6", infoText: "Histologie des organes" },
    { name: "Microbiologie", semester: "S3", color: "#22c55e", infoText: "Étude des micro-organismes" },
    { name: "Physiologie 2", semester: "S3", color: "#06b6d4", infoText: "Physiologie des systèmes" },
    { name: "Psychologie Médicale", semester: "S3", color: "#ec4899", infoText: "Aspects psychologiques en médecine" },

    // Semester S4
    { name: "Anatomie Pathologique", semester: "S4", color: "#ef4444", infoText: "Étude des lésions tissulaires" },
    { name: "Immunologie", semester: "S4", color: "#22c55e", infoText: "Système immunitaire" },
    { name: "Parasitologie", semester: "S4", color: "#8b5cf6", infoText: "Étude des parasites" },
    { name: "Pharmacologie", semester: "S4", color: "#3b82f6", infoText: "Étude des médicaments" },
    { name: "Physiologie 3", semester: "S4", color: "#06b6d4", infoText: "Physiologie intégrée" },
    { name: "Sémiologie", semester: "S4", color: "#f59e0b", infoText: "Étude des signes cliniques" },

    // Semester S5
    { name: "Cardiologie", semester: "S5", color: "#ef4444", infoText: "Pathologies cardiovasculaires" },
    { name: "Dermatologie", semester: "S5", color: "#ec4899", infoText: "Maladies de la peau" },
    { name: "Endocrinologie", semester: "S5", color: "#8b5cf6", infoText: "Système endocrinien" },
    { name: "Gastro-entérologie", semester: "S5", color: "#f59e0b", infoText: "Appareil digestif" },
    { name: "Hématologie", semester: "S5", color: "#22c55e", infoText: "Maladies du sang" },
    { name: "Néphrologie", semester: "S5", color: "#3b82f6", infoText: "Maladies rénales" },
    { name: "Pneumologie", semester: "S5", color: "#06b6d4", infoText: "Appareil respiratoire" },
    { name: "Rhumatologie", semester: "S5", color: "#84cc16", infoText: "Maladies articulaires" },

    // Semester S6
    { name: "Chirurgie Générale", semester: "S6", color: "#ef4444", infoText: "Principes de chirurgie" },
    { name: "Gynécologie-Obstétrique", semester: "S6", color: "#ec4899", infoText: "Santé de la femme" },
    { name: "Neurologie", semester: "S6", color: "#8b5cf6", infoText: "Système nerveux" },
    { name: "Ophtalmologie", semester: "S6", color: "#3b82f6", infoText: "Maladies des yeux" },
    { name: "ORL", semester: "S6", color: "#06b6d4", infoText: "Oto-rhino-laryngologie" },
    { name: "Pédiatrie", semester: "S6", color: "#22c55e", infoText: "Médecine de l'enfant" },
    { name: "Psychiatrie", semester: "S6", color: "#f59e0b", infoText: "Santé mentale" },
    { name: "Urologie", semester: "S6", color: "#84cc16", infoText: "Appareil urinaire" },

    // Semester S7
    { name: "Anesthésie-Réanimation", semester: "S7", color: "#ef4444", infoText: "Soins intensifs et anesthésie" },
    { name: "Infectiologie", semester: "S7", color: "#22c55e", infoText: "Maladies infectieuses" },
    { name: "Médecine du Travail", semester: "S7", color: "#3b82f6", infoText: "Santé au travail" },
    { name: "Médecine Légale", semester: "S7", color: "#8b5cf6", infoText: "Médecine et droit" },
    { name: "Oncologie", semester: "S7", color: "#f59e0b", infoText: "Traitement du cancer" },
    { name: "Radiologie", semester: "S7", color: "#06b6d4", infoText: "Imagerie médicale" },
    { name: "Traumatologie-Orthopédie", semester: "S7", color: "#ec4899", infoText: "Os et traumatismes" },
];

const seedModulesFromDrive = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✓ Connected to MongoDB');

        // Check existing modules
        const existingModules = await Module.find({});
        console.log(`Found ${existingModules.length} existing modules`);

        // Insert new modules (skip duplicates)
        let addedCount = 0;
        let skippedCount = 0;

        for (const moduleData of modulesData) {
            const exists = await Module.findOne({ name: moduleData.name });
            if (exists) {
                console.log(`⏭ Skipped (exists): ${moduleData.name}`);
                skippedCount++;
            } else {
                await Module.create(moduleData);
                console.log(`✓ Added: ${moduleData.name} (${moduleData.semester})`);
                addedCount++;
            }
        }

        console.log('\n============================================================');
        console.log('✓ Modules seeded successfully!');
        console.log('============================================================');
        console.log(`Added: ${addedCount} modules`);
        console.log(`Skipped: ${skippedCount} modules (already exist)`);
        console.log(`Total in database: ${await Module.countDocuments()}`);
        console.log('============================================================\n');

        // Show modules by semester
        console.log('Modules by Semester:');
        for (const sem of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']) {
            const count = await Module.countDocuments({ semester: sem });
            console.log(`  ${sem}: ${count} modules`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding modules:', error);
        process.exit(1);
    }
};

seedModulesFromDrive();
