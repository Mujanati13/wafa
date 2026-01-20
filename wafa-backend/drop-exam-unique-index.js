import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from multiple possible locations
dotenv.config(); // Try current directory
dotenv.config({ path: path.join(__dirname, '..', '.env') }); // Try parent directory

const dropExamUniqueIndex = async () => {
    try {
        // Get MongoDB URL from environment, or use defaults based on environment
        let MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;
        
        // If no environment variable found, use default URLs
        if (!MONGO_URL) {
            // Check if we're likely in a Docker environment (has docker-compose.yml in parent)
            const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV;
            
            if (isDocker) {
                // Docker environment - connect to mongodb container
                MONGO_URL = 'mongodb://admin:changeme123@mongodb:27017/wafa?authSource=admin';
                console.log('⚠️  Using Docker default MongoDB URL');
            } else {
                // VPS/Host environment - connect to localhost
                MONGO_URL = 'mongodb://admin:changeme123@localhost:27017/wafa?authSource=admin';
                console.log('⚠️  Using localhost default MongoDB URL');
            }
            
            console.log('💡 To use a custom URL, set MONGO_URL environment variable');
            console.log('   Example: MONGO_URL="mongodb://..." node drop-exam-unique-index.js\n');
        }
        
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URL);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('examparyears');

        // List all collections to verify the name
        const collections = await db.listCollections().toArray();
        console.log('\n📁 Available collections:');
        collections.forEach(col => console.log('  -', col.name));

        // Get existing indexes
        console.log('\n📋 Current indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log('  -', index.name, JSON.stringify(index.key));
        });

        // Drop the compound unique index if it exists
        try {
            await collection.dropIndex('name_1_moduleId_1_year_1');
            console.log('\n✅ Successfully dropped compound unique index: name_1_moduleId_1_year_1');
        } catch (error) {
            if (error.code === 27) {
                console.log('\n⚠️  Index name_1_moduleId_1_year_1 does not exist (already dropped or never existed)');
            } else {
                throw error;
            }
        }

        // Drop the unique index on name field if it exists
        try {
            const nameIndex = indexes.find(idx => idx.name === 'name_1');
            if (nameIndex && nameIndex.unique) {
                await collection.dropIndex('name_1');
                console.log('✅ Successfully dropped unique index on name field: name_1');
            }
        } catch (error) {
            if (error.code === 27) {
                console.log('⚠️  Index name_1 does not exist');
            } else {
                throw error;
            }
        }

        // Check for any other unique indexes on name field
        const remainingIndexes = await collection.indexes();
        console.log('\n📋 Remaining indexes:');
        remainingIndexes.forEach(index => {
            console.log('  -', index.name, JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
        });

        console.log('\n✅ Index cleanup complete! You can now create exams with duplicate names.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

dropExamUniqueIndex();
