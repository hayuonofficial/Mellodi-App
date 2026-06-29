import express from "express";
import { createEducationConsultation, EducationConsultation } from "../lib/firebase-db";

const router = express.Router();

// API: Education - Register Consultation
router.post("/register", async (req, res) => {
  let { name, email, phone } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string"
  ) {
    return res.status(400).json({ error: "Dữ liệu đăng ký không hợp lệ! Vui lòng nhập đầy đủ." });
  }

  name = name.trim();
  email = email.trim().toLowerCase();
  phone = phone.trim();

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ tất cả các thông tin!" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Địa chỉ email không hợp lệ!" });
  }

  try {
    const newConsultation: EducationConsultation = {
      id: `edu-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    await createEducationConsultation(newConsultation);

    res.json({ success: true, message: "Đăng ký nhận tư vấn du học Hàn Quốc thành công! Đội ngũ Mellodi & J2H2 Global sẽ liên hệ với bạn trong thời gian sớm nhất." });
  } catch (error) {
    console.error("Education registration error:", error);
    res.status(500).json({ error: "Lỗi hệ thống đăng ký nhận tư vấn." });
  }
});

export default router;
