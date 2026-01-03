/**
 * Test script to verify sub-admin creation and login functionality
 * 
 * This script:
 * 1. Creates a test user
 * 2. Promotes user to admin with specific role and permissions
 * 3. Verifies the admin can login
 * 4. Verifies admin has correct permissions
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Import User model directly
const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    isAdmin: Boolean,
    adminRole: String,
    permissions: [String],
    emailVerified: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/wafa';
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'default-secret';

// Test data
const testUser = {
    username: 'test.subadmin',
    name: 'Test SubAdmin',
    email: 'test.subadmin@wafa.test',
    password: 'TestPassword123!',
    adminRole: 'moderator',
    permissions: ['users', 'content', 'reports']
};

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function cleanup() {
    try {
        // Delete test user if exists
        const deleted = await User.deleteOne({ email: testUser.email });
        if (deleted.deletedCount > 0) {
            console.log('🧹 Cleaned up existing test user');
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

async function createTestUser() {
    try {
        console.log('\n📝 Step 1: Creating test user...');
        
        const hashedPassword = await bcrypt.hash(testUser.password, 10);
        
        const newUser = await User.create({
            username: testUser.username,
            name: testUser.name,
            email: testUser.email,
            password: hashedPassword,
            emailVerified: true,
            isAdmin: false,
        });
        
        console.log('✅ Test user created:', {
            id: newUser._id,
            email: newUser.email,
            isAdmin: newUser.isAdmin
        });
        
        return newUser;
    } catch (error) {
        console.error('❌ Error creating test user:', error.message);
        throw error;
    }
}

async function promoteToAdmin(userId) {
    try {
        console.log('\n👑 Step 2: Promoting user to admin...');
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                isAdmin: true,
                adminRole: testUser.adminRole,
                permissions: testUser.permissions
            },
            { new: true }
        ).select('-password');
        
        console.log('✅ User promoted to admin:', {
            id: updatedUser._id,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            adminRole: updatedUser.adminRole,
            permissions: updatedUser.permissions
        });
        
        return updatedUser;
    } catch (error) {
        console.error('❌ Error promoting user:', error.message);
        throw error;
    }
}

async function testLogin() {
    try {
        console.log('\n🔐 Step 3: Testing login...');
        
        // Find user by email
        const user = await User.findOne({ email: testUser.email });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(testUser.password, user.password);
        
        if (!isPasswordValid) {
            throw new Error('Password verification failed');
        }
        
        console.log('✅ Password verification successful');
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                isAdmin: user.isAdmin 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log('✅ JWT token generated successfully');
        
        return { user, token };
    } catch (error) {
        console.error('❌ Login test failed:', error.message);
        throw error;
    }
}

async function verifyAdminAccess(userId) {
    try {
        console.log('\n✔️  Step 4: Verifying admin access...');
        
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Check admin status
        if (!user.isAdmin) {
            throw new Error('User is not an admin');
        }
        
        // Check admin role
        if (user.adminRole !== testUser.adminRole) {
            throw new Error(`Admin role mismatch: expected ${testUser.adminRole}, got ${user.adminRole}`);
        }
        
        // Check permissions
        const hasAllPermissions = testUser.permissions.every(perm => 
            user.permissions.includes(perm)
        );
        
        if (!hasAllPermissions) {
            throw new Error('Permissions mismatch');
        }
        
        console.log('✅ Admin access verified:', {
            isAdmin: user.isAdmin,
            adminRole: user.adminRole,
            permissions: user.permissions
        });
        
        return true;
    } catch (error) {
        console.error('❌ Admin access verification failed:', error.message);
        throw error;
    }
}

async function runTests() {
    try {
        await connectDB();
        await cleanup();
        
        console.log('\n🚀 Starting Sub-Admin Tests...');
        console.log('================================\n');
        
        // Step 1: Create test user
        const user = await createTestUser();
        
        // Step 2: Promote to admin
        await promoteToAdmin(user._id);
        
        // Step 3: Test login
        const { token } = await testLogin();
        
        // Step 4: Verify admin access
        await verifyAdminAccess(user._id);
        
        console.log('\n================================');
        console.log('✅ All tests passed successfully!');
        console.log('================================\n');
        
        console.log('📋 Test Summary:');
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Password: ${testUser.password}`);
        console.log(`   Role: ${testUser.adminRole}`);
        console.log(`   Permissions: ${testUser.permissions.join(', ')}`);
        console.log(`   Token: ${token.substring(0, 30)}...`);
        
        console.log('\n💡 You can now login with these credentials in the frontend!');
        console.log('   Note: This test user will remain in the database.');
        console.log('   Run this script with cleanup to remove it.\n');
        
    } catch (error) {
        console.error('\n❌ Tests failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run tests
runTests();
