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
        const { userId, questionId, title, contentText, imageUrl } = req.body;
        
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
            title,
            contentText,
            imageUrl,
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
            .populate('userId', 'name email') // Assuming user has these fields
            .populate('questionId');
        
        res.status(200).json({
            success: true,
            count: explanations.length,
            data: explanations
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
    })
};
