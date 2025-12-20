import asyncHandler from "../handlers/asyncHandler.js";
import ExamCourse from "../models/examCourseModel.js";
import Question from "../models/questionModule.js";
import ExamParYear from "../models/examParYearModel.js";
import Module from "../models/moduleModel.js";

export const examCourseController = {
    // Create a new exam course
    create: asyncHandler(async (req, res) => {
        const { name, moduleId, category, subCategory, description, imageUrl, status } = req.body;
        
        const newCourse = await ExamCourse.create({
            name,
            moduleId,
            category,
            subCategory,
            description,
            imageUrl,
            status: status || "draft",
        });

        res.status(201).json({
            success: true,
            data: newCourse,
            message: "Cours créé avec succès",
        });
    }),

    // Get all exam courses with optional filters
    getAll: asyncHandler(async (req, res) => {
        const { moduleId, category, status, search } = req.query;
        
        const filter = {};
        if (moduleId) filter.moduleId = moduleId;
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { subCategory: { $regex: search, $options: "i" } },
            ];
        }

        const courses = await ExamCourse.find(filter)
            .populate("moduleId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: courses,
        });
    }),

    // Get a single exam course with questions
    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const course = await ExamCourse.getWithQuestions(id);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Cours non trouvé",
            });
        }

        res.status(200).json({
            success: true,
            data: course,
        });
    }),

    // Update an exam course
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, category, subCategory, description, imageUrl, status } = req.body;

        const updated = await ExamCourse.findByIdAndUpdate(
            id,
            { name, category, subCategory, description, imageUrl, status },
            { new: true, runValidators: true }
        ).populate("moduleId", "name");

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Cours non trouvé",
            });
        }

        res.status(200).json({
            success: true,
            data: updated,
            message: "Cours mis à jour avec succès",
        });
    }),

    // Delete an exam course
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const deleted = await ExamCourse.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Cours non trouvé",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cours supprimé avec succès",
        });
    }),

    // Link questions to a course
    linkQuestions: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { questionLinks } = req.body;
        // questionLinks: [{ examParYearId, questionNumbers: "1-5,7,10-12", yearName }]

        const course = await ExamCourse.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Cours non trouvé",
            });
        }

        let linkedCount = 0;
        const newSources = [];

        for (const link of questionLinks) {
            const { examParYearId, questionNumbers, yearName } = link;
            
            // Parse question numbers (e.g., "1-5,7,10-12" -> [1,2,3,4,5,7,10,11,12])
            const parsedNumbers = parseQuestionNumbers(questionNumbers);
            
            // Get all questions from this exam
            const questions = await Question.find({ examId: examParYearId });
            
            for (const num of parsedNumbers) {
                // Find question by index (assuming questions are ordered)
                const question = questions[num - 1];
                if (question && !course.linkedQuestions.includes(question._id)) {
                    course.linkedQuestions.push(question._id);
                    newSources.push({
                        questionId: question._id,
                        examParYearId,
                        yearName,
                        questionNumber: num,
                    });
                    linkedCount++;
                }
            }
        }

        course.questionSources.push(...newSources);
        await course.save();

        res.status(200).json({
            success: true,
            data: course,
            message: `${linkedCount} question(s) liée(s) au cours`,
        });
    }),

    // Unlink a question from a course
    unlinkQuestion: asyncHandler(async (req, res) => {
        const { id, questionId } = req.params;

        const course = await ExamCourse.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Cours non trouvé",
            });
        }

        course.linkedQuestions = course.linkedQuestions.filter(
            q => q.toString() !== questionId
        );
        course.questionSources = course.questionSources.filter(
            s => s.questionId.toString() !== questionId
        );
        await course.save();

        res.status(200).json({
            success: true,
            data: course,
            message: "Question retirée du cours",
        });
    }),

    // Get available questions to link (from ExamParYear)
    getAvailableQuestions: asyncHandler(async (req, res) => {
        const { moduleId, examParYearId } = req.query;

        let filter = {};
        
        if (examParYearId) {
            filter.examId = examParYearId;
        } else if (moduleId) {
            // Get all ExamParYear for this module
            const exams = await ExamParYear.find({ moduleId }).select("_id");
            const examIds = exams.map(e => e._id);
            filter.examId = { $in: examIds };
        }

        const questions = await Question.find(filter)
            .populate({
                path: "examId",
                select: "name year moduleId",
                populate: {
                    path: "moduleId",
                    select: "name",
                },
            })
            .sort({ createdAt: 1 });

        // Group by exam
        const grouped = {};
        questions.forEach((q, idx) => {
            const examName = q.examId?.name || "Unknown";
            if (!grouped[examName]) {
                grouped[examName] = {
                    examId: q.examId?._id,
                    examName,
                    year: q.examId?.year,
                    moduleName: q.examId?.moduleId?.name,
                    questions: [],
                };
            }
            grouped[examName].questions.push({
                _id: q._id,
                questionNumber: grouped[examName].questions.length + 1,
                text: q.text?.substring(0, 100) + (q.text?.length > 100 ? "..." : ""),
                sessionLabel: q.sessionLabel,
            });
        });

        res.status(200).json({
            success: true,
            data: Object.values(grouped),
        });
    }),

    // Get exam years for a module (for dropdown)
    getExamYearsForModule: asyncHandler(async (req, res) => {
        const { moduleId } = req.params;
        
        const examYears = await ExamParYear.find({ moduleId })
            .select("name year")
            .sort({ year: -1 });

        res.status(200).json({
            success: true,
            data: examYears,
        });
    }),

    // Get categories for a module (distinct values)
    getCategoriesForModule: asyncHandler(async (req, res) => {
        const { moduleId } = req.params;
        
        const categories = await ExamCourse.distinct("category", { moduleId });

        res.status(200).json({
            success: true,
            data: categories,
        });
    }),

    // Seed course categories (Admin only - for testing)
    createCategoriesForCourses: asyncHandler(async (req, res) => {
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

        // Get all modules to create sample exam courses with different categories
        const modules = await Module.find().limit(5);
        
        if (modules.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Aucun module trouvé. Veuillez créer des modules d'abord.",
            });
        }

        // Delete existing exam courses (optional - can be removed if you want to keep existing)
        const deleteResult = await ExamCourse.deleteMany({});

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
        
        // Get unique categories
        const uniqueCategories = [...new Set(createdCourses.map(c => c.category))];

        res.status(201).json({
            success: true,
            data: {
                categories: uniqueCategories,
                coursesCreated: createdCourses.length,
                coursesDeleted: deleteResult.deletedCount,
            },
            message: `${createdCourses.length} cours créés avec ${uniqueCategories.length} catégories`,
        });
    }),
};

// Helper function to parse question numbers like "1-5,7,10-12"
function parseQuestionNumbers(str) {
    if (!str) return [];
    const result = [];
    const parts = str.split(",");
    
    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes("-")) {
            const [start, end] = trimmed.split("-").map(n => parseInt(n.trim()));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    result.push(i);
                }
            }
        } else {
            const num = parseInt(trimmed);
            if (!isNaN(num)) {
                result.push(num);
            }
        }
    }
    
    return [...new Set(result)].sort((a, b) => a - b);
}
