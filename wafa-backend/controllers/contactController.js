import Contact from "../models/contactModel.js";
import { sendContactNotification } from "../utils/emailService.js";
import asyncHandler from "../handlers/asyncHandler.js";

export const contactController = {
  // Create new contact message
  create: asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userId = req.user?._id || null;

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      userId,
      status: "pending",
      priority: "medium",
    });

    // Send notification email to admin
    try {
      await sendContactNotification({ name, email, subject, message });
    } catch (emailError) {
      console.error("Error sending contact notification:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully. We will get back to you soon!",
      data: contact,
    });
  }),

  // Get all contact messages (admin only)
  getAll: asyncHandler(async (req, res) => {
    const { status, priority, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contacts = await Contact.find(query)
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  }),

  // Get single contact message
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await Contact.findById(id).populate(
      "userId",
      "username email"
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  }),

  // Update contact status (admin only)
  updateStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, priority, adminNotes } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    if (adminNotes !== undefined) contact.adminNotes = adminNotes;

    await contact.save();

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      data: contact,
    });
  }),

  // Delete contact message
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  }),

  // Get user's own contact messages
  getMyMessages: asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const contacts = await Contact.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: contacts,
    });
  }),
};
