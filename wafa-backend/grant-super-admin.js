import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

async function grantSuperAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB');

        const email = 'admin@wafa.com';
        
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            process.exit(1);
        }

        // Grant super admin access
        user.isAdmin = true;
        user.adminRole = 'super_admin';
        user.permissions = ['users', 'content', 'analytics', 'payments', 'notifications', 'reports', 'settings'];
        
        await user.save();
        
        console.log('✅ Super admin access granted successfully!');
        console.log('📧 Email:', user.email);
        console.log('👤 Username:', user.username);
        console.log('🔑 Admin Role:', user.adminRole);
        console.log('🎯 Permissions:', user.permissions);
        console.log('\n🎉 User can now access all admin features!');
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

grantSuperAdmin();
