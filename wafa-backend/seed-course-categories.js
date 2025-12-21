import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExamCourse from './models/examCourseModel.js';
import Module from './models/moduleModel.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/wafa';

// Categories for exam courses with colors and difficulty
const categories = [
    { name: "Anatomie", color: "#ef4444", difficulty: "medium" },
    { name: "Physiologie", color: "#f97316", difficulty: "hard" },
    { name: "Biochimie", color: "#f59e0b", difficulty: "hard" },
    { name: "Histologie", color: "#eab308", difficulty: "medium" },
    { name: "Embryologie", color: "#84cc16", difficulty: "medium" },
    { name: "Génétique", color: "#22c55e", difficulty: "hard" },
    { name: "Immunologie", color: "#10b981", difficulty: "hard" },
    { name: "Hématologie", color: "#14b8a6", difficulty: "medium" },
    { name: "Microbiologie", color: "#06b6d4", difficulty: "medium" },
    { name: "Pharmacologie", color: "#0ea5e9", difficulty: "hard" },
    { name: "Pathologie", color: "#3b82f6", difficulty: "hard" },
    { name: "Sémiologie", color: "#6366f1", difficulty: "medium" },
    { name: "Radiologie", color: "#8b5cf6", difficulty: "medium" },
    { name: "Cardiologie", color: "#a855f7", difficulty: "hard" },
    { name: "Pneumologie", color: "#c026d3", difficulty: "medium" },
    { name: "Gastro-entérologie", color: "#d946ef", difficulty: "medium" },
    { name: "Néphrologie", color: "#ec4899", difficulty: "hard" },
    { name: "Endocrinologie", color: "#f43f5e", difficulty: "hard" },
    { name: "Neurologie", color: "#dc2626", difficulty: "hard" },
    { name: "Psychiatrie", color: "#ea580c", difficulty: "medium" },
    { name: "Dermatologie", color: "#d97706", difficulty: "easy" },
    { name: "ORL", color: "#ca8a04", difficulty: "medium" },
    { name: "Ophtalmologie", color: "#65a30d", difficulty: "medium" },
    { name: "Pédiatrie", color: "#16a34a", difficulty: "medium" },
    { name: "Gynécologie-Obstétrique", color: "#059669", difficulty: "hard" },
    { name: "Chirurgie générale", color: "#0d9488", difficulty: "hard" },
    { name: "Orthopédie", color: "#0891b2", difficulty: "medium" },
    { name: "Urologie", color: "#0284c7", difficulty: "medium" },
    { name: "Oncologie", color: "#2563eb", difficulty: "hard" },
    { name: "Médecine d'urgence", color: "#4f46e5", difficulty: "hard" },
    { name: "Santé publique", color: "#7c3aed", difficulty: "easy" },
    { name: "Éthique médicale", color: "#9333ea", difficulty: "easy" }
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
            const categoryData = categories[i];
            const module = modules[i % modules.length]; // Cycle through modules
            
            examCourses.push({
                name: `Cours ${categoryData.name}`,
                moduleId: module._id,
                category: categoryData.name,
                subCategory: i % 3 === 0 ? "Session principale" : i % 3 === 1 ? "Session rattrapage" : "",
                description: `Cours complet sur ${categoryData.name.toLowerCase()} avec questions et exercices.`,
                difficulty: categoryData.difficulty,
                color: categoryData.color,
                contentType: "text",
                imageUrl: "",
                status: i % 4 === 0 ? "draft" : "active",
                linkedQuestions: [],
                totalQuestions: 0
            });
        }

        const createdCourses = await ExamCourse.insertMany(examCourses);
        console.log(`✅ Created ${createdCourses.length} exam courses with categories`);

        // Display created categories with colors and difficulty
        console.log('\n📋 Categories created:');
        categories.forEach(cat => {
            console.log(`   - ${cat.name} (${cat.difficulty}) ${cat.color}`);
        });

        console.log('\n✨ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding course categories:', error);
        process.exit(1);
    }
};

seedCourseCategories();
