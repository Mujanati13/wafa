import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
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
    const { userId, userIds, title, message, link, type, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    // Support both single userId and multiple userIds
    const targetUserIds = userIds || (userId ? [userId] : []);

    if (targetUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one user ID is required"
      });
    }

    try {
      const notifications = targetUserIds.map(id => ({
        userId: id,
        type: type || "system",
        title,
        message,
        link: link || null,
        priority: priority || "normal"
      }));

      const result = await Notification.insertMany(notifications);

      res.status(201).json({
        success: true,
        message: `Notification sent successfully to ${result.length} user(s)`,
        count: result.length,
        data: result
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
