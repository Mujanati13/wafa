import Feedback from "../models/feedbackModel.js";
import asyncHandler from "../handlers/asyncHandler.js";

// @desc    Get all feedbacks (admin)
// @route   GET /api/feedbacks/admin
// @access  Private/Admin
export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find().sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: feedbacks.length,
    data: feedbacks,
  });
});

// @desc    Get approved feedbacks (public)
// @route   GET /api/feedbacks
// @access  Public
export const getApprovedFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ isApproved: true }).sort({
    isFeatured: -1,
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: feedbacks.length,
    data: feedbacks,
  });
});

// @desc    Get single feedback
// @route   GET /api/feedbacks/:id
// @access  Private/Admin
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error("Feedback not found");
  }

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

// @desc    Create new feedback
// @route   POST /api/feedbacks
// @access  Private/Admin
export const createFeedback = asyncHandler(async (req, res) => {
  const { name, role, message, rating, imageUrl, isApproved, isFeatured, order } = req.body;

  const feedback = await Feedback.create({
    name,
    role,
    message,
    rating,
    imageUrl,
    isApproved,
    isFeatured,
    order,
  });

  res.status(201).json({
    success: true,
    message: "Feedback created successfully",
    data: feedback,
  });
});

// @desc    Update feedback
// @route   PUT /api/feedbacks/:id
// @access  Private/Admin
export const updateFeedback = asyncHandler(async (req, res) => {
  let feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error("Feedback not found");
  }

  feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Feedback updated successfully",
    data: feedback,
  });
});

// @desc    Delete feedback
// @route   DELETE /api/feedbacks/:id
// @access  Private/Admin
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error("Feedback not found");
  }

  await feedback.deleteOne();

  res.status(200).json({
    success: true,
    message: "Feedback deleted successfully",
  });
});

// @desc    Toggle feedback approval
// @route   PATCH /api/feedbacks/:id/approve
// @access  Private/Admin
export const toggleApproval = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error("Feedback not found");
  }

  feedback.isApproved = !feedback.isApproved;
  await feedback.save();

  res.status(200).json({
    success: true,
    message: `Feedback ${feedback.isApproved ? "approved" : "unapproved"}`,
    data: feedback,
  });
});

// @desc    Toggle feedback featured status
// @route   PATCH /api/feedbacks/:id/feature
// @access  Private/Admin
export const toggleFeatured = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error("Feedback not found");
  }

  feedback.isFeatured = !feedback.isFeatured;
  await feedback.save();

  res.status(200).json({
    success: true,
    message: `Feedback ${feedback.isFeatured ? "featured" : "unfeatured"}`,
    data: feedback,
  });
});
