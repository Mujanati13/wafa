import Notification from "../models/notificationModel.js";
import asyncHandler from "../handlers/asyncHandler.js";

export const NotificationController = {
  // Get all notifications for the authenticated user
  getNotifications: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, read } = req.query;
    const userId = req.user._id;

    const query = { userId };
    if (read !== undefined) {
      query.read = read === "true";
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  }),

  // Get unread notification count
  getUnreadCount: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({
      success: true,
      data: { count },
    });
  }),

  // Mark a notification as read
  markAsRead: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  }),

  // Mark all notifications as read
  markAllAsRead: asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: { modifiedCount: result.modifiedCount },
    });
  }),

  // Delete a notification
  deleteNotification: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  }),

  // Helper function to create a notification (can be called from other controllers)
  createNotification: async (userId, type, title, message, link = null) => {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        link,
      });
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  // Admin: Send system notification to specific user
  sendSystemNotification: asyncHandler(async (req, res) => {
    const { userId, title, message, link } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "User ID, title, and message are required"
      });
    }

    try {
      const notification = await Notification.create({
        userId,
        type: "system",
        title,
        message,
        link: link || null
      });

      res.status(201).json({
        success: true,
        message: "System notification sent successfully",
        data: notification
      });
    } catch (error) {
      console.error("Error sending system notification:", error);
      res.status(500).json({
        success: false,
        message: "Error sending notification"
      });
    }
  }),

  // Admin: Send notification to all users
  sendBroadcastNotification: asyncHandler(async (req, res) => {
    const { title, message, link, excludeUserIds } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    try {
      const User = require("../models/userModel.js").default;
      const users = await User.find({ _id: { $nin: excludeUserIds || [] } }).select("_id");

      const notifications = users.map(user => ({
        userId: user._id,
        type: "system",
        title,
        message,
        link: link || null
      }));

      const result = await Notification.insertMany(notifications);

      res.status(201).json({
        success: true,
        message: `Broadcast notification sent to ${result.length} users`,
        count: result.length
      });
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      res.status(500).json({
        success: false,
        message: "Error sending broadcast notification"
      });
    }
  })
};
