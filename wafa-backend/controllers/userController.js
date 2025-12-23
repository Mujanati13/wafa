import User from "../models/userModel.js";
import UserStats from "../models/userStatsModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../middleware/uploadMiddleware.js";
import asyncHandler from "../handlers/asyncHandler.js";
import { NotificationController } from "./notificationController.js";

export const UserController = {
    // Get all users with pagination
    getAllUsers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const users = await User.find({})
                .select('-password -resetCode')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalUsers = await User.countDocuments({});
            const totalPages = Math.ceil(totalUsers / limit);

            res.status(200).json({
                success: true,
                data: {
                    users,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalUsers,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users',
                error: error.message
            });
        }
    },

    // Get free users (plan: "Free")
    getFreeUsers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const users = await User.find({ plan: "Free" })
                .select('-password -resetCode')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalFreeUsers = await User.countDocuments({ plan: "Free" });
            const totalPages = Math.ceil(totalFreeUsers / limit);

            res.status(200).json({
                success: true,
                data: {
                    users,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalUsers: totalFreeUsers,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching free users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch free users',
                error: error.message
            });
        }
    },

    // Get paying users (plan: not "Free")
    getPayingUsers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const users = await User.find({ plan: { $ne: "Free" } })
                .select('-password -resetCode')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Get payment method for each user from their latest completed transaction
            const Transaction = (await import('../models/transactionModel.js')).default;

            const usersWithPayment = await Promise.all(users.map(async (user) => {
                const latestTransaction = await Transaction.findOne({
                    user: user._id,
                    status: 'completed'
                })
                    .sort({ createdAt: -1 })
                    .select('paymentMethod');

                return {
                    ...user.toObject(),
                    paymentMethod: latestTransaction?.paymentMethod || 'Contact'
                };
            }));

            const totalPayingUsers = await User.countDocuments({ plan: { $ne: "Free" } });
            const totalPages = Math.ceil(totalPayingUsers / limit);

            res.status(200).json({
                success: true,
                data: {
                    users: usersWithPayment,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalUsers: totalPayingUsers,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching paying users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch paying users',
                error: error.message
            });
        }
    },

    // Get user statistics
    getUserStats: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments({});
            const freeUsers = await User.countDocuments({ plan: "Free" });
            const payingUsers = await User.countDocuments({ plan: { $ne: "Free" } });
            const activeUsers = await User.countDocuments({ isAactive: true });
            const adminUsers = await User.countDocuments({ isAdmin: true });

            // Plan breakdown
            const planBreakdown = await User.aggregate([
                {
                    $group: {
                        _id: "$plan",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);

            res.status(200).json({
                success: true,
                data: {
                    totalUsers,
                    freeUsers,
                    payingUsers,
                    activeUsers,
                    adminUsers,
                    planBreakdown
                }
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user statistics',
                error: error.message
            });
        }
    },

    // Update user plan
    updateUserPlan: async (req, res) => {
        try {
            const { userId } = req.params;
            const { plan } = req.body;

            if (!plan || !["Free", "Premium", "Enterprise", "Student Discount"].includes(plan)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid plan type'
                });
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { plan },
                { new: true, runValidators: true }
            ).select('-password -resetCode');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User plan updated successfully',
                data: user
            });
        } catch (error) {
            console.error('Error updating user plan:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user plan',
                error: error.message
            });
        }
    },

    // Toggle user active status
    toggleUserStatus: async (req, res) => {
        try {
            const { userId } = req.params;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            user.isAactive = !user.isAactive;
            await user.save();

            res.status(200).json({
                success: true,
                message: `User ${user.isAactive ? 'activated' : 'deactivated'} successfully`,
                data: {
                    userId: user._id,
                    isActive: user.isAactive
                }
            });
        } catch (error) {
            console.error('Error toggling user status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle user status',
                error: error.message
            });
        }
    },

    // Update user (admin: role, permissions, etc.)
    updateUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const updateData = req.body;

            // Allowed fields for update
            const allowedFields = ['isAdmin', 'adminRole', 'permissions', 'plan', 'isAactive'];
            const updates = {};

            allowedFields.forEach(field => {
                if (updateData.hasOwnProperty(field)) {
                    updates[field] = updateData[field];
                }
            });

            const user = await User.findByIdAndUpdate(userId, updates, { new: true })
                .select('-password -resetCode');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user',
                error: error.message
            });
        }
    },

    // Delete user (admin only)
    deleteUser: async (req, res) => {
        try {
            const { userId } = req.params;

            const user = await User.findByIdAndDelete(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Also delete user stats if exists
            try {
                await UserStats.deleteOne({ userId: userId });
            } catch (e) {
                console.log('No user stats to delete or error:', e.message);
            }

            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: error.message
            });
        }
    },

    // Upload profile picture
    uploadProfilePicture: asyncHandler(async (req, res) => {
        if (!req.file) {
            res.status(400);
            throw new Error("Aucun fichier téléchargé");
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error("Utilisateur non trouvé");
        }

        // Delete old profile picture from Cloudinary if exists
        if (user.profilePicture) {
            const publicId = user.profilePicture.split("/").pop().split(".")[0];
            await deleteFromCloudinary(`wafa-profiles/${publicId}`);
        }

        // Upload new picture to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer);

        user.profilePicture = result.secure_url;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Photo de profil mise à jour avec succès",
            data: {
                profilePicture: user.profilePicture,
            },
        });
    }),

    // Update profile
    updateProfile: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error("Utilisateur non trouvé");
        }

        const { name, email, phone, dateOfBirth, address, university, faculty, currentYear, studentId, bio } = req.body;

        // Update only provided fields
        if (name) user.name = name;
        if (email && email !== user.email) {
            // Check if email is already taken
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                res.status(400);
                throw new Error("Cet email est déjà utilisé");
            }
            user.email = email;
            user.emailVerified = false; // Require re-verification
        }
        if (phone !== undefined) user.phone = phone;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (address !== undefined) user.address = address;
        if (university !== undefined) user.university = university;
        if (faculty !== undefined) user.faculty = faculty;
        if (currentYear !== undefined) user.currentYear = currentYear;
        if (studentId !== undefined) user.studentId = studentId;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profil mis à jour avec succès",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    dateOfBirth: user.dateOfBirth,
                    address: user.address,
                    university: user.university,
                    faculty: user.faculty,
                    currentYear: user.currentYear,
                    studentId: user.studentId,
                    bio: user.bio,
                    profilePicture: user.profilePicture,
                    emailVerified: user.emailVerified,
                },
            },
        });
    }),

    // Get current user profile
    getProfile: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id).select("-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires");

        if (!user) {
            res.status(404);
            throw new Error("Utilisateur non trouvé");
        }

        res.status(200).json({
            success: true,
            data: { user },
        });
    }),

    // Get current user's stats and achievements
    getMyStats: asyncHandler(async (req, res) => {
        const UserStats = (await import("../models/userStatsModel.js")).default;

        let userStats = await UserStats.findOne({ userId: req.user._id });

        // If no stats exist, create default stats
        if (!userStats) {
            userStats = await UserStats.create({
                userId: req.user._id,
                totalExams: 0,
                averageScore: 0,
                totalScore: 0,
                studyHours: 0,
                rank: 0,
                achievements: []
            });
        }

        // Calculate additional stats
        const stats = {
            examsCompleted: userStats.totalExams || 0,
            averageScore: userStats.averageScore || 0,
            studyHours: userStats.studyHours || 0,
            rank: userStats.rank || 0,
            achievements: userStats.achievements || [],
            moduleProgress: userStats.moduleProgress || []
        };

        res.status(200).json({
            success: true,
            data: { stats },
        });
    }),

    // Get user's subscription information
    getSubscriptionInfo: asyncHandler(async (req, res) => {
        const userId = req.user._id;

        const user = await User.findById(userId).select('plan subscription email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                plan: user.plan || 'Free',
                subscription: user.subscription || null,
                email: user.email
            }
        });
    }),

    // Unlock achievement and send notification
    unlockAchievement: asyncHandler(async (req, res) => {
        const { userId, achievementName, achievementDescription } = req.body;

        if (!userId || !achievementName) {
            return res.status(400).json({
                success: false,
                message: "User ID and achievement name are required"
            });
        }

        // You would typically get UserStats model here
        // For now, sending notification
        try {
            await NotificationController.createNotification(
                userId,
                "achievement",
                "Nouveau badge débloqué !",
                `Félicitations ! Vous avez débloqué le badge '${achievementName}'. ${achievementDescription || ''}`,
                "/dashboard/profile"
            );

            res.status(200).json({
                success: true,
                message: "Achievement unlocked and notification sent",
                achievement: {
                    name: achievementName,
                    description: achievementDescription
                }
            });
        } catch (error) {
            console.error("Error unlocking achievement:", error);
            res.status(500).json({
                success: false,
                message: "Error unlocking achievement"
            });
        }
    }),

    // Get leaderboard for public display
    getLeaderboard: asyncHandler(async (req, res) => {
        const { limit = 20 } = req.query;

        try {
            const leaderboard = await UserStats.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $match: {
                        'user.isAactive': true
                    }
                },
                {
                    $project: {
                        userId: '$userId',
                        username: '$user.username',
                        name: '$user.name',
                        email: '$user.email',
                        points: { $ifNull: ['$totalPoints', 0] },
                        bluePoints: { $ifNull: ['$bluePoints', 0] },
                        totalExams: { $ifNull: ['$totalExams', 0] },
                        averageScore: { $ifNull: ['$averageScore', 0] },
                        studyHours: { $ifNull: ['$studyHours', 0] }
                    }
                },
                {
                    $sort: { points: -1 }
                },
                {
                    $limit: parseInt(limit)
                }
            ]);

            res.status(200).json({
                success: true,
                data: {
                    leaderboard: leaderboard.map((entry, index) => ({
                        ...entry,
                        rank: index + 1
                    }))
                }
            });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch leaderboard',
                error: error.message
            });
        }
    })
};
