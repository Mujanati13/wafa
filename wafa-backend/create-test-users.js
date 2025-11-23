import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/userModel.js';

dotenv.config();

const createTestUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✓ Connected to MongoDB');

        // Create regular test user
        const testUserEmail = 'test@wafa.ma';
        let testUser = await User.findOne({ email: testUserEmail });
        
        if (!testUser) {
            const hashedPassword = await bcrypt.hash('Test123', 10);
            testUser = await User.create({
                username: 'testuser',
                name: 'Test User',
                email: testUserEmail,
                password: hashedPassword,
                isActive: true,
                isAdmin: false,
                emailVerified: true,
                emailVerificationToken: null,
                plan: 'Free',
                semesters: ['S1', 'S2', 'S3'],
                university: 'Université de Test',
                faculty: 'Faculté de Médecine',
                currentYear: 'S3',
                phoneNumber: '+212600000001'
            });
            console.log('✅ Created regular test user:');
            console.log('   Email: test@wafa.ma');
            console.log('   Password: Test123!@#');
            console.log('   Role: Student');
        } else {
            console.log('ℹ️  Regular test user already exists');
            console.log('   Email: test@wafa.ma');
        }

        // Create admin test user
        const adminUserEmail = 'admin@wafa.ma';
        let adminUser = await User.findOne({ email: adminUserEmail });
        
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('Admin123', 10);
            adminUser = await User.create({
                username: 'adminuser',
                name: 'Admin User',
                email: adminUserEmail,
                password: hashedPassword,
                isActive: true,
                isAdmin: true,
                emailVerified: true,
                emailVerificationToken: null,
                plan: 'Premium',
                planExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'],
                university: 'Université de Test',
                faculty: 'Faculté de Médecine',
                currentYear: 'S10',
                phoneNumber: '+212600000002'
            });
            console.log('✅ Created admin test user:');
            console.log('   Email: admin@wafa.ma');
            console.log('   Password: Admin123!@#');
            console.log('   Role: Administrator');
        } else {
            console.log('ℹ️  Admin test user already exists');
            console.log('   Email: admin@wafa.ma');
        }

        console.log('\n📋 Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Regular Test User:');
        console.log('  Email:    test@wafa.ma');
        console.log('  Password: Test123!@#');
        console.log('  Role:     Student');
        console.log('  Plan:     Free');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin Test User:');
        console.log('  Email:    admin@wafa.ma');
        console.log('  Password: Admin123!@#');
        console.log('  Role:     Administrator');
        console.log('  Plan:     Premium (1 year)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await mongoose.connection.close();
        console.log('\n✓ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test users:', error);
        process.exit(1);
    }
};

createTestUsers();
