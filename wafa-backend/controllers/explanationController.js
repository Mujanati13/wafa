import explanationModel from "../models/explanationModel.js";
import asyncHandler from '../handlers/asyncHandler.js';
import Point from "../models/pointModel.js";
import UserStats from "../models/userStatsModel.js";

// Constants
const MAX_EXPLANATIONS_PER_QUESTION = 3;
const LEVEL_REQUIRED_FOR_VOTING = 20;
const APPROVED_EXPLANATION_VOTE_WEIGHT_MULTIPLIER = 20;

export const explanationController = {
    create: asyncHandler(async (req, res) => {
        const { questionId, title, contentText } = req.body;
        const userId = req.user._id; // Get from authenticated user

        // Process uploaded files
        let imageUrls = [];
        let pdfUrl = null;

        if (req.files) {
            // Handle images (max 5)
            if (req.files.images) {
                imageUrls = req.files.images.map(file => `/uploads/explanations/${file.filename}`);
            }
            // Handle PDF (max 1)
            if (req.files.pdf && req.files.pdf.length > 0) {
                pdfUrl = `/uploads/explanations/${req.files.pdf[0].filename}`;
            }
        }

        // Check if max explanations limit reached for this question
        const existingCount = await explanationModel.countDocuments({
            questionId,
            isAiGenerated: false
        });

        if (existingCount >= MAX_EXPLANATIONS_PER_QUESTION) {
            return res.status(400).json({
                success: false,
                message: `Le nombre maximum d'explications (${MAX_EXPLANATIONS_PER_QUESTION}) a été atteint pour cette question.`,
                maxReached: true
            });
        }

        // Check if user already has an explanation for this question
        const userExplanation = await explanationModel.findOne({ userId, questionId });
        if (userExplanation) {
            return res.status(400).json({
                success: false,
                message: "Vous avez déjà soumis une explication pour cette question."
            });
        }

        const newExplanation = await explanationModel.create({
            userId,
            questionId,
            title: title || "Explication utilisateur",
            contentText,
            imageUrls, // Array of image URLs
            pdfUrl,    // Single PDF URL
            status: "pending",
            isAiGenerated: false
        });
        res.status(201).json({
            success: true,
            data: newExplanation,
            remainingSlots: MAX_EXPLANATIONS_PER_QUESTION - existingCount - 1
        });
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { title, contentText, imageUrl, status } = req.body;

        const updatedExplanation = await explanationModel.findByIdAndUpdate(
            id,
            {
                title,
                contentText,
                imageUrl,
                status
            },
            { new: true, runValidators: true }
        );

        if (!updatedExplanation) {
            return res.status(404).json({
                success: false,
                message: "Explanation not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedExplanation
        });
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const deletedExplanation = await explanationModel.findByIdAndDelete(id);

        if (!deletedExplanation) {
            return res.status(404).json({
                success: false,
                message: "Explanation not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Explanation deleted successfully"
        });
    }),

    getAll: asyncHandler(async (req, res) => {
        const explanations = await explanationModel.find()
            .populate('userId', 'name email')
            .populate({
                path: 'questionId',
                select: 'text examId sessionLabel',
                populate: {
                    path: 'examId',
                    select: 'name year moduleId category courseName totalQuestions linkedQuestions',
                    populate: {
                        path: 'moduleId',
                        select: 'name category'
                    }
                }
            })
            .lean();

        // Shape the data to include module and exam info
        const shaped = explanations.map((item) => ({
            ...item,
            // Module info
            moduleName: item.questionId?.examId?.moduleId?.name || null,
            moduleCategory: item.questionId?.examId?.moduleId?.category || null,
            // Exam/Course info
            examName: item.questionId?.examId?.name || null,
            examYear: item.questionId?.examId?.year || null,
            courseCategory: item.questionId?.examId?.category || null,
            courseName: item.questionId?.examId?.courseName || item.questionId?.examId?.name || null,
            // Number of questions
            numberOfQuestions: item.questionId?.examId?.totalQuestions ||
                item.questionId?.examId?.linkedQuestions?.length || null,
            // Question session label
            sessionLabel: item.questionId?.sessionLabel || null,
        }));

        res.status(200).json({
            success: true,
            count: shaped.length,
            data: shaped
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const explanation = await explanationModel.findById(id)
            .populate('userId', 'name email')
            .populate('questionId');

        if (!explanation) {
            return res.status(404).json({
                success: false,
                message: "Explanation not found"
            });
        }

        res.status(200).json({
            success: true,
            data: explanation
        });
    }),

    // Additional method to get explanations by question ID
    getByQuestionId: asyncHandler(async (req, res) => {
        const { questionId } = req.params;

        const explanations = await explanationModel.find({ questionId })
            .populate('userId', 'name email')
            .populate('questionId');

        res.status(200).json({
            success: true,
            count: explanations.length,
            data: explanations
        });
    }),

    // Additional method to update explanation status
    updateStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const updatedExplanation = await explanationModel.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedExplanation) {
            return res.status(404).json({
                success: false,
                message: "Explanation not found"
            });
        }

        // If explanation is approved, award blue points to the user
        if (status === 'approved') {
            try {
                await Point.create({
                    userId: updatedExplanation.userId,
                    type: 'bluePoints',
                    amount: 1,
                    questionId: updatedExplanation.questionId,
                    description: 'Explication approuvée'
                });
            } catch (error) {
                console.error('Error awarding blue points:', error);
            }
        }

        res.status(200).json({
            success: true,
            data: updatedExplanation
        });
    }),

    // Vote on an explanation (with Level 20 restriction)
    vote: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { vote } = req.body; // 'up' or 'down'
        const userId = req.user._id;

        if (!['up', 'down'].includes(vote)) {
            return res.status(400).json({
                success: false,
                message: "Vote invalide. Utilisez 'up' ou 'down'."
            });
        }

        // Check user's level in the module (Level 20 = 20% progress required)
        const userStats = await UserStats.findOne({ userId });
        const userLevel = userStats?.overallLevel || 0;

        if (userLevel < LEVEL_REQUIRED_FOR_VOTING) {
            return res.status(403).json({
                success: false,
                message: `Vous devez atteindre le niveau ${LEVEL_REQUIRED_FOR_VOTING} pour voter.`,
                requiredLevel: LEVEL_REQUIRED_FOR_VOTING,
                currentLevel: userLevel
            });
        }

        const explanation = await explanationModel.findById(id);
        if (!explanation) {
            return res.status(404).json({
                success: false,
                message: "Explication non trouvée"
            });
        }

        // Check if user already voted
        const existingVoteIndex = explanation.voters.findIndex(
            v => v.userId.toString() === userId.toString()
        );

        // Calculate vote weight (multiplied by 20 if user has approved explanations)
        const approvedExplanationsCount = await explanationModel.countDocuments({
            userId,
            status: 'approved'
        });
        const voteWeight = approvedExplanationsCount > 0
            ? APPROVED_EXPLANATION_VOTE_WEIGHT_MULTIPLIER
            : 1;

        if (existingVoteIndex !== -1) {
            // User already voted - update vote
            const oldVote = explanation.voters[existingVoteIndex].vote;
            const oldWeight = explanation.voters[existingVoteIndex].weight;

            if (oldVote === vote) {
                return res.status(400).json({
                    success: false,
                    message: "Vous avez déjà voté de cette façon."
                });
            }

            // Remove old vote count
            if (oldVote === 'up') {
                explanation.upvotes -= oldWeight;
            } else {
                explanation.downvotes -= oldWeight;
            }

            // Update voter record
            explanation.voters[existingVoteIndex].vote = vote;
            explanation.voters[existingVoteIndex].weight = voteWeight;
            explanation.voters[existingVoteIndex].votedAt = new Date();
        } else {
            // New vote
            explanation.voters.push({
                userId,
                vote,
                weight: voteWeight,
                votedAt: new Date()
            });
        }

        // Add new vote count
        if (vote === 'up') {
            explanation.upvotes += voteWeight;
        } else {
            explanation.downvotes += voteWeight;
        }

        await explanation.save();

        res.status(200).json({
            success: true,
            data: {
                upvotes: explanation.upvotes,
                downvotes: explanation.downvotes,
                userVote: vote,
                voteWeight
            }
        });
    }),

    // Get explanation slots info for a question
    getSlotsInfo: asyncHandler(async (req, res) => {
        const { questionId } = req.params;

        const userExplanations = await explanationModel.countDocuments({
            questionId,
            isAiGenerated: false
        });
        const aiExplanation = await explanationModel.findOne({
            questionId,
            isAiGenerated: true
        });

        res.status(200).json({
            success: true,
            data: {
                maxSlots: MAX_EXPLANATIONS_PER_QUESTION,
                usedSlots: userExplanations,
                remainingSlots: MAX_EXPLANATIONS_PER_QUESTION - userExplanations,
                hasAiExplanation: !!aiExplanation
            }
        });
    }),

    // Create AI-generated explanation (admin only)
    createAiExplanation: asyncHandler(async (req, res) => {
        const { questionId, title, contentText, aiProvider } = req.body;

        // Check if AI explanation already exists
        const existingAi = await explanationModel.findOne({
            questionId,
            isAiGenerated: true
        });

        if (existingAi) {
            return res.status(400).json({
                success: false,
                message: "Une explication IA existe déjà pour cette question."
            });
        }

        const aiExplanation = await explanationModel.create({
            userId: req.user._id, // Admin who created it
            questionId,
            title: title || "Explication IA",
            contentText,
            isAiGenerated: true,
            aiProvider: aiProvider || 'deepseek',
            status: 'approved' // AI explanations are auto-approved
        });

        res.status(201).json({
            success: true,
            data: aiExplanation
        });
    }),

    // Admin bulk create explanations (with file upload)
    adminCreate: asyncHandler(async (req, res) => {
        const { 
            moduleId, 
            examId, 
            questionNumbers, 
            title, 
            contentText,
            imageUrls: bodyImageUrls,
            pdfUrl: bodyPdfUrl
        } = req.body;
        const userId = req.user._id;

        // Helper function to parse question number ranges like "1-5,7,10"
        const parseQuestionNumbers = (input) => {
            if (Array.isArray(input)) return input.map(n => parseInt(n));
            if (typeof input !== 'string') return [];
            
            const numbers = [];
            const parts = input.split(',').map(p => p.trim());
            
            for (const part of parts) {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) {
                            numbers.push(i);
                        }
                    }
                } else {
                    const num = parseInt(part);
                    if (!isNaN(num)) numbers.push(num);
                }
            }
            
            return [...new Set(numbers)]; // Remove duplicates
        };

        const parsedQuestionNumbers = parseQuestionNumbers(questionNumbers);

        if (parsedQuestionNumbers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Veuillez spécifier au moins un numéro de question valide."
            });
        }

        // Process uploaded files or use URLs from body
        let imageUrls = bodyImageUrls ? (Array.isArray(bodyImageUrls) ? bodyImageUrls : [bodyImageUrls]) : [];
        let pdfUrl = bodyPdfUrl || null;

        if (req.files) {
            // Handle images (max 5)
            if (req.files.images) {
                imageUrls = req.files.images.map(file => `/uploads/explanations/${file.filename}`);
            }
            // Handle PDF (max 1)
            if (req.files.pdf && req.files.pdf.length > 0) {
                pdfUrl = `/uploads/explanations/${req.files.pdf[0].filename}`;
            }
        }

        // Import Question model to find questions by position (1-indexed)
        const Question = (await import('../models/questionModule.js')).default;

        // Get all questions for this exam sorted by creation order
        const allQuestions = await Question.find({ examId }).sort({ createdAt: 1 }).lean();

        if (allQuestions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Aucune question trouvée pour cet examen."
            });
        }

        // Get questions by their position (1-indexed numbers from user input)
        const questions = parsedQuestionNumbers
            .filter(num => num > 0 && num <= allQuestions.length)
            .map(num => allQuestions[num - 1]); // Convert to 0-indexed

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Aucune question trouvée pour les numéros spécifiés. L'examen contient ${allQuestions.length} question(s).`
            });
        }

        // Create explanations for each question
        const createdExplanations = [];
        const errors = [];

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const questionNum = parsedQuestionNumbers[i]; // Keep track of original question number
            
            try {
                // Check if explanation already exists for this question by this admin
                const existing = await explanationModel.findOne({ 
                    questionId: question._id,
                    userId
                });

                if (existing) {
                    errors.push({
                        questionNumber: questionNum,
                        error: "Une explication existe déjà pour cette question."
                    });
                    continue;
                }

                const explanation = await explanationModel.create({
                    userId,
                    questionId: question._id,
                    title: title || `Explication Q${questionNum}`,
                    contentText,
                    imageUrls,
                    pdfUrl,
                    status: 'approved', // Admin explanations are auto-approved
                    isAiGenerated: false
                });

                createdExplanations.push(explanation);
            } catch (error) {
                errors.push({
                    questionNumber: questionNum,
                    error: error.message
                });
            }
        }

        // Find which question numbers were out of range
        const notFoundNumbers = parsedQuestionNumbers.filter(
            num => num < 1 || num > allQuestions.length
        );

        res.status(201).json({
            success: true,
            message: `${createdExplanations.length} explication(s) créée(s) avec succès.`,
            data: createdExplanations,
            errors: errors.length > 0 ? errors : undefined,
            notFound: notFoundNumbers.length > 0 ? notFoundNumbers : undefined,
            totalQuestionsInExam: allQuestions.length
        });
    })
};
