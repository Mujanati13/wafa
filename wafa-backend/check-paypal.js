import mongoose from 'mongoose';
import PaypalSettings from './models/paypalSettingsModel.js';
import dotenv from 'dotenv';

dotenv.config();

const checkPayPalSettings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const settings = await PaypalSettings.findOne();
    
    if (!settings) {
      console.log('❌ No PayPal settings found in database');
    } else {
      console.log('✅ PayPal Settings found:');
      console.log('-----------------------------------');
      console.log('Client ID:', settings.clientId ? `${settings.clientId.substring(0, 20)}...` : 'NOT SET');
      console.log('Client ID Length:', settings.clientId?.length || 0);
      console.log('Client Secret:', settings.clientSecret ? `${settings.clientSecret.substring(0, 10)}...` : 'NOT SET');
      console.log('Client Secret Length:', settings.clientSecret?.length || 0);
      console.log('Mode:', settings.mode);
      console.log('Is Active:', settings.isActive);
      console.log('Currency:', settings.currency);
      console.log('Merchant Email:', settings.merchantEmail || 'NOT SET');
      console.log('-----------------------------------');
      
      // Check if they're placeholder values
      if (settings.clientId === 'your_paypal_client_id' || settings.clientSecret === 'your_paypal_client_secret') {
        console.log('⚠️  WARNING: Using placeholder credentials!');
      }
      
      // Full details (be careful with secrets!)
      console.log('\nFull Settings (masked):');
      console.log(JSON.stringify({
        ...settings.toObject(),
        clientSecret: settings.clientSecret ? '***MASKED***' : 'NOT SET'
      }, null, 2));
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPayPalSettings();
