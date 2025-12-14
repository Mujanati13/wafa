import PrivacyPolicy from '../models/privacyPolicyModel.js';
import asyncHandler from '../handlers/asyncHandler.js';

// @desc    Get privacy policy
// @route   GET /api/settings/privacy-policy
// @access  Public
export const getPrivacyPolicy = asyncHandler(async (req, res) => {
  const policy = await PrivacyPolicy.getPolicy();
  
  res.status(200).json({
    success: true,
    data: policy
  });
});

// @desc    Update privacy policy
// @route   PUT /api/settings/privacy-policy
// @access  Private/Admin
export const updatePrivacyPolicy = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Le contenu est requis'
    });
  }

  let policy = await PrivacyPolicy.findOne();
  
  if (!policy) {
    policy = await PrivacyPolicy.create({
      content,
      lastUpdatedBy: req.user._id
    });
  } else {
    policy.content = content;
    policy.lastUpdatedBy = req.user._id;
    await policy.save();
  }

  res.status(200).json({
    success: true,
    message: 'Politique de confidentialité mise à jour avec succès',
    data: policy
  });
});
