import express from "express";
import { 
  getUserNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification 
} from "../lib/firebase-db.js";

const router = express.Router();

// API: Get user notifications
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await getUserNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "Lỗi tải thông báo." });
  }
});

// API: Mark specific notification as read
router.post("/read", async (req, res) => {
  const { notificationId, userId } = req.body;
  try {
    await markNotificationRead(notificationId, userId);
    const notifications = await getUserNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "Lỗi đọc thông báo." });
  }
});

// API: Mark all user notifications as read
router.post("/read-all", async (req, res) => {
  const { userId } = req.body;
  try {
    await markAllNotificationsRead(userId);
    const notifications = await getUserNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "Lỗi đọc tất cả thông báo." });
  }
});

// API: Delete specific notification
router.post("/delete", async (req, res) => {
  const { notificationId, userId } = req.body;
  try {
    await deleteNotification(notificationId, userId);
    const notifications = await getUserNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "Lỗi xóa thông báo." });
  }
});

export default router;
