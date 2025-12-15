import mongoose from 'mongoose';

const privacyPolicySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    default: ''
  },
  termsOfUse: {
    type: String,
    default: ''
  },
  termsLastUpdatedAt: {
    type: Date,
    default: null
  },
  termsLastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Ensure only one document exists
privacyPolicySchema.statics.getPolicy = async function() {
  let policy = await this.findOne();
  if (!policy) {
    policy = await this.create({ content: '' });
  }
  return policy;
};

const PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);

export default PrivacyPolicy;
