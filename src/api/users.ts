import express from "express";
import { getUser } from "../lib/firebase-db";

const router = express.Router();

// API: Get current User
router.get("/:id", async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy thông tin thành viên!" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tải thông tin thành viên." });
  }
});

export default router;
