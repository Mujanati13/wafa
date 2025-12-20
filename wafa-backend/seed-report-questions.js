import mongoose from "mongoose";
import dotenv from "dotenv";
import ReportQuestions from "./models/reportQuestions.js";
import User from "./models/userModel.js";
import Question from "./models/questionModule.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URL || "mongodb://localhost:27017/wafa";

async function seedReportQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get multiple test users (or create them)
    let testUsers = await User.find().limit(3);
    if (testUsers.length === 0) {
      testUsers = await User.insertMany([
        {
          username: "testuser1",
          email: "testuser1@example.com",
          password: "password123",
          name: "Test User 1",
          currentYear: 5,
        },
        {
          username: "testuser2",
          email: "testuser2@example.com",
          password: "password123",
          name: "Test User 2",
          currentYear: 4,
        },
        {
          username: "testuser3",
          email: "testuser3@example.com",
          password: "password123",
          name: "Test User 3",
          currentYear: 3,
        },
      ]);
      console.log("✅ Created test users");
    }

    // Get multiple test questions
    const testQuestions = await Question.find().limit(10);
    if (testQuestions.length === 0) {
      console.log("⚠️ No questions found. Please seed questions first using:");
      console.log("   node seed-modules.js");
      process.exit(1);
    }

    console.log(`📝 Found ${testQuestions.length} questions to use`);

    // Clear existing report questions
    await ReportQuestions.deleteMany({});
    console.log("🗑️  Cleared existing report questions");

    // Sample report questions with different users and questions
    const reportQuestionsData = [];
    const details = [
      "Cette question contient une erreur dans la réponse A. La bonne réponse devrait être la réponse B.",
      "L'image associée à cette question n'est pas claire. Peut-on la remplacer?",
      "La correction de cette question semble incorrecte. Merci de vérifier.",
      "Question en double avec le QCM précédent.",
      "Le texte de la question est mal formaté et difficile à lire.",
      "La réponse proposée ne correspond pas à l'énoncé de la question.",
      "Il manque une option de réponse dans cette question.",
      "L'explication de la correction n'est pas suffisamment claire.",
      "Cette question est hors programme pour cette année.",
      "Le niveau de difficulté ne correspond pas au module.",
    ];

    const statuses = ["pending", "pending", "pending", "resolved", "rejected"];

    // Create 10 different report questions
    for (let i = 0; i < Math.min(10, testQuestions.length); i++) {
      reportQuestionsData.push({
        userId: testUsers[i % testUsers.length]._id,
        questionId: testQuestions[i]._id,
        details: details[i % details.length],
        status: statuses[i % statuses.length],
      });
    }

    const createdReports = await ReportQuestions.insertMany(reportQuestionsData);
    console.log(`✅ Created ${createdReports.length} report questions`);

    console.log("\n📊 Summary:");
    console.log(`   - Pending: ${createdReports.filter(r => r.status === "pending").length}`);
    console.log(`   - Resolved: ${createdReports.filter(r => r.status === "resolved").length}`);
    console.log(`   - Rejected: ${createdReports.filter(r => r.status === "rejected").length}`);

    console.log("\n✨ Seeding completed successfully!");
    console.log("💡 You can now test the Report Questions page");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding report questions:", error);
    process.exit(1);
  }
}

seedReportQuestions();
