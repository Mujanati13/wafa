import mongoose from "mongoose";
import User from "../models/userModel.js";
import UserStats from "../models/userStatsModel.js";
import { saveProfilePictureLocally, deleteFromLocalStorage } from "../middleware/uploadMiddleware.js";
import asyncHandler from "../handlers/asyncHandler.js";
import { NotificationController } from "./notificationController.js";
import admin from "../config/firebase.js";
import bcrypt from "bcrypt";

export const UserController = {
    // Admin create user - creates user with Firebase and MongoDB
    createAdminUser: async (req, res) => {
        try {
            const { 
                firstName, 
                lastName, 
                email, 
                password, 
                phone,
                plan = "Free",
                currentYear,
                semesters = [],
                paymentMode,
                isPaid = false,
                sendPasswordEmail = true
            } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'First name, last name, email and password are required'
                });
            }

            // Check if user already exists in MongoDB
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'A user with this email already exists'
                });
            }

            // Generate username
            const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}_${Math.random().toString(36).substring(7)}`;
            const name = `${firstName} ${lastName}`;

            // Create Firebase user if Firebase is initialized
            let firebaseUid = null;
            let firebaseCreated = false;
            let firebaseErrorDetail = null;
            try {
                // Check if Firebase Admin SDK is properly initialized
                const firebaseInitialized = admin && admin.apps && admin.apps.length > 0;
                console.log('Firebase initialized:', firebaseInitialized);
                
                if (firebaseInitialized) {
                    const firebaseUser = await admin.auth().createUser({
                        email: email,
                        password: password,
                        displayName: name,
                        emailVerified: true, // Admin-created users are pre-verified
                    });
                    firebaseUid = firebaseUser.uid;
                    firebaseCreated = true;
                    console.log('✅ Firebase user created:', firebaseUid);
                } else {
                    console.log('⚠️ Firebase not initialized - user will only be created in MongoDB');
                    firebaseErrorDetail = 'Firebase not initialized';
                }
            } catch (firebaseError) {
                console.error('Firebase user creation error:', firebaseError.code, firebaseError.message);
                firebaseErrorDetail = firebaseError.message;
                
                // If Firebase user exists, try to get their UID and update password
                if (firebaseError.code === 'auth/email-already-exists') {
                    try {
                        const existingFirebaseUser = await admin.auth().getUserByEmail(email);
                        firebaseUid = existingFirebaseUser.uid;
                        // Update the existing Firebase user's password and mark as verified
                        await admin.auth().updateUser(firebaseUid, {
                            password: password,
                            emailVerified: true,
                            displayName: name,
                        });
                        firebaseCreated = true;
                        firebaseErrorDetail = null;
                        console.log('✅ Existing Firebase user updated:', firebaseUid);
                    } catch (e) {
                        console.error('Could not update existing Firebase user:', e.message);
                        firebaseErrorDetail = e.message;
                    }
                }
            }

            // If Firebase was not created successfully, return error
            if (!firebaseCreated) {
                return res.status(500).json({
                    success: false,
                    message: `Firebase authentication could not be set up. Error: ${firebaseErrorDetail || 'Unknown error'}. Please regenerate the Firebase service account key.`,
                    firebaseError: true,
                    detail: firebaseErrorDetail
                });
            }

            // Hash password for MongoDB
            const hashedPassword = await bcrypt.hash(password, 10);

            // Prepare user data
            const userData = {
                username,
                name,
                email,
                password: hashedPassword,
                phone: phone || null,
                plan,
                currentYear: currentYear || null,
                semesters: semesters || [],
                emailVerified: true, // Admin-created users are pre-verified
                isAactive: true,
                firebaseUid,
            };

            // Add payment-related fields if user is paid
            if (isPaid && plan !== "Free") {
                userData.paymentMode = paymentMode || "Manual";
                userData.paymentDate = new Date();
                userData.approvalDate = new Date();
                
                // Set plan expiry based on plan type
                const now = new Date();
                if (plan === "Premium") {
                    // 6 months for semester plan
                    userData.planExpiry = new Date(now.setMonth(now.getMonth() + 6));
                } else if (plan === "Premium Annuel") {
                    // 12 months for annual plan
                    userData.planExpiry = new Date(now.setMonth(now.getMonth() + 12));
                }
            }

            // Create user in MongoDB
            const newUser = await User.create(userData);

            res.status(201).json({
                success: true,
                message: 'User created successfully' + (firebaseCreated ? ' (Firebase + MongoDB)' : ' (MongoDB only - login may not work)'),
                data: {
                    user: {
                        _id: newUser._id,
                        username: newUser.username,
                        name: newUser.name,
                        email: newUser.email,
                        plan: newUser.plan,
                        currentYear: newUser.currentYear,
                        semesters: newUser.semesters,
                        paymentMode: newUser.paymentMode,
                        paymentDate: newUser.paymentDate,
                        approvalDate: newUser.approvalDate,
                        planExpiry: newUser.planExpiry,
                        isAactive: newUser.isAactive,
                        emailVerified: newUser.emailVerified,
                        firebaseCreated: firebaseCreated,
                    }
                }
            });

        } catch (error) {
            console.error('Error creating admin user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create user',
                error: error.message
            });
        }
    },

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

            // Get payment method for each user - first from user document, then from transactions
            const Transaction = (await import('../models/transactionModel.js')).default;

            const usersWithPayment = await Promise.all(users.map(async (user) => {
                // First check if user has paymentMode directly set
                if (user.paymentMode) {
                    return {
                        ...user.toObject(),
                        paymentMethod: user.paymentMode
                    };
                }
                
                // Fall back to getting from latest transaction
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

            // Allowed fields for update - expanded to include all user fields
            const allowedFields = [
                'isAdmin', 'adminRole', 'permissions', 'plan', 'isAactive',
                'name', 'email', 'currentYear', 'semesters',
                'paymentDate', 'approvalDate', 'planExpiry', 'paymentMode',
                'phone', 'university', 'faculty'
            ];
            const updates = {};

            allowedFields.forEach(field => {
                if (updateData.hasOwnProperty(field)) {
                    updates[field] = updateData[field];
                }
            });

            // If email is being updated, check if it's already taken
            if (updates.email) {
                const existingUser = await User.findOne({ 
                    email: updates.email, 
                    _id: { $ne: userId } 
                });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email is already in use by another user'
                    });
                }
            }

            const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true })
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

        // Delete old profile picture from local storage if exists
        if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
            await deleteFromLocalStorage(user.profilePicture);
        }

        // Upload new picture to Cloudinary
        const result = await saveProfilePictureLocally(req.file.buffer, req.user._id);

        user.profilePicture = result.secure_url;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Photo de profil mise à jour avec succès",
            profilePicture: user.profilePicture,
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
        const { limit = 20, sortBy = 'totalPoints', userId } = req.query;

        try {
            // Get total questions count for percentage calculation
            const Question = mongoose.model('Question');
            const totalQuestionsInSystem = await Question.countDocuments({});

            // Define sort field based on filter
            let sortField = '$totalPoints';
            if (sortBy === 'bluePoints') sortField = '$bluePoints';
            else if (sortBy === 'greenPoints') sortField = '$greenPoints';
            else if (sortBy === 'level') sortField = '$totalPoints'; // Level is based on totalPoints
            else if (sortBy === 'percentage') sortField = '$percentageAnswered';

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
                    $addFields: {
                        // Calculate level: 1 level = 50 points
                        level: { 
                            $floor: { 
                                $divide: [{ $ifNull: ['$totalPoints', 0] }, 50] 
                            } 
                        },
                        // Calculate percentage: questionsAnswered / totalQuestionsInSystem * 100
                        percentageCalculated: {
                            $cond: {
                                if: { $gt: [totalQuestionsInSystem, 0] },
                                then: {
                                    $multiply: [
                                        { $divide: [{ $ifNull: ['$questionsAnswered', 0] }, totalQuestionsInSystem] },
                                        100
                                    ]
                                },
                                else: 0
                            }
                        }
                    }
                },
                {
                    $project: {
                        odUserId: '$userId',
                        odUserIdStr: { $toString: '$userId' },
                        username: '$user.username',
                        name: '$user.name',
                        email: '$user.email',
                        currentYear: '$user.currentYear',
                        profilePicture: '$user.profilePicture',
                        points: { $ifNull: ['$totalPoints', 0] },
                        totalPoints: { $ifNull: ['$totalPoints', 0] },
                        bluePoints: { $ifNull: ['$bluePoints', 0] },
                        greenPoints: { $ifNull: ['$greenPoints', 0] },
                        level: '$level',
                        questionsAnswered: { $ifNull: ['$questionsAnswered', 0] },
                        correctAnswers: { $ifNull: ['$correctAnswers', 0] },
                        percentageAnswered: { $round: ['$percentageCalculated', 1] },
                        totalExams: { $ifNull: ['$totalExamsCompleted', 0] },
                        averageScore: { $ifNull: ['$averageScore', 0] },
                        sortValue: sortField === '$totalPoints' ? { $ifNull: ['$totalPoints', 0] } :
                                   sortField === '$bluePoints' ? { $ifNull: ['$bluePoints', 0] } :
                                   sortField === '$greenPoints' ? { $ifNull: ['$greenPoints', 0] } :
                                   sortField === '$percentageAnswered' ? '$percentageCalculated' :
                                   { $ifNull: ['$totalPoints', 0] }
                    }
                },
                {
                    $sort: { sortValue: -1, totalPoints: -1 }
                }
            ]);

            // Add ranks
            const rankedLeaderboard = leaderboard.map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));

            // If userId provided, find user's position and get context
            let userContext = null;
            if (userId) {
                const userIndex = rankedLeaderboard.findIndex(u => u.odUserIdStr === userId);
                if (userIndex !== -1) {
                    // Get 5 users before and after current user
                    const startIndex = Math.max(0, userIndex - 5);
                    const endIndex = Math.min(rankedLeaderboard.length, userIndex + 6);
                    userContext = {
                        userRank: userIndex + 1,
                        nearbyUsers: rankedLeaderboard.slice(startIndex, endIndex)
                    };
                }
            }

            // Return top 20 + user context
            const top20 = rankedLeaderboard.slice(0, parseInt(limit));

            res.status(200).json({
                success: true,
                data: {
                    leaderboard: top20,
                    userContext,
                    totalUsers: rankedLeaderboard.length,
                    totalQuestionsInSystem
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
