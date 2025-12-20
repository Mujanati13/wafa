import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExamCourse from './models/examCourseModel.js';
import Module from './models/moduleModel.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/wafa';

// Categories for exam courses
const categories = [
    "Anatomie",
    "Physiologie",
    "Biochimie",
    "Histologie",
    "Embryologie",
    "Génétique",
    "Immunologie",
    "Hématologie",
    "Microbiologie",
    "Pharmacologie",
    "Pathologie",
    "Sémiologie",
    "Radiologie",
    "Cardiologie",
    "Pneumologie",
    "Gastro-entérologie",
    "Néphrologie",
    "Endocrinologie",
    "Neurologie",
    "Psychiatrie",
    "Dermatologie",
    "ORL",
    "Ophtalmologie",
    "Pédiatrie",
    "Gynécologie-Obstétrique",
    "Chirurgie générale",
    "Orthopédie",
    "Urologie",
    "Oncologie",
    "Médecine d'urgence",
    "Santé publique",
    "Éthique médicale"
];

const seedCourseCategories = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('✅ Connected to MongoDB');

        // Get all modules to create sample exam courses with different categories
        const modules = await Module.find().limit(5);
        
        if (modules.length === 0) {
            console.log('⚠️  No modules found. Please run seed-modules.js first.');
            process.exit(1);
        }

        console.log(`📚 Found ${modules.length} modules`);

        // Delete existing exam courses (optional)
        const deleteResult = await ExamCourse.deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing exam courses`);

        // Create sample exam courses for each category
        const examCourses = [];
        
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const module = modules[i % modules.length]; // Cycle through modules
            
            examCourses.push({
                name: `Cours ${category}`,
                moduleId: module._id,
                category: category,
                subCategory: i % 3 === 0 ? "Session principale" : i % 3 === 1 ? "Session rattrapage" : "",
                description: `Cours complet sur ${category.toLowerCase()} avec questions et exercices.`,
                imageUrl: "",
                status: i % 4 === 0 ? "draft" : "active",
                linkedQuestions: [],
                totalQuestions: 0
            });
        }

        const createdCourses = await ExamCourse.insertMany(examCourses);
        console.log(`✅ Created ${createdCourses.length} exam courses with categories`);

        // Display created categories
        const uniqueCategories = [...new Set(createdCourses.map(c => c.category))];
        console.log('\n📋 Categories created:');
        uniqueCategories.forEach(cat => {
            console.log(`   - ${cat}`);
        });

        console.log('\n✨ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding course categories:', error);
        process.exit(1);
    }
};

seedCourseCategories();
