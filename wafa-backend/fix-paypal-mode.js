import mongoose from 'mongoose';
import PaypalSettings from './models/paypalSettingsModel.js';
import dotenv from 'dotenv';

dotenv.config();

const fixPayPalMode = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const settings = await PaypalSettings.findOne();
    
    if (!settings) {
      console.log('❌ No PayPal settings found');
      process.exit(1);
    }

    console.log('Current mode:', settings.mode);
    console.log('\n🔧 Changing mode to: sandbox');
    
    settings.mode = 'sandbox';
    await settings.save();
    
    console.log('✅ Mode updated successfully to: sandbox');
    console.log('\n⚠️  Make sure your Client ID and Client Secret are from:');
    console.log('   https://developer.paypal.com/dashboard/applications/sandbox');
    console.log('\n💡 If you want to use production mode, you need to:');
    console.log('   1. Get Live credentials from PayPal');
    console.log('   2. Update them in the admin panel');
    console.log('   3. Change mode back to "production"');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixPayPalMode();
