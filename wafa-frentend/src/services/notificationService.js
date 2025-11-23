import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const notificationService = {
  // Get all notifications with pagination
  getNotifications: async (page = 1, limit = 20, read = undefined) => {
    try {
      const params = { page, limit };
      if (read !== undefined) {
        params.read = read;
      }
      const { data } = await axios.get(`${API_URL}/notifications`, {
        params,
        withCredentials: true,
      });
      return data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/notifications/unread-count`, {
        withCredentials: true,
      });
      return data;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const { data } = await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const { data } = await axios.delete(
        `${API_URL}/notifications/${notificationId}`,
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};
